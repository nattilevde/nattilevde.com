import * as THREE from "three";
import { buildEnvironment } from "./environment.js";
import { createSoundscape } from "./audio.js";
import {
  REGION,
  sites,
  canWalk,
  terrainHeight,
  cellAt,
  REGION_GATEWAYS,
  REST_SPOTS,
  stepBoat,
} from "./world.js";

export function createGame(
  container,
  { initial, onUpdate, onDiscover, onInteract, onMoment, onEvent, onError },
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
  const rested = new Set(initial.moments || []);
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
    sound = false;
  const soundscape = createSoundscape();
  let touchMove = { x: 0, y: 0 },
    pointer = null,
    viewReady = false,
    timeMode = "day";
  let sitting = null,
    satFor = 0,
    nearestRest = null,
    nearestStop = null;
  let rain = 0,
    rainTarget = 0,
    weatherIn = 55 + Math.random() * 70;
  let boatHeading = 0,
    boatSpeed = 0;
  // The largest slice of time one movement step may cover.
  const MAX_STEP = 0.05;
  let moveSpeed = 5.4;
  let invalidatedAt = performance.now();
  const cameraTarget = new THREE.Vector3(),
    desiredCamera = new THREE.Vector3();
  const dayColor = new THREE.Color("#bfd8ce"),
    nightColor = new THREE.Color("#172a3a"),
    rainColor = new THREE.Color("#8ea7a8");
  let viewDistance = 13,
    viewPitch = 0.43;

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
    if (paused || riding) return;
    if (sitting) return stand();
    if (nearest) onInteract(nearest.id);
    else if (nearestRest) sit();
  }
  function sit() {
    if (paused || riding || boating || !nearestRest) return false;
    sitting = nearestRest;
    satFor = 0;
    // Settle onto the seat and turn to the view it was placed for.
    position.set(sitting.x, terrainHeight(sitting.x, sitting.z), sitting.z);
    player.position.copy(position);
    player.rotation.y = sitting.face;
    yaw = sitting.face;
    velocity.set(0, 0);
    clearInput();
    publish();
    return true;
  }
  function stand() {
    if (!sitting) return false;
    sitting = null;
    publish();
    return true;
  }
  // Fast travel: the naadan bus drops you anywhere the journey has opened up.
  function travelTo(destination) {
    if (
      !destination ||
      !Number.isFinite(destination.x) ||
      !Number.isFinite(destination.z) ||
      !canWalk(destination.x, destination.z) ||
      riding ||
      boating
    )
      return false;
    sitting = null;
    position.set(
      destination.x,
      terrainHeight(destination.x, destination.z),
      destination.z,
    );
    player.position.copy(position);
    velocity.set(0, 0);
    clearInput();
    viewReady = false;
    chime();
    publish();
    return true;
  }
  const nearScooter = () =>
    !boating &&
    Math.hypot(
      position.x - scooter.position.x,
      position.z - scooter.position.z,
    ) < 4;
  function ride() {
    if (paused || boating || sitting) return false;
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
  // One fixed step of player movement: read the controls, move the body, and
  // report how far it turned this step (the scooter leans by it).
  function integrate(dt) {
    const inputX = sitting
      ? 0
      : Number(keys.has("KeyD") || keys.has("ArrowRight")) -
        Number(keys.has("KeyA") || keys.has("ArrowLeft")) +
        touchMove.x;
    const inputZ = sitting
      ? 0
      : Number(keys.has("KeyS") || keys.has("ArrowDown")) -
        Number(keys.has("KeyW") || keys.has("ArrowUp")) +
        touchMove.y;
    if (sitting && (keys.size || Math.hypot(touchMove.x, touchMove.y) > 0.2))
      stand();
    const magnitude = Math.max(1, Math.hypot(inputX, inputZ));
    moveSpeed = riding
      ? 17.5
      : sprint || keys.has("ShiftLeft") || keys.has("ShiftRight")
        ? 10
        : 5.4;
    let turned = 0;
    if (boating) {
      // A paddled canoe: steer with A/D, paddle with W/S, and glide when you stop.
      const next = stepBoat({
        heading: boatHeading,
        speed: boatSpeed,
        turn: inputX,
        thrust: -inputZ,
        dt,
      });
      boatHeading = next.heading;
      boatSpeed = next.speed;
      velocity.set(next.dx, next.dz);
      const wantX = position.x + next.dx * dt;
      const wantZ = position.z + next.dz * dt;
      const nx = THREE.MathUtils.clamp(wantX, 32, 44);
      const nz = THREE.MathUtils.clamp(wantZ, 7, 135);
      // Nudging a bank scrubs off way rather than pinning you against it.
      if (nx !== wantX || nz !== wantZ) boatSpeed *= 0.35;
      position.x = nx;
      position.z = nz;
      player.rotation.y = boatHeading;
      moving = Math.abs(boatSpeed) > 0.25;
    } else {
      const vx =
        ((inputX * Math.cos(yaw) + inputZ * Math.sin(yaw)) / magnitude) *
        moveSpeed;
      const vz =
        ((-inputX * Math.sin(yaw) + inputZ * Math.cos(yaw)) / magnitude) *
        moveSpeed;
      velocity.lerp(new THREE.Vector2(vx, vz), 1 - Math.exp(-12 * dt));
      const nx = position.x + velocity.x * dt,
        nz = position.z + velocity.y * dt;
      if (canWalk(nx, position.z)) position.x = nx;
      if (canWalk(position.x, nz)) position.z = nz;
      moving = velocity.length() > 0.25;
    }
    position.y = boating ? 0.15 : terrainHeight(position.x, position.z);
    if (moving && !boating) {
      const target = Math.atan2(-velocity.x, -velocity.y);
      turned =
        Math.atan2(
          Math.sin(target - player.rotation.y),
          Math.cos(target - player.rotation.y),
        ) * Math.min(1, dt * (riding ? 9 : 12));
      player.rotation.y += turned;
    }
    return turned;
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

  const chime = () => soundscape.chime();
  const playBeat = () => soundscape.beat();

  async function setSound(value) {
    sound = value;
    const ok = await soundscape.enable(value);
    if (!ok) {
      sound = false;
      return false;
    }
    if (value) soundscape.setMaster(paused ? 0 : 0.9);
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
      sitting: sitting?.id || null,
      restSpot: !sitting && nearestRest ? nearestRest.id : null,
      busStop: nearestStop?.id || null,
      rain,
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
    // Real time since the last frame. Capped so a long stall (a background tab,
    // a slow first paint) cannot ask for hundreds of catch-up steps at once.
    const frameTime = Math.min((now - previous) / 1000, 0.25);
    const dt = frameTime;
    previous = now;
    if (paused && now - invalidatedAt > 1800) return;
    if (!paused) {
      elapsed += dt;
      // Weather drifts between clear spells and short monsoon showers.
      weatherIn -= dt;
      if (weatherIn <= 0) {
        rainTarget = rainTarget > 0.05 ? 0 : 0.55 + Math.random() * 0.45;
        weatherIn =
          rainTarget > 0.05 ? 26 + Math.random() * 24 : 70 + Math.random() * 90;
        if (rainTarget > 0.05) onEvent?.("rain-start");
        else if (rain > 0.05) onEvent?.("rain-stop");
      }
      rain = THREE.MathUtils.lerp(rain, rainTarget, Math.min(1, dt * 1.3));
      if (sitting) {
        satFor += dt;
        if (satFor > 3.2 && !rested.has(sitting.id)) {
          rested.add(sitting.id);
          chime();
          onMoment?.(sitting.id);
        }
        yaw += dt * 0.075;
      }
      // Movement advances in fixed steps of at most MAX_STEP, as many as the
      // frame needs. A step that small cannot tunnel through a wall, and running
      // several of them ties the player's speed to real time rather than to the
      // frame rate — so the world plays at the same pace under a software
      // renderer or on a weak phone as it does on a fast GPU.
      let turn = 0;
      for (let budget = frameTime; budget > 0; ) {
        const step = Math.min(budget, MAX_STEP);
        budget -= step;
        turn = integrate(step);
      }
      player.position.copy(position);
      if (riding) player.position.y += 0.55;
      if (sitting) {
        player.position.y -= 0.5;
        player.rotation.y = sitting.face;
      }
      playerLimbs.forEach((limb, i) => {
        limb.rotation.x = riding
          ? i < 2
            ? -1.05
            : -0.55
          : sitting
            ? i < 2
              ? -1.5
              : -0.18 + Math.sin(elapsed * 0.7) * 0.05
            : moving && !boating
              ? Math.sin(elapsed * (moveSpeed > 6 ? 14 : 9)) *
                (i % 2 ? -1 : 1) *
                0.5
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
      nearestRest =
        REST_SPOTS.find(
          (s) => Math.hypot(position.x - s.x, position.z - s.z) < 4.2,
        ) || null;
      nearestStop =
        REGION_GATEWAYS.find(
          (s) => Math.hypot(position.x - s.x, position.z - s.z) < 7,
        ) || null;
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
      environment.update(elapsed, dt, night, {
        rain,
        x: position.x,
        z: position.z,
        rowing: boating ? Math.min(1, Math.abs(boatSpeed) / 3.4) : 0,
      });
      if (sound)
        soundscape.update({
          x: position.x,
          z: position.z,
          yaw,
          night: night ? 1 : 0,
          rain,
          boating,
          speed: Math.abs(boatSpeed),
          moving,
          stand: nearestStop,
        });
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
    if (rain > 0.01) scene.background.lerp(rainColor, rain * 0.55);
    scene.fog.color.copy(scene.background);
    scene.fog.density = 0.004 + rain * 0.006;
    sun.intensity *= 1 - rain * 0.5;
    hemisphere.intensity *= 1 - rain * 0.25;
    sun.color.set(night ? "#acc8ed" : "#ffe5b6");
    sun.position.set(position.x - 45, position.y + 65, position.z + 30);
    sun.target.position.copy(position);
    // Sitting eases the camera into a low, close, slowly drifting view.
    viewDistance = THREE.MathUtils.lerp(
      viewDistance,
      sitting ? 5.6 : distance,
      Math.min(1, dt * 1.6),
    );
    viewPitch = THREE.MathUtils.lerp(
      viewPitch,
      sitting ? 0.22 : pitch,
      Math.min(1, dt * 1.6),
    );
    cameraTarget.set(
      position.x,
      position.y + (sitting ? 1.15 : 1.65),
      position.z,
    );
    desiredCamera.set(
      position.x + Math.sin(yaw) * viewDistance * Math.cos(viewPitch),
      position.y + 2 + Math.sin(viewPitch) * viewDistance,
      position.z + Math.cos(yaw) * viewDistance * Math.cos(viewPitch),
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
      if (sound) soundscape.setMaster(value ? 0 : 0.9);
      if (!value) canvas.focus({ preventScroll: true });
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
    bell: () => soundscape.bell(),
    interact: interaction,
    ride,
    sit,
    stand,
    travelTo,
    board() {
      if (riding || sitting) return false;
      if (!boating && Math.hypot(position.x - 24, position.z - 5) > 13)
        return false;
      boating = !boating;
      boatSpeed = 0;
      if (boating) {
        // Binu points the bow up the reach, so W paddles into open water.
        boatHeading = Math.PI;
        player.rotation.y = boatHeading;
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
      soundscape.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
