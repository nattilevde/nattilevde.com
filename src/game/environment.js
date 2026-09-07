import * as THREE from "three";
import { buildings, sites, terrainHeight } from "./world.js";

export function buildEnvironment(scene) {
  const root = new THREE.Group();
  root.name = "Kerala coastal environment";
  scene.add(root);
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  const ownGeometry = (geometry) => (geometries.add(geometry), geometry);
  const material = (color, options = {}) => {
    const result = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.85,
      ...options,
    });
    materials.add(result);
    return result;
  };
  const box = ownGeometry(new THREE.BoxGeometry(1, 1, 1));
  const sphere = ownGeometry(new THREE.IcosahedronGeometry(1, 1));
  const cylinder = ownGeometry(new THREE.CylinderGeometry(1, 1, 1, 8));
  const cone = ownGeometry(new THREE.ConeGeometry(1, 1, 7));
  const plane = ownGeometry(new THREE.PlaneGeometry(1, 1));
  const m = {
    sand: material("#d9bd83"),
    earth: material("#a48a58"),
    grass: material("#88985c"),
    path: material("#e5cd9d"),
    verge: material("#b9b276"),
    wood: material("#694832"),
    darkWood: material("#3b3930"),
    trunk: material("#998264"),
    roof: material("#b85537"),
    roofLight: material("#d07a4e"),
    roofDark: material("#853f2d"),
    cream: material("#f4e4be"),
    leaf: material("#3c7851", { side: THREE.DoubleSide }),
    olive: material("#6d8a43"),
    leafLight: material("#91a854"),
    rock: material("#87928a"),
    rope: material("#b69761"),
    skin: material("#a96d48"),
    hair: material("#292b29"),
    orange: material("#ed873a"),
    trousers: material("#2d4245"),
    teal: material("#318b84"),
    rose: material("#b55663"),
    gold: material("#e7b957"),
    white: material("#eee4ca"),
    black: material("#252e2e"),
    glass: material("#426964", {
      roughness: 0.28,
      emissive: "#ffc879",
      emissiveIntensity: 0,
    }),
    lamp: material("#ffe4ac", { emissive: "#ffc171", emissiveIntensity: 0.25 }),
    lotus: material("#ec9eb0", { side: THREE.DoubleSide }),
  };
  let seed = 7391;
  const random = () =>
    (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
  const between = (a, b) => a + random() * (b - a);
  function mesh(
    parent,
    geometry,
    surface,
    x,
    y,
    z,
    sx = 1,
    sy = 1,
    sz = 1,
    shadow = false,
  ) {
    const object = new THREE.Mesh(geometry, surface);
    object.position.set(x, y, z);
    object.scale.set(sx, sy, sz);
    object.castShadow = shadow;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  const block = (parent, surface, x, y, z, sx, sy, sz, shadow = false) =>
    mesh(parent, box, surface, x, y, z, sx, sy, sz, shadow);
  function group(name, x = 0, y = 0, z = 0) {
    const object = new THREE.Group();
    object.name = name;
    object.position.set(x, y, z);
    root.add(object);
    return object;
  }
  function beam(parent, surface, a, b, radius = 0.06) {
    const start = new THREE.Vector3(...a);
    const end = new THREE.Vector3(...b);
    const object = mesh(
      parent,
      cylinder,
      surface,
      0,
      0,
      0,
      radius,
      start.distanceTo(end),
      radius,
    );
    object.position.copy(start).add(end).multiplyScalar(0.5);
    object.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      end.sub(start).normalize(),
    );
    return object;
  }

  // Batches share geometry/material and keep the large grove inexpensive to draw.
  const batches = new Map();
  const dummy = new THREE.Object3D();
  function instance(
    geometry,
    surface,
    x,
    y,
    z,
    sx,
    sy,
    sz,
    rx = 0,
    ry = 0,
    rz = 0,
  ) {
    const key = `${geometry.uuid}:${surface.uuid}:false`;
    if (!batches.has(key))
      batches.set(key, { geometry, surface, matrices: [] });
    dummy.position.set(x, y, z);
    dummy.rotation.set(rx, ry, rz);
    dummy.scale.set(sx, sy, sz);
    dummy.updateMatrix();
    batches.get(key).matrices.push(dummy.matrix.clone());
  }

  function ground(name, x0, x1, z0, z1, surface, offset = 0, step = 3) {
    const geometry = ownGeometry(
      new THREE.PlaneGeometry(
        x1 - x0,
        z1 - z0,
        Math.ceil((x1 - x0) / step),
        Math.ceil((z1 - z0) / step),
      ),
    );
    geometry.rotateX(-Math.PI / 2);
    geometry.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      positions.setY(
        i,
        terrainHeight(positions.getX(i), positions.getZ(i)) + offset,
      );
    }
    geometry.computeVertexNormals();
    const object = mesh(root, geometry, surface, 0, 0, 0);
    object.name = name;
    return object;
  }
  ground("Warm coastal sand", -84, 30, -150, 150, m.sand);
  ground("Village meadow", -62, 29.8, -150, 150, m.grass, 0.006);
  ground(
    "Far bank and walkable lookout hill",
    46,
    115,
    -150,
    150,
    m.grass,
    0,
    1.5,
  );
  ground("Main village road", -3.1, 6, -135, 139, m.path, 0.04);
  ground("Far bank footpath", 56.3, 59.7, -111, 139, m.path, 0.045, 1);
  for (const z of [0, -90]) {
    ground("Cross-village path", -75, 30, z - 2.6, z + 2.6, m.path, 0.045);
    ground("Far-bank crossing path", 46, 95, z - 2.6, z + 2.6, m.path, 0.045);
  }
  ground("Beach approach", -79, 0, 10.2, 13.8, m.path, 0.05);
  ground("Tea shop approach", -13.4, 0, 28.6, 31.4, m.path, 0.05);
  ground("Courtyard approach", -23, 0, -26.6, -23.4, m.path, 0.05);
  ground("Coir yard approach", 58, 63.9, -45, -39, m.path, 0.05);
  ground("Jetty approach", 0, 29.5, 3.5, 6.5, m.path, 0.055);
  ground("Lookout approach", 58, 84, 108.4, 111.6, m.path, 0.045, 0.6);
  ground("Lookout clearing", 76, 85, 106, 114, m.path, 0.035, 0.6);

  const waterTime = { value: 0 };
  const waterNight = { value: 0 };
  function water(name, width, depth, x, z, color, segments = 1) {
    const surface = material(color, { roughness: 0.32, metalness: 0.12 });
    surface.onBeforeCompile = (shader) => {
      shader.uniforms.uCoastTime = waterTime;
      shader.uniforms.uCoastNight = waterNight;
      shader.vertexShader =
        `uniform float uCoastTime; varying vec3 vCoastPosition;\n${shader.vertexShader}`.replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
          vCoastPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          transformed.y += sin(vCoastPosition.x * 0.48 + vCoastPosition.z * 0.32 + uCoastTime * 0.8) * 0.035;`,
        );
      shader.fragmentShader =
        `uniform float uCoastTime; uniform float uCoastNight; varying vec3 vCoastPosition;\n${shader.fragmentShader}`.replace(
          "#include <color_fragment>",
          `#include <color_fragment>
          float ripple = sin(vCoastPosition.x * 1.8 + sin(vCoastPosition.z * 0.7 + uCoastTime) * 1.6 + uCoastTime * 0.7);
          float glint = smoothstep(0.94, 1.0, ripple) * 0.16;
          diffuseColor.rgb += vec3(0.42, 0.65, 0.56) * glint * (1.0 - uCoastNight * 0.7);`,
        );
    };
    const geometry = ownGeometry(
      new THREE.PlaneGeometry(width, depth, segments, segments),
    );
    geometry.rotateX(-Math.PI / 2);
    const object = mesh(root, geometry, surface, x, -0.18, z);
    object.name = name;
    object.userData.animatedWater = true;
    return object;
  }
  water("Arabian Sea", 900, 1200, -534, 0, "#399eaa", 64);
  water("Turquoise backwater canal", 16, 310, 38, 0, "#399e91", 28);
  for (const x of [29.85, 46.15]) {
    block(root, m.earth, x, -0.28, 0, 0.3, 0.6, 300);
    ground("Soft canal bank", x - 0.65, x + 0.65, -148, 148, m.verge, 0.025);
  }
  const foamMaterial = material("#c9e5cc", {
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  });
  const foam = [];
  for (let i = 0; i < 3; i++) {
    const line = block(
      root,
      foamMaterial,
      -85.2 - i * 2.4,
      -0.095,
      0,
      0.3 + i * 0.14,
      0.012,
      300,
    );
    foam.push(line);
  }
  for (const z of [0, -90]) {
    const bridge = group("Timber canal bridge", 38, 0, z);
    block(bridge, m.wood, 0, -0.17, 0, 17.4, 0.34, 8.8, true);
    for (let x = -8.4; x <= 8.4; x += 0.6) {
      instance(box, m.rope, 38 + x, 0.015, z, 0.025, 0.025, 8.7);
    }
    for (const side of [-4.2, 4.2]) {
      for (let x = -8; x <= 8; x += 4) {
        block(bridge, m.darkWood, x, 0.62, side, 0.16, 1.3, 0.16, true);
      }
      block(bridge, m.wood, 0, 1.2, side, 17.3, 0.14, 0.14, true);
      block(bridge, m.rope, 0, 0.64, side, 17.3, 0.06, 0.06);
    }
  }

  // A hipped roof, not a cone: long ridge, four sloping faces, generous eaves.
  const roofGeometry = ownGeometry(new THREE.BufferGeometry());
  const roofPoints = [
    [-0.5, 0, -0.5],
    [0.5, 0, -0.5],
    [0.5, 0, 0.5],
    [-0.5, 0, 0.5],
    [0, 1, -0.28],
    [0, 1, 0.28],
  ];
  roofGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [0, 4, 1, 1, 4, 5, 1, 5, 2, 2, 5, 3, 3, 5, 4, 3, 4, 0].flatMap(
        (index) => roofPoints[index],
      ),
      3,
    ),
  );
  roofGeometry.computeVertexNormals();
  function roof(parent, x, y, z, width, depth, height) {
    mesh(
      parent,
      roofGeometry,
      m.roofDark,
      x,
      y - 0.12,
      z,
      width + 0.18,
      height,
      depth + 0.18,
      true,
    );
    mesh(parent, roofGeometry, m.roof, x, y, z, width, height, depth, true);
    block(parent, m.roofLight, x, y + height, z, 0.2, 0.15, depth * 0.58, true);
    for (const side of [-1, 1]) {
      block(
        parent,
        m.roofDark,
        x + (side * width) / 2,
        y - 0.1,
        z,
        0.14,
        0.22,
        depth,
      );
      for (let row = 1; row < 6; row++) {
        const t = row / 6;
        block(
          parent,
          row % 2 ? m.roofLight : m.roofDark,
          x + ((side * width) / 2) * (1 - t),
          y + height * t + 0.018,
          z,
          0.075,
          0.045,
          depth * (1 - 0.44 * t),
        );
      }
    }
  }
  function sign(parent, title, subtitle, x, y, z, width, yaw = 0) {
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    context.fillStyle = "#244d46";
    context.fillRect(0, 0, 768, 256);
    context.strokeStyle = "#dab778";
    context.lineWidth = 7;
    context.strokeRect(14, 14, 740, 228);
    context.textAlign = "center";
    context.fillStyle = "#fff0c7";
    context.font = "bold 58px Georgia, serif";
    context.fillText(title, 384, 111, 710);
    context.fillStyle = "#dec18a";
    context.font = "26px sans-serif";
    context.fillText(subtitle, 384, 178, 700);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    textures.add(texture);
    const surface = material("#ffffff", { map: texture, roughness: 1 });
    const object = mesh(parent, plane, surface, x, y, z, width, width / 3, 1);
    object.rotation.y = yaw;
    return object;
  }
  for (const building of buildings) {
    const { x, z, w, d, color, type } = building;
    const home = group(type || "Tiled village home", x, terrainHeight(x, z), z);
    const wall = material(color);
    const height = type === "pavilion" ? 3.5 : 3.1;
    block(home, m.earth, 0, 0.13, 0, w + 0.25, 0.26, d + 0.25, true);
    block(home, wall, 0, height / 2, 0, w, height, d, true);
    block(home, m.cream, 0, 0.42, 0, w + 0.04, 0.23, d + 0.04);
    roof(home, 0, height + 0.05, 0, w + 1.9, d + 1.9, 2.05);
    for (const side of [-1, 1]) {
      for (const offset of [-0.27, 0.27]) {
        block(
          home,
          m.darkWood,
          side * (w / 2 + 0.035),
          1.8,
          d * offset,
          0.12,
          1.4,
          1.25,
        );
        block(
          home,
          m.glass,
          side * (w / 2 + 0.105),
          1.8,
          d * offset,
          0.035,
          1.15,
          1.02,
        );
        block(
          home,
          m.cream,
          side * (w / 2 + 0.13),
          1.8,
          d * offset,
          0.04,
          0.065,
          1.08,
        );
        block(
          home,
          m.darkWood,
          w * offset,
          1.8,
          side * (d / 2 + 0.035),
          1.3,
          1.4,
          0.12,
        );
        block(
          home,
          m.glass,
          w * offset,
          1.8,
          side * (d / 2 + 0.105),
          1.05,
          1.15,
          0.035,
        );
      }
    }
    const east = x < 0;
    const front = type === "pavilion" ? 0 : east ? Math.PI / 2 : -Math.PI / 2;
    const veranda = new THREE.Group();
    veranda.rotation.y = front;
    home.add(veranda);
    const face = type === "pavilion" ? d / 2 : w / 2;
    const span = type === "pavilion" ? w : d;
    block(veranda, m.darkWood, 0, 1.1, face + 0.06, 1.2, 2.2, 0.16, true);
    block(veranda, m.sand, 0, 0.055, face + 0.85, span, 0.11, 1.7);
    roof(veranda, 0, 2.7, face + 0.65, span + 0.6, 2.6, 0.65);
    for (const side of [-1, 1]) {
      block(
        veranda,
        m.wood,
        side * (span / 2 - 0.4),
        1.35,
        face + 1.5,
        0.16,
        2.7,
        0.16,
        true,
      );
    }
    if (type === "shop") {
      sign(
        veranda,
        "LEELA'S CHAYA",
        "TEA  /  BANANA FRITTERS  /  GOOD COMPANY",
        0,
        2.65,
        face + 1.98,
        6.4,
      );
      block(veranda, m.wood, -2, 0.87, face + 0.95, 2.2, 0.15, 0.65, true);
      for (let i = 0; i < 4; i++) {
        mesh(
          veranda,
          cylinder,
          m.cream,
          -2.7 + i * 0.4,
          1.04,
          face + 0.95,
          0.08,
          0.2,
          0.08,
        );
      }
    } else if (type === "coir") {
      sign(
        veranda,
        "RADHA'S COIR",
        "COCONUT FIBRE  /  HANDSPUN ROPE",
        0,
        2.65,
        face + 1.98,
        6,
      );
    } else if (type === "pavilion") {
      sign(
        veranda,
        "THE RHYTHM COURTYARD",
        "VILLAGE REHEARSALS",
        0,
        2.65,
        face + 1.98,
        7,
      );
    }
  }

  function human(name, shirt = m.cream, lower = m.trousers, backpack = false) {
    const person = group(name);
    const limbs = [];
    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.17, 0.87, 0);
      person.add(pivot);
      block(pivot, lower, 0, -0.37, 0, 0.25, 0.74, 0.28, true);
      block(pivot, m.darkWood, 0, -0.79, -0.06, 0.27, 0.16, 0.4, true);
      limbs.push(pivot);
    }
    block(person, shirt, 0, 1.22, 0, 0.66, 0.74, 0.39, true);
    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.43, 1.52, 0);
      person.add(pivot);
      block(pivot, shirt, 0, -0.15, 0, 0.22, 0.34, 0.27, true);
      block(pivot, m.skin, 0, -0.43, 0, 0.18, 0.3, 0.2, true);
      limbs.push(pivot);
    }
    mesh(person, cylinder, m.skin, 0, 1.63, 0, 0.11, 0.17, 0.11, true);
    mesh(person, sphere, m.skin, 0, 1.85, -0.01, 0.26, 0.29, 0.25, true);
    mesh(person, sphere, m.hair, 0, 2.01, 0.025, 0.265, 0.14, 0.25, true);
    mesh(person, sphere, m.skin, 0, 1.84, -0.25, 0.055, 0.07, 0.07);
    for (const side of [-1, 1]) {
      mesh(
        person,
        sphere,
        m.black,
        side * 0.095,
        1.9,
        -0.226,
        0.022,
        0.027,
        0.015,
      );
    }
    if (backpack) {
      block(person, m.wood, 0, 1.25, 0.29, 0.47, 0.53, 0.26, true);
      block(person, m.gold, 0, 1.1, 0.44, 0.33, 0.18, 0.045);
      for (const side of [-1, 1])
        block(person, m.rope, side * 0.23, 1.28, -0.207, 0.06, 0.58, 0.035);
    }
    return { person, limbs };
  }
  const { person: player, limbs: playerLimbs } = human(
    "Player",
    m.orange,
    m.trousers,
    true,
  );
  player.position.set(0, 0, 76);
  function resident(name, x, z, shirt, yaw, skirt = false) {
    const result = human(name, shirt, m.cream);
    result.person.position.set(x, terrainHeight(x, z), z);
    result.person.rotation.y = yaw;
    result.person.userData.npc = name;
    if (skirt)
      mesh(result.person, cylinder, shirt, 0, 0.48, 0, 0.4, 0.86, 0.33, true);
    return result;
  }
  resident("Leela", -11.8, 32, m.rose, -Math.PI / 2, true);
  resident("Binu", 25, 7.5, m.teal, -0.4);
  resident("Radha", 62, -44.2, m.gold, Math.PI / 2, true);
  resident("Hari", -19, -23, m.cream, -0.5);

  ground(
    "Packed-earth rehearsal courtyard",
    -29,
    -15,
    -28.5,
    -19,
    m.sand,
    0.055,
  );
  const drummers = [];
  for (let i = 0; i < 3; i++) {
    const drummer = resident(
      `Chenda drummer ${i + 1}`,
      -25 + i * 2.3,
      -26.5,
      i === 1 ? m.gold : m.cream,
      Math.PI,
    );
    const drum = mesh(
      drummer.person,
      cylinder,
      m.wood,
      0,
      0.88,
      -0.48,
      0.29,
      0.7,
      0.29,
      true,
    );
    for (const y of [0.53, 1.23]) {
      mesh(drummer.person, cylinder, m.cream, 0, y, -0.48, 0.31, 0.045, 0.31);
    }
    for (let j = 0; j < 8; j++) {
      const a = (j * Math.PI) / 4;
      beam(
        drummer.person,
        m.rope,
        [Math.cos(a) * 0.29, 0.55, -0.48 + Math.sin(a) * 0.29],
        [Math.cos(a + 0.3) * 0.29, 1.23, -0.48 + Math.sin(a + 0.3) * 0.29],
        0.016,
      );
    }
    for (const limb of drummer.limbs.slice(2)) {
      beam(limb, m.roofLight, [0, -0.52, 0], [0, -0.78, -0.2], 0.025);
    }
    drum.name = "Chenda";
    drummers.push(drummer);
  }
  const flagGeometry = ownGeometry(new THREE.BufferGeometry());
  flagGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([-0.3, 0, 0, 0, -0.6, 0, 0.3, 0, 0], 3),
  );
  flagGeometry.computeVertexNormals();
  const flagMaterials = ["#d58a4d", "#eee0af", "#49928a"].map((color) =>
    material(color, { side: THREE.DoubleSide }),
  );
  const bunting = [];
  for (const z of [-28, -19.3]) {
    for (const x of [-29, -15])
      block(root, m.wood, x, 1.9, z, 0.12, 3.8, 0.12, true);
    for (let i = 0; i < 17; i++) {
      const x = -29 + (i * 14) / 16;
      const y = 3.65 - Math.sin((i / 16) * Math.PI) * 0.65;
      if (i < 16) {
        const nextY = 3.65 - Math.sin(((i + 1) / 16) * Math.PI) * 0.65;
        beam(root, m.rope, [x, y, z], [x + 14 / 16, nextY, z], 0.015);
      }
      if (i > 0 && i < 16)
        bunting.push(mesh(root, flagGeometry, flagMaterials[i % 3], x, y, z));
    }
  }
  for (const [x, z] of [
    [-28, -20],
    [-16, -20],
    [-10, 30],
    [25, 9],
    [60, -40],
  ]) {
    block(root, m.wood, x, 1.6, z, 0.1, 3.2, 0.1);
    mesh(root, sphere, m.lamp, x, 3.2, z, 0.18, 0.25, 0.18);
    mesh(root, cone, m.darkWood, x, 3.48, z, 0.3, 0.2, 0.3);
  }

  const coilGeometry = ownGeometry(new THREE.TorusGeometry(0.5, 0.08, 5, 20));
  for (let i = 0; i < 6; i++) {
    const coil = mesh(
      root,
      coilGeometry,
      m.rope,
      64.3 + (i % 2) * 0.9,
      0.16 + Math.floor(i / 2) * 0.14,
      -49,
      1,
      1,
      1,
    );
    coil.rotation.x = Math.PI / 2;
  }
  block(root, m.rope, 70, 0.08, -51, 5, 0.12, 2.3);
  for (let i = 0; i < 12; i++)
    instance(box, m.wood, 67.7 + i * 0.42, 0.15, -51, 0.025, 0.02, 2.3);
  for (const x of [64, 66])
    block(root, m.wood, x, 0.75, -46.6, 0.12, 1.5, 0.12);
  beam(root, m.rope, [64, 1.1, -46.6], [66, 1.1, -46.6], 0.06);
  const wheel = mesh(
    root,
    coilGeometry,
    m.wood,
    64,
    1.05,
    -46.6,
    0.7,
    0.7,
    0.7,
  );
  wheel.rotation.y = Math.PI / 2;

  // An open, tapered hull with a visible interior, aligned along local Z.
  const hullGeometry = ownGeometry(new THREE.BufferGeometry());
  const hullVertices = [];
  const hullRing = [
    [0, -0.5],
    [0.4, -0.36],
    [0.5, 0],
    [0.4, 0.36],
    [0, 0.5],
    [-0.4, 0.36],
    [-0.5, 0],
    [-0.4, -0.36],
  ];
  for (let i = 0; i < hullRing.length; i++) {
    const a = hullRing[i];
    const b = hullRing[(i + 1) % hullRing.length];
    const topA = [a[0], 0.46, a[1]];
    const topB = [b[0], 0.46, b[1]];
    const lowA = [a[0] * 0.55, 0, a[1] * 0.92];
    const lowB = [b[0] * 0.55, 0, b[1] * 0.92];
    hullVertices.push(
      ...topA,
      ...lowA,
      ...topB,
      ...topB,
      ...lowA,
      ...lowB,
      0,
      0,
      0,
      ...lowB,
      ...lowA,
    );
  }
  hullGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(hullVertices, 3),
  );
  hullGeometry.computeVertexNormals();
  const hullMaterial = material("#594735", { side: THREE.DoubleSide });
  function boat(name, width, length, surface = hullMaterial) {
    const object = group(name);
    mesh(object, hullGeometry, surface, 0, -0.2, 0, width, 1, length, true);
    for (const z of [-length * 0.2, length * 0.18])
      block(object, m.rope, 0, 0.15, z, width * 0.73, 0.1, 0.4);
    return object;
  }
  const canoe = boat("Player canoe", 1.6, 5.5);
  canoe.position.set(33, -0.03, 7);
  canoe.visible = false;
  const paddle = new THREE.Group();
  canoe.add(paddle);
  paddle.position.set(0.85, 0.45, 0);
  paddle.rotation.z = -0.7;
  beam(paddle, m.wood, [0, -0.8, 0], [0, 1.25, 0], 0.04);
  block(paddle, m.roofLight, 0, -0.95, 0, 0.3, 0.55, 0.075);
  const jetty = group("Palmwater landing", 27, 0, 7);
  block(jetty, m.wood, 0, -0.08, 0, 5.6, 0.2, 4, true);
  for (let i = 0; i < 10; i++)
    instance(box, m.rope, 24.4 + i * 0.56, 0.03, 7, 0.025, 0.02, 3.95);
  for (const x of [-2.4, 2.4])
    for (const z of [-1.7, 1.7]) {
      mesh(jetty, cylinder, m.wood, x, -0.22, z, 0.14, 1.6, 0.14, true);
    }
  const houseboat = boat("Moored kettuvallam", 4.3, 13);
  houseboat.position.set(33.1, -0.02, 14.5);
  block(houseboat, m.wood, 0, 0.35, 0, 3.4, 0.14, 9.5, true);
  block(houseboat, m.rope, 0, 1.15, 0.4, 3.1, 1.5, 6.9, true);
  const cabinRoof = ownGeometry(
    new THREE.CylinderGeometry(1, 1, 1, 12, 1, false, 0, Math.PI),
  );
  cabinRoof.rotateZ(Math.PI / 2);
  cabinRoof.rotateY(Math.PI / 2);
  mesh(houseboat, cabinRoof, m.rope, 0, 1.78, 0.4, 1.95, 0.95, 7.7, true);
  for (const side of [-1, 1]) {
    for (let z = -2.3; z < 3.5; z += 1.4) {
      block(houseboat, m.darkWood, side * 1.57, 1.33, z, 0.05, 0.8, 0.96);
      block(houseboat, m.glass, side * 1.605, 1.34, z, 0.025, 0.63, 0.77);
    }
  }
  const rib = ownGeometry(new THREE.TorusGeometry(1, 0.022, 4, 12, Math.PI));
  for (let z = -3.3; z <= 4.1; z += 0.48) {
    mesh(houseboat, rib, m.wood, 0, 1.78, z, 1.96, 0.96, 1);
  }
  beam(root, m.rope, [29.4, 0.5, 8.7], [31.4, 0.2, 10], 0.04);
  const boats = [];
  for (let i = 0; i < 2; i++) {
    const object = boat(
      `Backwater fishing canoe ${i + 1}`,
      1.5,
      5.8,
      material(i ? "#a55236" : "#2e625d", { side: THREE.DoubleSide }),
    );
    const boatman = human("Boatman", i ? m.cream : m.gold);
    object.add(boatman.person);
    boatman.person.position.set(0, 0.2, 0.8);
    boatman.person.scale.setScalar(0.8);
    beam(object, m.wood, [0.6, -0.15, -0.5], [1, 2.4, 1], 0.04);
    boats.push(object);
  }
  for (let i = 0; i < 3; i++) {
    const fishing = boat(
      "Beached fishing vallam",
      1.9,
      7,
      i % 2 ? hullMaterial : material("#397b85", { side: THREE.DoubleSide }),
    );
    fishing.position.set(-76 + i * 1.8, 0.2, 25 + i * 8);
    fishing.rotation.set(0, 0.4 + i * 0.3, 0.14);
  }

  const pondGeometry = ownGeometry(new THREE.CircleGeometry(4.5, 48));
  pondGeometry.rotateX(-Math.PI / 2);
  const pond = mesh(
    root,
    pondGeometry,
    material("#327f73", { roughness: 0.24, metalness: 0.15 }),
    77,
    0.065,
    -122,
  );
  pond.name = "Lotus hideaway water";
  const padGeometry = ownGeometry(
    new THREE.CircleGeometry(1, 12, 0.18, Math.PI * 2 - 0.36),
  );
  padGeometry.rotateX(-Math.PI / 2);
  for (let i = 0; i < 19; i++) {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random()) * 3.8;
    const x = 77 + Math.cos(angle) * radius;
    const z = -122 + Math.sin(angle) * radius;
    instance(padGeometry, m.olive, x, 0.085, z, 0.35, 1, 0.28, 0, angle, 0);
    if (i % 3 === 0) {
      for (let petal = 0; petal < 6; petal++) {
        const a = (petal * Math.PI) / 3;
        instance(
          sphere,
          m.lotus,
          x + Math.cos(a) * 0.12,
          0.17,
          z + Math.sin(a) * 0.12,
          0.085,
          0.14,
          0.2,
          0.35,
          -a,
          0,
        );
      }
      instance(sphere, m.gold, x, 0.2, z, 0.09, 0.07, 0.09);
    }
  }
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    instance(
      sphere,
      m.rock,
      77 + Math.cos(a) * 4.75,
      0.2,
      -122 + Math.sin(a) * 4.75,
      between(0.35, 0.7),
      between(0.25, 0.55),
      between(0.4, 0.75),
      0,
      a,
      0,
    );
  }
  for (const [x, z, scale] of [
    [73.3, -118, 1.4],
    [81, -117.7, 1.65],
    [75, -128, 1.3],
    [80, -127.7, 1.1],
  ]) {
    instance(
      sphere,
      m.rock,
      x,
      0.6,
      z,
      scale,
      scale * 0.8,
      scale * 0.85,
      0.1,
      x,
      0.2,
    );
  }

  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.05, 2, 0),
    new THREE.Vector3(0.35, 4.2, 0.12),
    new THREE.Vector3(1.1, 6.4, 0.2),
    new THREE.Vector3(1.6, 8, 0.15),
  ]);
  const trunkGeometry = ownGeometry(
    new THREE.TubeGeometry(trunkCurve, 9, 0.17, 6, false),
  );
  const frondGeometry = ownGeometry(new THREE.BufferGeometry());
  const frondVertices = [];
  const frondCenter = (t) => [
    t * 4.4,
    Math.sin(t * Math.PI) * 0.85 - t * t * 1.3,
    0,
  ];
  for (let i = 0; i < 12; i++) {
    const t = i / 12;
    const a = frondCenter(t);
    const b = frondCenter((i + 1) / 12);
    const width = Math.sin((t * 0.88 + 0.07) * Math.PI) * 0.67 * (1 - t * 0.55);
    for (const side of [-1, 1]) {
      frondVertices.push(...a, b[0] + 0.32, b[1] - 0.13, side * width, ...b);
      frondVertices.push(
        a[0],
        a[1],
        side * 0.035,
        ...b,
        b[0],
        b[1],
        -side * 0.035,
      );
    }
  }
  frondGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(frondVertices, 3),
  );
  frondGeometry.computeVertexNormals();
  function palm(x, z, scale = 1, yaw = random() * Math.PI * 2) {
    const y = terrainHeight(x, z);
    instance(trunkGeometry, m.trunk, x, y, z, scale, scale, scale, 0, yaw, 0);
    const topX = x + (1.6 * Math.cos(yaw) + 0.15 * Math.sin(yaw)) * scale;
    const topZ = z + (-1.6 * Math.sin(yaw) + 0.15 * Math.cos(yaw)) * scale;
    for (let i = 0; i < 9; i++) {
      instance(
        frondGeometry,
        i % 3 ? m.leaf : m.olive,
        topX,
        y + 8 * scale,
        topZ,
        scale,
        scale,
        scale,
        0,
        yaw + (i * Math.PI * 2) / 9,
        i % 2 ? 0.16 : -0.06,
      );
    }
    for (let i = 0; i < 3; i++)
      instance(
        sphere,
        m.wood,
        topX + (i - 1) * 0.22 * scale,
        y + 7.72 * scale,
        topZ,
        0.19 * scale,
        0.23 * scale,
        0.19 * scale,
      );
  }
  function clearVegetation(x, z, margin = 2.8) {
    if ((x > -7 && x < 10) || Math.abs(z) < 6 || Math.abs(z + 90) < 6)
      return false;
    if ((x > 26 && x < 50) || Math.abs(x - 58) < 5) return false;
    if ((x < 2 && Math.abs(z - 12) < 5) || (x > 56 && Math.abs(z - 110) < 5))
      return false;
    if (
      buildings.some(
        (b) =>
          Math.abs(x - b.x) < b.w / 2 + margin &&
          Math.abs(z - b.z) < b.d / 2 + margin,
      )
    )
      return false;
    if (
      sites.some(
        (site) =>
          Math.hypot(x - site.x, z - site.z) < Math.min(site.radius, 10) + 1,
      )
    )
      return false;
    return Math.hypot(x - 77, z + 122) > 7;
  }
  for (const [x, z, s] of [
    [-9, 67, 1.05],
    [9, 61, 1.2],
    [-10, 43, 1.05],
    [25, 38, 1.15],
    [-64, 55, 1.15],
    [-69, -8, 1.2],
    [50.5, 15, 1.15],
    [92, 114, 0.95],
  ])
    palm(x, z, s);
  let palms = 0;
  for (let attempt = 0; attempt < 1200 && palms < 115; attempt++) {
    const x = between(-78, 104);
    const z = between(-138, 138);
    if (!clearVegetation(x, z, 4)) continue;
    palm(x, z, between(0.75, 1.35));
    palms++;
  }
  for (let attempt = 0, count = 0; attempt < 500 && count < 48; attempt++) {
    const x = between(-58, 103);
    const z = between(-139, 139);
    if (!clearVegetation(x, z, 5)) continue;
    const y = terrainHeight(x, z);
    const size = between(0.8, 1.4);
    instance(
      cylinder,
      m.wood,
      x,
      y + 1.5 * size,
      z,
      0.2 * size,
      3 * size,
      0.2 * size,
    );
    for (let crown = 0; crown < 3; crown++) {
      const a = (crown * Math.PI * 2) / 3;
      instance(
        sphere,
        crown % 2 ? m.olive : m.leaf,
        x + Math.cos(a) * size,
        y + (3.6 + crown * 0.25) * size,
        z + Math.sin(a) * size,
        1.75 * size,
        1.6 * size,
        1.65 * size,
        0,
        a,
        0,
      );
    }
    count++;
  }
  const grassGeometry = ownGeometry(new THREE.BufferGeometry());
  grassGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        -0.28, 0, 0, 0.1, 0.7, 0.08, 0.08, 0, 0, 0, 0, -0.25, -0.1, 0.48, 0.05,
        0, 0, 0.25, -0.15, 0, 0.15, -0.4, 0.45, 0.1, 0.15, 0, -0.15,
      ],
      3,
    ),
  );
  grassGeometry.computeVertexNormals();
  const grassMaterial = material("#718b48", { side: THREE.DoubleSide });
  for (let i = 0; i < 1500; i++) {
    const x = between(-65, 104);
    const z = between(-141, 141);
    if (!clearVegetation(x, z, 2)) continue;
    const size = between(0.5, 1.3);
    instance(
      grassGeometry,
      grassMaterial,
      x,
      terrainHeight(x, z) + 0.025,
      z,
      size,
      size,
      size,
      0,
      random() * 6.28,
      0,
    );
  }
  for (const x of [28.4, 47.7])
    for (let z = -137; z < 141; z += 3.5) {
      if (
        Math.abs(z) < 11 ||
        Math.abs(z + 90) < 7 ||
        (x < 30 && z > 4 && z < 23)
      )
        continue;
      instance(
        grassGeometry,
        grassMaterial,
        x,
        0.02,
        z,
        1.3,
        1.8,
        1.3,
        0,
        z,
        0,
      );
    }
  // Distant silhouettes stay beyond the playable region and never obstruct the coast.
  const mountainMaterial = material("#78958a", { flatShading: true });
  for (let i = 0; i < 12; i++) {
    const height = between(22, 44);
    instance(
      cone,
      mountainMaterial,
      160 + i * 19,
      height / 2 - 3,
      -210 + Math.sin(i) * 24,
      between(32, 50),
      height,
      between(28, 44),
      0,
      i,
      0,
    );
  }
  for (const [x, z] of [
    [78, 113],
    [83, 113],
  ]) {
    const y = terrainHeight(x, z);
    block(root, m.wood, x, y + 0.52, z, 3, 0.13, 0.65, true);
    for (const side of [-1, 1])
      block(root, m.darkWood, x + side, y + 0.25, z, 0.12, 0.5, 0.45);
  }

  const walkers = [];
  for (let i = 0; i < 5; i++) {
    const walker = human(
      `Village walker ${i + 1}`,
      [m.teal, m.rose, m.white, m.gold, m.olive][i],
      m.cream,
    );
    walkers.push({
      ...walker,
      x: i < 3 ? -1.6 : 58,
      from: i < 3 ? -121 : -104,
      to: i < 3 ? 127 : 72,
      phase: i * 43,
    });
  }
  const dogs = [];
  for (let i = 0; i < 2; i++) {
    const dog = group("Village dog");
    const fur = i ? m.cream : m.roofLight;
    mesh(dog, sphere, fur, 0, 0.57, 0, 0.23, 0.28, 0.5, true);
    mesh(dog, sphere, fur, 0, 0.82, -0.44, 0.22, 0.23, 0.24, true);
    block(dog, m.darkWood, 0, 0.78, -0.65, 0.12, 0.12, 0.16);
    for (const side of [-1, 1]) {
      const ear = mesh(
        dog,
        cone,
        fur,
        side * 0.15,
        1.02,
        -0.41,
        0.1,
        0.24,
        0.09,
      );
      ear.rotation.z = side * -0.2;
    }
    const legs = [];
    for (const x of [-0.16, 0.16])
      for (const z of [-0.29, 0.29]) {
        const leg = new THREE.Group();
        leg.position.set(x, 0.5, z);
        dog.add(leg);
        block(leg, fur, 0, -0.23, 0, 0.1, 0.46, 0.1);
        legs.push(leg);
      }
    beam(dog, fur, [0, 0.6, 0.4], [0, 0.93, 0.72], 0.065);
    dogs.push({ dog, legs });
  }
  const rickshaw = group("Village auto-rickshaw");
  block(rickshaw, m.teal, 0, 0.62, 0.2, 1.45, 0.6, 2.35, true);
  block(rickshaw, m.gold, 0, 0.85, -0.96, 1.35, 0.8, 0.55, true);
  block(rickshaw, m.black, 0, 1.93, 0.08, 1.62, 0.2, 2.24, true);
  block(rickshaw, m.darkWood, 0, 1.07, 0.5, 1.18, 0.21, 0.55);
  block(rickshaw, m.glass, 0, 1.47, -0.99, 1.15, 0.66, 0.045);
  for (const side of [-1, 1]) {
    block(rickshaw, m.gold, side * 0.68, 1.44, -1, 0.08, 0.93, 0.08);
    block(rickshaw, m.black, side * 0.68, 1.4, 1.04, 0.09, 1, 0.09);
    mesh(rickshaw, sphere, m.lamp, side * 0.43, 0.91, -1.25, 0.15, 0.12, 0.06);
  }
  const wheels = [];
  for (const [x, z] of [
    [-0.75, 0.7],
    [0.75, 0.7],
    [0, -0.98],
  ]) {
    const tire = mesh(
      rickshaw,
      cylinder,
      m.black,
      x,
      0.35,
      z,
      0.34,
      0.19,
      0.34,
      true,
    );
    tire.rotation.z = Math.PI / 2;
    wheels.push(tire);
  }
  const driver = human("Auto driver", m.cream);
  rickshaw.add(driver.person);
  driver.person.position.set(0, 0.48, -0.32);
  driver.person.scale.setScalar(0.63);
  driver.limbs[0].rotation.x = driver.limbs[1].rotation.x = -1.1;

  const birds = [];
  const wingGeometry = ownGeometry(new THREE.BufferGeometry());
  wingGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [0, 0, 0, 0.9, 0.03, 0.15, 0.38, 0, -0.2],
      3,
    ),
  );
  wingGeometry.computeVertexNormals();
  const birdMaterial = material("#eee6cc", { side: THREE.DoubleSide });
  for (let i = 0; i < 11; i++) {
    const bird = group("Coastal bird");
    mesh(bird, sphere, m.cream, 0, 0, 0, 0.12, 0.11, 0.32);
    const wings = [-1, 1].map((side) =>
      mesh(bird, wingGeometry, birdMaterial, 0, 0, 0, side, 1, 1),
    );
    birds.push({ bird, wings });
  }

  const animated = new Set([
    player,
    canoe,
    houseboat,
    rickshaw,
    ...boats,
    ...bunting,
    ...walkers.map((walker) => walker.person),
    ...drummers.map((drummer) => drummer.person),
    ...dogs.map(({ dog }) => dog),
    ...birds.map(({ bird }) => bird),
    ...foam,
  ]);
  root.updateWorldMatrix(true, true);
  const worldToRoot = root.matrixWorld.clone().invert();
  const staticMeshes = [];
  function collectStatic(object) {
    if (animated.has(object) || object.userData.animatedWater) return;
    if (object.isMesh) staticMeshes.push(object);
    object.children.forEach(collectStatic);
  }
  collectStatic(root);
  for (const object of staticMeshes) {
    const key = `${object.geometry.uuid}:${object.material.uuid}:${object.castShadow}`;
    if (!batches.has(key))
      batches.set(key, {
        geometry: object.geometry,
        surface: object.material,
        matrices: [],
        shadow: object.castShadow,
      });
    batches
      .get(key)
      .matrices.push(
        new THREE.Matrix4().multiplyMatrices(worldToRoot, object.matrixWorld),
      );
    object.removeFromParent();
  }
  for (const {
    geometry,
    surface,
    matrices,
    shadow = false,
  } of batches.values()) {
    const object = new THREE.InstancedMesh(geometry, surface, matrices.length);
    object.name = "Shared landscape instances";
    matrices.forEach((matrix, index) => object.setMatrixAt(index, matrix));
    object.instanceMatrix.needsUpdate = true;
    object.computeBoundingSphere();
    object.castShadow = shadow;
    object.receiveShadow = true;
    root.add(object);
  }
  batches.clear();
  let disposed = false;
  function update(time = 0, dt = 0, night = 0) {
    if (disposed) return;
    const t = Number.isFinite(time) ? time : 0;
    const darkness = THREE.MathUtils.clamp(Number(night) || 0, 0, 1);
    waterTime.value = t;
    waterNight.value = darkness;
    m.glass.emissiveIntensity = darkness * 0.75;
    m.lamp.emissiveIntensity = 0.25 + darkness * 1.8;
    foam.forEach((line, i) => {
      line.position.x = -85.2 - i * 2.4 + Math.sin(t * 0.35 + i) * 0.6;
    });
    houseboat.position.y = -0.02 + Math.sin(t * 0.8) * 0.035;
    houseboat.rotation.z = Math.sin(t * 0.55) * 0.008;
    // Stay between crossings: tall boat passengers must never pass through bridge decks.
    boats.forEach((object, i) => {
      const phase = t * 0.023 + i * 2;
      object.position.set(
        i ? 41.5 : 35.5,
        Math.sin(t * 1.2 + i) * 0.035 - 0.03,
        i ? -46 + Math.sin(phase) * 30 : 77 + Math.sin(phase) * 47,
      );
      object.rotation.y = Math.cos(phase) > 0 ? Math.PI : 0;
      object.rotation.z = Math.sin(t + i) * 0.015;
    });
    walkers.forEach(({ person, limbs, x, from, to, phase }) => {
      const length = to - from;
      const travel =
        (((t * 0.85 + phase) % (length * 2)) + length * 2) % (length * 2);
      const forward = travel < length;
      const z = from + (forward ? travel : length * 2 - travel);
      person.position.set(x, terrainHeight(x, z), z);
      person.rotation.y = forward ? Math.PI : 0;
      const swing = Math.sin(t * 4 + phase) * 0.38;
      limbs.forEach((limb, i) => {
        limb.rotation.x = swing * (i === 0 || i === 3 ? 1 : -1);
      });
    });
    drummers.forEach(({ limbs }, i) => {
      limbs[2].rotation.x = -0.8 + Math.sin(t * 9 + i * 1.6) * 0.4;
      limbs[3].rotation.x = -0.8 - Math.sin(t * 9 + i * 1.6) * 0.4;
    });
    bunting.forEach((flag, i) => {
      flag.rotation.x = Math.sin(t * 1.8 + i * 0.55) * 0.18;
    });
    dogs.forEach(({ dog, legs }, i) => {
      const phase = t * 0.09 + i * Math.PI;
      const z = i ? 95 + Math.sin(phase) * 13 : 43 + Math.sin(phase) * 9;
      const x = i ? -5 : 8;
      dog.position.set(x, terrainHeight(x, z), z);
      dog.rotation.y = Math.cos(phase) > 0 ? Math.PI : 0;
      legs.forEach((leg, j) => {
        leg.rotation.x = Math.sin(t * 7 + j * Math.PI) * 0.3;
      });
    });
    const trafficPhase = t * 0.023 - 0.5;
    rickshaw.position.set(3.5, 0.045, Math.sin(trafficPhase) * 124);
    rickshaw.rotation.y = Math.cos(trafficPhase) > 0 ? Math.PI : 0;
    wheels.forEach((tire) => {
      tire.rotation.x = t * 7;
    });
    birds.forEach(({ bird, wings }, i) => {
      const angle = t * 0.035 + i * 0.075;
      bird.position.set(
        -34 + Math.cos(angle) * 49 + i * 0.5,
        19 + Math.sin(t * 0.3 + i) * 1.3 + i * 0.25,
        22 + Math.sin(angle) * 65 - i * 2,
      );
      bird.rotation.y = -angle;
      wings[0].rotation.z = Math.sin(t * 4.8 + i * 0.6) * 0.45;
      wings[1].rotation.z = -wings[0].rotation.z;
    });
    // Player movement, limb gait, canoe visibility and scene lighting belong to the engine.
    if (canoe.visible) paddle.rotation.z = -0.7 + Math.sin(t * 2.5) * 0.25;
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    root.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
      const surfaces = Array.isArray(object.material)
        ? object.material
        : [object.material];
      for (const surface of surfaces) {
        if (!surface) continue;
        materials.add(surface);
        for (const value of Object.values(surface))
          if (value?.isTexture) textures.add(value);
      }
      if (object.isInstancedMesh) object.dispose();
    });
    root.removeFromParent();
    // The engine may reparent the two controllable groups; their resources are still ours.
    player.removeFromParent();
    canoe.removeFromParent();
    textures.forEach((texture) => texture.dispose());
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((surface) => surface.dispose());
    textures.clear();
    geometries.clear();
    materials.clear();
    root.clear();
  }
  update(0, 0, 0);
  return { player, playerLimbs, canoe, update, dispose };
}
