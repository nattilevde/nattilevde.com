import * as THREE from "three";
import { buildEnvironment } from "./environment.js";
import { REGION, sites, canWalk, terrainHeight, cellAt } from "./world.js";

export function createGame(
  container,
  { initial, onUpdate, onDiscover, onInteract, onError },
) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor("#b9d7ce");
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute(
    "aria-label",
    "Playable Kerala world. WASD or arrow keys to move. Drag to look. E to interact.",
  );
  container.appendChild(canvas);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#bfd8ce");
  scene.fog = new THREE.FogExp2("#bfd8ce", 0.004);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.2, 620);
  const hemisphere = new THREE.HemisphereLight("#d4e9e4", "#6c7651", 2.6);
  scene.add(hemisphere);
  const sun = new THREE.DirectionalLight("#ffe5b6", 3.1);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, {
    left: -42,
    right: 42,
    top: 42,
    bottom: -42,
    near: 1,
    far: 180,
  });
  sun.shadow.bias = -0.001;
  sun.shadow.normalBias = 0.06;
  scene.add(sun, sun.target);
  const environment = buildEnvironment(scene);
  const { player, playerLimbs, canoe, scooter, scooterWheels, beacons } =
    environment;
  const position = new THREE.Vector3(initial.position.x, 0, initial.position.z);
  const velocity = new THREE.Vector2();
  const keys = new Set();
  const discovered = new Set(initial.discoveries);
  const cells = new Set(initial.cells);
  discovered.forEach((id) => {
    const beacon = beacons.get(id);
    if (beacon) beacon.visible = false;
  });
  if (initial.scooter) {
    scooter.position.set(
      initial.scooter.x,
      terrainHeight(initial.scooter.x, initial.scooter.z),
      initial.scooter.z,
    );
  }
  let paused = true,
    disposed = false,
    yaw = 0,
    pitch = 0.43,
    distance = 13,
    frame = 0,
    elapsed = 0,
    previous = performance.now(),
    lastPublish = 0;
  let nearest = null,
    moving = false,
    boating = false,
    riding = false,
    sprint = false,
    night = false,
    sound = false,
    audio = null,
    audioGain = null;
  let touchMove = { x: 0, y: 0 },
    pointer = null,
    viewReady = false,
    timeMode = "day";
  let invalidatedAt = performance.now();
  let lastDrum = 0;
  const cameraTarget = new THREE.Vector3(),
    desiredCamera = new THREE.Vector3();
  const dayColor = new THREE.Color("#bfd8ce"),
    nightColor = new THREE.Color("#172a3a");

  function resize() {
    const { width, height } = container.getBoundingClientRect();
    renderer.setSize(width, height);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
    invalidatedAt = performance.now();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();
  const clearInput = () => {
    keys.clear();
    touchMove = { x: 0, y: 0 };
    velocity.set(0, 0);
    pointer = null;
  };
  function interaction() {
    if (!paused && nearest && !riding) onInteract(nearest.id);
  }
  const nearScooter = () =>
    !boating &&
    Math.hypot(position.x - scooter.position.x, position.z - scooter.position.z) <
      4;
  function ride() {
    if (paused || boating) return false;
    if (riding) {
      riding = false;
      scooter.position.set(
        position.x + Math.sin(player.rotation.y + 1.5) * 1.1,
        terrainHeight(position.x, position.z),
        position.z + Math.cos(player.rotation.y + 1.5) * 1.1,
      );
      scooter.rotation.set(0, player.rotation.y, 0.07);
    } else {
      if (!nearScooter()) return false;
      riding = true;
      scooter.rotation.z = 0;
      chime();
    }
    velocity.set(0, 0);
    publish();
    return true;
  }
  function keydown(e) {
    if (paused || e.target?.closest?.("button,input,dialog")) return;
    if (
      [
        "KeyW",
        "KeyA",
        "KeyS",
        "KeyD",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Space",
        "KeyE",
        "KeyR",
        "ShiftLeft",
        "ShiftRight",
      ].includes(e.code)
    )
      e.preventDefault();
    keys.add(e.code);
    if (e.code === "KeyE" && !e.repeat) interaction();
    if (e.code === "KeyR" && !e.repeat) ride();
  }
  const keyup = (e) => keys.delete(e.code);
  const pointerDown = (e) => {
    if (paused) return;
    canvas.focus({ preventScroll: true });
    canvas.setPointerCapture(e.pointerId);
    pointer = { id: e.pointerId, x: e.clientX, y: e.clientY };
  };
  const pointerMove = (e) => {
    if (pointer?.id !== e.pointerId || paused) return;
    yaw -= (e.clientX - pointer.x) * 0.005;
    pitch = THREE.MathUtils.clamp(
      pitch + (e.clientY - pointer.y) * 0.003,
      0.18,
      0.88,
    );
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  };
  const pointerUp = () => {
    pointer = null;
  };
  const wheel = (e) => {
    e.preventDefault();
    distance = THREE.MathUtils.clamp(distance + e.deltaY * 0.015, 6, 22);
  };
  const lost = (e) => {
    e.preventDefault();
    paused = true;
    onError(
      "The graphics context was interrupted. Return to the portal and re-enter to resume your saved journey.",
    );
  };
  window.addEventListener("keydown", keydown);
  window.addEventListener("keyup", keyup);
  window.addEventListener("blur", clearInput);
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", pointerUp);
  canvas.addEventListener("wheel", wheel, { passive: false });
  canvas.addEventListener("webglcontextlost", lost);

  function chime() {
    if (!sound || !audio) return;
    [523.25, 659.25, 783.99].forEach((frequency, i) => {
      const o = audio.createOscillator(),
        g = audio.createGain(),
        at = audio.currentTime + i * 0.1;
      o.type = "sine";
      o.frequency.value = frequency;
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(0.055, at + 0.025);
      g.gain.exponentialRampToValueAtTime(0.001, at + 0.65);
      o.connect(g).connect(audio.destination);
      o.start(at);
      o.stop(at + 0.7);
    });
  }
  function playBeat() {
    if (!sound || !audio) return;
    const oscillator = audio.createOscillator(),
      gain = audio.createGain(),
      at = audio.currentTime;
    oscillator.frequency.setValueAtTime(160, at);
    oscillator.frequency.exponentialRampToValueAtTime(55, at + 0.18);
    gain.gain.setValueAtTime(0.16, at);
    gain.gain.exponentialRampToValueAtTime(0.001, at + 0.24);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start();
    oscillator.stop(at + 0.25);
  }

  async function setSound(value) {
    sound = value;
    if (!value) {
      await audio?.suspend();
      return;
    }
    try {
      if (!audio) {
        audio = new (window.AudioContext || window.webkitAudioContext)();
        const buffer = audio.createBuffer(
            1,
            audio.sampleRate * 3,
            audio.sampleRate,
          ),
          data = buffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < data.length; i++) {
          last = (last + Math.random() * 0.04 - 0.02) / 1.03;
          data[i] = last;
        }
        const source = audio.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const filter = audio.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 550;
        audioGain = audio.createGain();
        audioGain.gain.value = paused ? 0 : 0.35;
        source.connect(filter).connect(audioGain).connect(audio.destination);
        source.start();
      }
      await audio.resume();
    } catch {
      sound = false;
      return false;
    }
    return true;
  }

  function publish() {
    onUpdate({
      x: position.x,
      z: position.z,
      heading: yaw,
      nearby: nearest?.id || null,
      boating,
      riding,
      nearScooter: nearScooter(),
      scooter: { x: scooter.position.x, z: scooter.position.z },
      night,
      moving,
      cells: [...cells],
    });
  }

  function tick(now) {
    if (disposed) return;
    frame = requestAnimationFrame(tick);
    const dt = Math.min((now - previous) / 1000, 0.05);
    previous = now;
    if (paused && now - invalidatedAt > 1800) return;
    if (!paused) {
      elapsed += dt;
      if (
        sound &&
        Math.hypot(position.x + 22, position.z + 25) < 30 &&
        elapsed - lastDrum > 0.55
      ) {
        playBeat();
        lastDrum = elapsed;
      }
      const inputX =
        Number(keys.has("KeyD") || keys.has("ArrowRight")) -
        Number(keys.has("KeyA") || keys.has("ArrowLeft")) +
        touchMove.x;
      const inputZ =
        Number(keys.has("KeyS") || keys.has("ArrowDown")) -
        Number(keys.has("KeyW") || keys.has("ArrowUp")) +
        touchMove.y;
      const magnitude = Math.max(1, Math.hypot(inputX, inputZ));
      const speed = boating
        ? 10
        : riding
          ? 17.5
          : sprint || keys.has("ShiftLeft") || keys.has("ShiftRight")
            ? 10
            : 5.4;
      const vx =
        ((inputX * Math.cos(yaw) + inputZ * Math.sin(yaw)) / magnitude) * speed;
      const vz =
        ((-inputX * Math.sin(yaw) + inputZ * Math.cos(yaw)) / magnitude) *
        speed;
      velocity.lerp(new THREE.Vector2(vx, vz), 1 - Math.exp(-12 * dt));
      const nx = position.x + velocity.x * dt,
        nz = position.z + velocity.y * dt;
      if (boating) {
        position.x = THREE.MathUtils.clamp(nx, 32, 44);
        position.z = THREE.MathUtils.clamp(nz, 7, 135);
      } else {
        if (canWalk(nx, position.z)) position.x = nx;
        if (canWalk(position.x, nz)) position.z = nz;
      }
      moving = velocity.length() > 0.25;
      position.y = boating ? 0.15 : terrainHeight(position.x, position.z);
      let turn = 0;
      if (moving) {
        const target = Math.atan2(-velocity.x, -velocity.y);
        turn =
          Math.atan2(
            Math.sin(target - player.rotation.y),
            Math.cos(target - player.rotation.y),
          ) * Math.min(1, dt * (riding ? 9 : 12));
        player.rotation.y += turn;
      }
      player.position.copy(position);
      if (riding) player.position.y += 0.55;
      playerLimbs.forEach((limb, i) => {
        limb.rotation.x = riding
          ? i < 2
            ? -1.05
            : -0.55
          : moving && !boating
            ? Math.sin(elapsed * (speed > 6 ? 14 : 9)) * (i % 2 ? -1 : 1) * 0.5
            : 0;
      });
      canoe.visible = boating;
      if (boating) {
        canoe.position.set(
          position.x,
          -0.1 + Math.sin(elapsed * 2) * 0.025,
          position.z,
        );
        canoe.rotation.y = player.rotation.y;
      }
      if (riding) {
        scooter.position.set(position.x, position.y + 0.02, position.z);
        scooter.rotation.y = player.rotation.y;
        scooter.rotation.z = THREE.MathUtils.lerp(
          scooter.rotation.z,
          moving ? THREE.MathUtils.clamp(turn * 6, -0.24, 0.24) : 0,
          Math.min(1, dt * 8),
        );
        const spin = moving ? velocity.length() * dt * 3.4 : 0;
        scooterWheels.forEach((tire) => {
          tire.rotation.x += spin;
        });
      }
      nearest =
        sites
          .filter(
            (s) =>
              Math.hypot(position.x - s.x, position.z - s.z) <
              (s.npc ? 5.5 : 6),
          )
          .sort(
            (a, b) =>
              Math.hypot(position.x - a.x, position.z - a.z) -
              Math.hypot(position.x - b.x, position.z - b.z),
          )[0] || null;
      sites.forEach((site) => {
        if (
          !discovered.has(site.id) &&
          Math.hypot(position.x - site.x, position.z - site.z) < site.radius
        ) {
          discovered.add(site.id);
          const beacon = beacons.get(site.id);
          if (beacon) beacon.visible = false;
          chime();
          onDiscover(site.id);
        }
      });
      for (let dx = -16; dx <= 16; dx += 16)
        for (let dz = -16; dz <= 16; dz += 16)
          cells.add(cellAt(position.x + dx, position.z + dz));
      night =
        timeMode === "night" || (timeMode === "cycle" && elapsed % 240 > 150);
      environment.update(elapsed, dt, night);
      if (now - lastPublish > 160) {
        publish();
        lastPublish = now;
      }
    }
    hemisphere.intensity = THREE.MathUtils.lerp(
      hemisphere.intensity,
      night ? 0.8 : 2.6,
      dt * 2,
    );
    sun.intensity = THREE.MathUtils.lerp(
      sun.intensity,
      night ? 0.6 : 3.1,
      dt * 2,
    );
    scene.background.lerp(night ? nightColor : dayColor, dt * 1.6);
    scene.fog.color.copy(scene.background);
    sun.color.set(night ? "#acc8ed" : "#ffe5b6");
    sun.position.set(position.x - 45, position.y + 65, position.z + 30);
    sun.target.position.copy(position);
    cameraTarget.set(position.x, position.y + 1.65, position.z);
    desiredCamera.set(
      position.x + Math.sin(yaw) * distance * Math.cos(pitch),
      position.y + 2 + Math.sin(pitch) * distance,
      position.z + Math.cos(yaw) * distance * Math.cos(pitch),
    );
    desiredCamera.y = Math.max(
      desiredCamera.y,
      terrainHeight(desiredCamera.x, desiredCamera.z) + 2,
    );
    // Shorten the camera boom when a wall would otherwise cover the character.
    for (let t = 0.15; t <= 1; t += 0.08) {
      const x = THREE.MathUtils.lerp(cameraTarget.x, desiredCamera.x, t),
        z = THREE.MathUtils.lerp(cameraTarget.z, desiredCamera.z, t);
      if (!canWalk(x, z) && x < 29 && x > -80) {
        desiredCamera.lerpVectors(
          cameraTarget,
          desiredCamera,
          Math.max(0.22, t - 0.1),
        );
        desiredCamera.y = Math.max(desiredCamera.y, position.y + 3);
        break;
      }
    }
    if (!viewReady) {
      camera.position.copy(desiredCamera);
      viewReady = true;
    } else camera.position.lerp(desiredCamera, 1 - Math.exp(-7 * dt));
    camera.lookAt(cameraTarget);
    renderer.render(scene, camera);
  }
  player.position.set(
    position.x,
    terrainHeight(position.x, position.z),
    position.z,
  );
  frame = requestAnimationFrame(tick);
  publish();

  return {
    setPaused(value) {
      paused = value;
      invalidatedAt = performance.now();
      clearInput();
      if (audioGain)
        audioGain.gain.setTargetAtTime(
          value ? 0 : 0.35,
          audio.currentTime,
          0.08,
        );
      if (!value) {
        if (sound) audio?.resume();
        canvas.focus({ preventScroll: true });
      }
    },
    setMove(x, y) {
      touchMove = { x, y };
    },
    setSprint(value) {
      sprint = value;
    },
    look(dx, dy) {
      yaw -= dx * 0.005;
      pitch = THREE.MathUtils.clamp(pitch + dy * 0.003, 0.18, 0.88);
    },
    setTime(value) {
      timeMode = value;
      night = value === "night";
      environment.update(elapsed, 0, night);
      invalidatedAt = performance.now();
    },
    setQuality(low) {
      renderer.setPixelRatio(low ? 1 : Math.min(window.devicePixelRatio, 1.6));
      renderer.shadowMap.enabled = !low;
      resize();
    },
    setSound,
    chime,
    playBeat,
    interact: interaction,
    ride,
    board() {
      if (riding) return false;
      if (!boating && Math.hypot(position.x - 24, position.z - 5) > 13)
        return false;
      boating = !boating;
      if (boating) {
        position.set(38, 0, 12);
      } else {
        if (Math.abs(position.z - 5) > 18) {
          boating = true;
          return false;
        }
        position.set(24, 0, 5);
      }
      publish();
      return true;
    },
    getPosition() {
      return boating ? { x: 24, z: 5 } : { x: position.x, z: position.z };
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", clearInput);
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointercancel", pointerUp);
      canvas.removeEventListener("wheel", wheel);
      canvas.removeEventListener("webglcontextlost", lost);
      audio?.close();
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
