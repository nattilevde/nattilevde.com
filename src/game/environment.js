import { fishingPosition, fishMarketOpen, FISH_MARKET } from "./fishing.js";
import { AUTO_STOPS, autoPosition } from "./auto.js";
import * as THREE from "three";
import { BUS_STOPS, busPosition } from "./bus.js";
import { RESIDENTS, FERRY_STOPS } from "./life-data.js";
import { ferryPosition, lifeHour } from "./life.js";
import {
  buildings,
  solids,
  sites,
  terrainHeight,
  coastX,
  roads,
  HIGHWAY,
  REGION_GATEWAYS,
  REST_SPOTS,
} from "./world.js";

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
    grass: material("#7c995d"),
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
    laterite: material("#b06a45", { roughness: 0.95 }),
    lateriteDark: material("#8e4f34", { roughness: 0.95 }),
    tea: material("#5f9440", { roughness: 0.9 }),
    stone: material("#9aa39b"),
    lightRed: material("#c94f3d", { roughness: 0.6 }),
    lightWhite: material("#f2ede0", { roughness: 0.6 }),
    theyyamRed: material("#c8372c", { roughness: 0.8 }),
    grey: material("#8d8d86"),
    cascade: material("#eef7f2", {
      transparent: true,
      opacity: 0.85,
      emissive: "#cfe8dd",
      emissiveIntensity: 0.25,
      side: THREE.DoubleSide,
    }),
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
    let groundSurface = surface;
    if (surface === m.grass || surface === m.sand) {
      const colors = [];
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i),
          z = positions.getZ(i);
        const tint =
          0.9 +
          0.065 * Math.sin(x * 0.065 + z * 0.023) +
          0.045 * Math.sin(z * 0.14);
        colors.push(tint, Math.min(1, tint + 0.025), tint * 0.95);
      }
      geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 3),
      );
      const key = surface === m.grass ? "grassTerrain" : "sandTerrain";
      if (!m[key]) {
        m[key] = surface.clone();
        m[key].vertexColors = true;
        materials.add(m[key]);
      }
      groundSurface = m[key];
    }
    const object = mesh(root, geometry, groundSurface, 0, 0, 0);
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
  // The wider Kerala beyond the village, in four coarse terrain tiles.
  ground("Northern and central plains", -160, 410, -1500, -150, m.grass, 0, 8);
  ground("Travancore south country", -160, 410, 150, 900, m.grass, 0, 8);
  ground("The High Ranges", 410, 760, -1500, 900, m.grass, 0, 8);
  ground("Eastern foothill band", 115, 410, -150, 150, m.grass, 0, 8);
  // Sand ribbons where highway towns meet the sea. Bounds sit on the same 8-unit
  // vertex grid as the base tiles so the overlay never z-fights on slopes.
  ground("Malabar beach", -112, -56, -1060, -940, m.sand, 0.06, 8);
  ground("Fort headland approach", -120, -80, -1404, -1300, m.sand, 0.06, 8);
  ground("Kovalam sands", -112, -56, 582, 694, m.sand, 0.06, 8);

  const waterTime = { value: 0 };
  const waterNight = { value: 0 };
  function water(name, width, depth, x, z, color, segments = 1, y = -0.18) {
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
    const object = mesh(root, geometry, surface, x, y, z);
    object.name = name;
    object.userData.animatedWater = true;
    return object;
  }
  water("Arabian Sea", 1060, 2600, -550, -300, "#399eaa", 96);
  water("Turquoise backwater canal", 16, 310, 38, 0, "#399e91", 28);
  water("The Periyar river", 600, 46, 120, -600, "#3d95a0", 40);
  water("Ashtamudi lagoon", 232, 316, 250, 450, "#3a9a96", 32);
  water("Silverthread plunge pool", 17, 17, 620, -185, "#357f83", 6, 22.9);
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
    // A buried plinth keeps homes seated on gently rolling ground.
    block(home, m.earth, 0, -1.1, 0, w + 0.4, 2.2, d + 0.4);
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
    } else if (type === "market") {
      sign(
        veranda,
        "CHANDHAPURA MARKET",
        "FRESH FISH  /  HALWA  /  BANANA CHIPS",
        0,
        2.65,
        face + 1.98,
        6.4,
      );
    } else if (type === "spice") {
      sign(
        veranda,
        "SPICE LANE",
        "CARDAMOM  /  PEPPER  /  CINNAMON",
        0,
        2.65,
        face + 1.98,
        6,
      );
    } else if (type === "tea") {
      sign(
        veranda,
        "ELAVARA TEA ESTATE",
        "HIGH-GROWN LEAF  /  EST. 1911",
        0,
        2.65,
        face + 1.98,
        6.2,
      );
    } else if (type === "sadya") {
      sign(
        veranda,
        "AMMINI'S SADYA",
        "MEALS READY  /  BANANA LEAF  /  PAYASAM",
        0,
        2.65,
        face + 1.98,
        6.2,
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
  const villagers = new Map(
    RESIDENTS.map((r) => [
      r.id,
      resident(
        r.name,
        0,
        0,
        m[r.color],
        0,
        r.id === "leela" || r.id === "radha",
      ),
    ]),
  );
  const coirCover = block(root, m.teal, 60.7, 0.62, -43, 1.7, 0.12, 2.5);
  coirCover.visible = false;

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
    const drummer = villagers.get(["anil", "usha", "mani"][i]);
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
  const ferry = boat("Kadal passenger boat", 2.5, 7);
  const ferryCrew = human("Passenger boat keeper", m.teal);
  ferry.add(ferryCrew.person);
  ferryCrew.person.position.set(0, 0.15, 2);
  beam(ferry, m.wood, [1, -0.2, 1], [1, 2.1, 2.5], 0.05);
  for (const stop of FERRY_STOPS) {
    const landing = group(stop.name, stop.land.x, 0, stop.land.z);
    block(landing, m.wood, 0, 0.06, 0, 2.2, 0.15, 3.6);
    sign(
      landing,
      stop.name.toUpperCase(),
      "PASSENGER BOAT / 6 AM - 7 PM",
      0,
      2.5,
      0,
      4,
    );
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

  const catchBoat = boat("Sasi's working vallam", 1.9, 7, hullMaterial);
  const fisher = human("Sasi", m.teal);
  const fishBasket = group("Catch baskets");
  for (let i = 0; i < 5; i++) {
    const crate = block(
      fishBasket,
      m.rope,
      (i % 2) * 0.65,
      Math.floor(i / 2) * 0.35,
      0,
      0.6,
      0.3,
      0.65,
      true,
    );
    crate.userData.catchIndex = i;
  }
  const fishStall = group("Kadal fish stall", -11, terrainHeight(-11, 44), 44);
  roof(fishStall, 0, 2.65, 0, 4, 3, 0.7);
  for (const x of [-1.6, 1.6])
    block(fishStall, m.wood, x, 1.3, 0, 0.12, 2.6, 0.12);
  block(fishStall, m.wood, 0, 0.8, 0, 3.1, 0.14, 1.3);
  sign(fishStall, "KADAL FISH", "FROM THE SHORE", 0, 2.1, 0.8, 2.7);
  const vendor = human("Mini", m.rose);
  vendor.person.position.set(-11, terrainHeight(-11, 42), 42);
  const marketFish = group(
    "Fresh catch on the stall",
    -11,
    terrainHeight(-11, 44),
    44,
  );
  for (let i = 0; i < 5; i++)
    mesh(marketFish, sphere, m.grey, (i - 2) * 0.5, 0.98, 0, 0.1, 0.08, 0.32);
  const fishBuyer = human("Fish buyer", m.gold);
  // A buyer approaches only while stock and trading conditions allow it.

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

  const grassSeedling = ownGeometry(new THREE.BufferGeometry());
  grassSeedling.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        -0.22, 0, 0, 0.06, 0.85, 0.05, 0.06, 0, 0, 0, 0, -0.2, -0.08, 0.6, 0.04,
        0, 0, 0.2, -0.12, 0, 0.12, -0.3, 0.55, 0.08, 0.12, 0, -0.12,
      ],
      3,
    ),
  );
  grassSeedling.computeVertexNormals();
  // Kuttanad-style paddies: shallow water squares, young rice, and low mud bunds.
  const paddyWater = mesh(
    root,
    ownGeometry(new THREE.PlaneGeometry(26, 28).rotateX(-Math.PI / 2)),
    material("#4c7d4f", { roughness: 0.3, metalness: 0.14 }),
    -48,
    0.03,
    -108,
  );
  paddyWater.name = "Paddy field water";
  const riceMaterial = material("#8fb554", { side: THREE.DoubleSide });
  for (const x of [-61, -48, -35])
    block(root, m.earth, x, 0.12, -108, 0.9, 0.24, 28.4);
  for (const z of [-94, -108, -122])
    block(root, m.earth, -48, 0.12, z, 26.9, 0.24, 0.9);
  for (let gx = 0; gx < 16; gx++)
    for (let gz = 0; gz < 18; gz++) {
      const x = -60 + gx * 1.55 + (random() - 0.5) * 0.35;
      const z = -120.6 + gz * 1.45 + (random() - 0.5) * 0.35;
      if (Math.abs(x + 48) < 1 || Math.abs(z + 108) < 1) continue;
      const size = between(0.55, 0.95);
      instance(
        grassSeedling,
        riceMaterial,
        x,
        0.05,
        z,
        size * 0.65,
        size,
        size * 0.65,
        0,
        random() * 6.28,
        0,
      );
    }
  const scarecrow = group("Paddy scarecrow", -43, 0, -103);
  block(scarecrow, m.wood, 0, 1, 0, 0.1, 2, 0.1, true);
  block(scarecrow, m.rose, 0, 1.45, 0, 1.5, 0.16, 0.14);
  block(scarecrow, m.rose, 0, 1.15, 0, 0.5, 0.55, 0.2, true);
  mesh(scarecrow, sphere, m.sand, 0, 1.85, 0, 0.2, 0.24, 0.2, true);
  mesh(scarecrow, cone, m.rope, 0, 2.1, 0, 0.34, 0.3, 0.34, true);

  // The kavu: an untouched grove with a serpent shrine, kept wilder than the village.
  const kavu = group("Sacred grove", 92, 0, -70);
  mesh(kavu, cylinder, m.darkWood, 0, 2.6, 0, 0.85, 5.2, 0.7, true);
  for (let crown = 0; crown < 6; crown++) {
    const a = (crown * Math.PI * 2) / 6;
    instance(
      sphere,
      crown % 2 ? m.leaf : m.olive,
      92 + Math.cos(a) * 2.6,
      5.6 + Math.sin(crown * 2.1) * 0.9,
      -70 + Math.sin(a) * 2.4,
      2.6,
      2.1,
      2.5,
      0,
      a,
      0,
    );
  }
  instance(sphere, m.leaf, 92, 7.4, -70, 3, 2.2, 2.9);
  for (let i = 0; i < 7; i++) {
    const a = i * 0.9 + 0.4;
    beam(
      kavu,
      m.trunk,
      [Math.cos(a) * 2.2, 4.6, Math.sin(a) * 2.1],
      [Math.cos(a) * between(2.3, 3), between(0.3, 1.4), Math.sin(a) * 2.4],
      0.035,
    );
  }
  const shrine = group("Serpent shrine", 89.4, 0, -67.4);
  block(shrine, m.rock, 0, 0.2, 0, 2.3, 0.4, 2.3, true);
  block(shrine, m.rock, 0, 0.55, 0, 1.5, 0.3, 1.5, true);
  block(shrine, m.cream, 0, 1.1, 0, 0.9, 0.8, 0.9, true);
  roof(shrine, 0, 1.55, 0, 1.6, 1.6, 0.75);
  for (const side of [-1, 1]) {
    block(shrine, m.rock, side * 1.35, 0.75, 1.05, 0.24, 1.1, 0.24, true);
    mesh(shrine, sphere, m.lamp, side * 1.35, 1.42, 1.05, 0.1, 0.13, 0.1);
  }
  for (let i = 0; i < 5; i++) {
    instance(
      box,
      m.rock,
      90.2 + i * 0.55,
      0.5,
      -72.6 + (i % 2) * 0.3,
      0.3,
      1 - (i % 3) * 0.16,
      0.14,
      0,
      0.3 * i,
      0.06,
    );
  }
  for (const [x, z, s] of [
    [87.5, -73.5, 1.1],
    [95.8, -66.5, 0.9],
    [95, -74.5, 1.25],
  ])
    instance(sphere, m.rock, x, 0.35 * s, z, s, s * 0.7, s * 0.9, 0, x, 0);

  // A parked village scooter the player can borrow. Forward is -Z, like the player.
  const scooter = group("Village scooter");
  scooter.position.set(9, 0, 70);
  const scooterBody = material("#3f8f86", { roughness: 0.45, metalness: 0.2 });
  const scooterCream = material("#efe6cc", { roughness: 0.5 });
  block(scooter, scooterCream, 0, 0.42, 0.1, 0.42, 0.1, 1.05);
  mesh(scooter, sphere, scooterBody, 0, 0.62, 0.62, 0.32, 0.34, 0.5, true);
  block(scooter, m.darkWood, 0, 0.92, 0.55, 0.4, 0.14, 0.72, true);
  mesh(scooter, sphere, scooterBody, 0, 0.72, -0.62, 0.3, 0.42, 0.24, true);
  beam(scooter, m.black, [0, 0.95, -0.62], [0, 1.32, -0.72], 0.045);
  block(scooter, m.black, 0, 1.34, -0.72, 0.62, 0.06, 0.08);
  for (const side of [-1, 1])
    block(scooter, m.rope, side * 0.29, 1.34, -0.72, 0.1, 0.08, 0.1);
  mesh(scooter, sphere, m.lamp, 0, 1.2, -0.8, 0.11, 0.12, 0.08);
  mesh(scooter, sphere, m.rose, 0, 0.68, 0.98, 0.1, 0.1, 0.04);
  const scooterWheels = [];
  for (const z of [-0.62, 0.62]) {
    const tire = mesh(
      scooter,
      cylinder,
      m.black,
      0,
      0.26,
      z,
      0.26,
      0.14,
      0.26,
      true,
    );
    tire.rotation.z = Math.PI / 2;
    mesh(
      scooter,
      cylinder,
      scooterCream,
      0,
      0.26,
      z,
      0.13,
      0.15,
      0.13,
    ).rotation.z = Math.PI / 2;
    scooterWheels.push(tire);
  }
  scooter.rotation.y = 0.5;
  scooter.rotation.z = 0.07;

  // Soft golden glints mark undiscovered stops; the engine hides each one on discovery.
  const beaconMaterial = material("#ffd98a", {
    emissive: "#f5b445",
    emissiveIntensity: 0.9,
    transparent: true,
    opacity: 0.85,
  });
  const beacons = new Map();
  for (const site of sites) {
    if (site.kind === "hidden") continue;
    const beacon = mesh(
      root,
      sphere,
      beaconMaterial,
      site.x,
      terrainHeight(site.x, site.z) + 3.4,
      site.z,
      0.22,
      0.32,
      0.22,
    );
    beacon.name = `Beacon: ${site.name}`;
    beacon.userData.baseY = beacon.position.y;
    beacon.userData.phase = beacons.size;
    beacons.set(site.id, beacon);
  }

  // ---- The wider Kerala: long roads and regional landmarks ----
  function roadStrip(name, pts, width) {
    const curve = new THREE.CatmullRomCurve3(
      pts.map(([x, z]) => new THREE.Vector3(x, 0, z)),
      false,
      "catmullrom",
      0.12,
    );
    const steps = Math.max(2, Math.ceil(curve.getLength() / 5));
    const positions = [];
    const indices = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const mag = Math.hypot(tangent.x, tangent.z) || 1;
      for (const side of [-1, 1]) {
        const X = p.x + ((-tangent.z / mag) * side * width) / 2;
        const Z = p.z + ((tangent.x / mag) * side * width) / 2;
        positions.push(X, terrainHeight(X, Z) + 0.07, Z);
      }
      if (i) {
        const a = (i - 1) * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const geometry = ownGeometry(new THREE.BufferGeometry());
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const object = mesh(root, geometry, m.path, 0, 0, 0);
    object.name = name;
    return object;
  }
  roadStrip(
    "Coastal highway north",
    [
      [HIGHWAY.x, -135],
      [HIGHWAY.x, HIGHWAY.from],
    ],
    HIGHWAY.width,
  );
  roadStrip(
    "Coastal highway south",
    [
      [HIGHWAY.x, 139],
      [HIGHWAY.x, HIGHWAY.to],
    ],
    HIGHWAY.width,
  );
  for (const road of roads) roadStrip(road.id, road.points, road.width);

  // River bridge causeways: railed decks so the crossings read as bridges.
  for (const bx of [2, 155]) {
    for (const side of [-2.9, 2.9]) {
      const railY = terrainHeight(bx, -600) + 0.75;
      block(root, m.laterite, bx + side, railY, -600, 0.5, 0.9, 34, true);
      block(root, m.cream, bx + side, railY + 0.55, -600, 0.62, 0.22, 34.4);
    }
  }
  // The Periyar ghat: stone steps down to the water.
  for (let step = 0; step < 5; step++) {
    block(
      root,
      m.stone,
      30,
      terrainHeight(30, -630) + 0.3 - step * 0.32,
      -630 + step * 1.7,
      14,
      0.34,
      1.8,
    );
  }
  for (const x of [24, 36]) {
    block(
      root,
      m.wood,
      x,
      terrainHeight(30, -630) + 1.6,
      -631,
      0.14,
      3.2,
      0.14,
    );
    mesh(
      root,
      sphere,
      m.lamp,
      x,
      terrainHeight(30, -630) + 3.3,
      -631,
      0.17,
      0.22,
      0.17,
    );
  }

  // Kadalkotta Fort: laterite walls and a round sea bastion on the headland.
  const fortWalls = [
    { x: -65, z: -1372, w: 52, d: 2.4 },
    { x: -65, z: -1332, w: 52, d: 2.4 },
    { x: -91, z: -1352, w: 2.4, d: 42 },
    { x: -39, z: -1362, w: 2.4, d: 20 },
    { x: -39, z: -1339, w: 2.4, d: 14 },
  ];
  for (const wall of fortWalls) {
    const y = terrainHeight(wall.x, wall.z);
    block(root, m.laterite, wall.x, y + 2.6, wall.z, wall.w, 5.6, wall.d, true);
    const along = wall.w > wall.d;
    const length = along ? wall.w : wall.d;
    for (let i = -length / 2 + 1; i < length / 2; i += 2.6) {
      instance(
        box,
        m.lateriteDark,
        wall.x + (along ? i : 0),
        y + 5.75,
        wall.z + (along ? 0 : i),
        along ? 1.3 : wall.w + 0.3,
        0.75,
        along ? wall.d + 0.3 : 1.3,
      );
    }
  }
  for (const [bx, bz, r, hgt] of [
    [-91, -1332, 5.2, 7],
    [-91, -1372, 5.2, 7],
    [-93, -1352, 6.8, 8.6],
  ]) {
    const y = terrainHeight(bx, bz);
    mesh(root, cylinder, m.laterite, bx, y + hgt / 2, bz, r, hgt, r, true);
    mesh(
      root,
      cylinder,
      m.lateriteDark,
      bx,
      y + hgt + 0.3,
      bz,
      r + 0.35,
      0.65,
      r + 0.35,
      true,
    );
  }
  const flagY = terrainHeight(-93, -1352) + 8.6;
  block(root, m.darkWood, -93, flagY + 2, -1352, 0.14, 4, 0.14, true);
  mesh(root, plane, m.gold, -92.1, flagY + 3.4, -1352, 1.7, 1, 1).rotation.y =
    Math.PI / 2;
  const fortGate = group("Fort gate", -39, terrainHeight(-39, -1350), -1350);
  sign(
    fortGate,
    "KADALKOTTA FORT",
    "LATERITE WALLS  /  THE SEA ON THREE SIDES",
    2.4,
    3.1,
    0,
    6.2,
    Math.PI / 2,
  );
  block(fortGate, m.laterite, 0, 5.9, 0, 2.4, 1.4, 8.4, true);

  // The red-banded lighthouse over Kovalam sands.
  const lightY = terrainHeight(-70, 646);
  for (let band = 0; band < 4; band++) {
    mesh(
      root,
      cylinder,
      band % 2 ? m.lightWhite : m.lightRed,
      -70,
      lightY + 2 + band * 4,
      646,
      2.3 - band * 0.18,
      4,
      2.3 - band * 0.18,
      true,
    );
  }
  mesh(
    root,
    cylinder,
    m.darkWood,
    -70,
    lightY + 16.3,
    646,
    2.4,
    0.5,
    2.4,
    true,
  );
  mesh(root, cylinder, m.glass, -70, lightY + 17.2, 646, 1.35, 1.5, 1.35, true);
  mesh(root, sphere, m.lamp, -70, lightY + 17.2, 646, 0.75, 0.75, 0.75);
  mesh(root, cone, m.lightRed, -70, lightY + 18.6, 646, 1.7, 1.4, 1.7, true);

  // The Theyyam ground: packed earth, torch posts, and a resting headdress.
  const theyyamEarth = ownGeometry(new THREE.CircleGeometry(11, 28));
  theyyamEarth.rotateX(-Math.PI / 2);
  mesh(
    root,
    theyyamEarth,
    m.sand,
    128,
    terrainHeight(128, -1150) + 0.06,
    -1150,
  );
  const theyyam = group(
    "Theyyam figure",
    133,
    terrainHeight(133, -1154),
    -1154,
  );
  theyyam.rotation.y = -2.2;
  mesh(theyyam, cylinder, m.theyyamRed, 0, 1.1, 0, 1.15, 2.2, 1.15, true);
  mesh(theyyam, cylinder, m.theyyamRed, 0, 2.6, 0, 0.5, 0.9, 0.5, true);
  mesh(theyyam, sphere, m.gold, 0, 3.25, 0, 0.3, 0.34, 0.3, true);
  const headdress = mesh(
    theyyam,
    cylinder,
    m.theyyamRed,
    0,
    4.6,
    0.1,
    2.6,
    2.9,
    0.4,
    true,
  );
  headdress.rotation.x = 0.1;
  for (let i = 0; i < 9; i++) {
    const a = -1.35 + i * 0.34;
    mesh(
      theyyam,
      sphere,
      m.gold,
      Math.sin(a) * 2.35,
      4.6 + Math.cos(a) * 2.6,
      0.32,
      0.16,
      0.16,
      0.1,
    );
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const tx = 128 + Math.cos(a) * 9.5;
    const tz = -1150 + Math.sin(a) * 9.5;
    block(root, m.wood, tx, terrainHeight(tx, tz) + 1.1, tz, 0.14, 2.2, 0.14);
    mesh(
      root,
      sphere,
      m.lamp,
      tx,
      terrainHeight(tx, tz) + 2.4,
      tz,
      0.2,
      0.28,
      0.2,
    );
  }

  // The Pooram ground: gopuram-style gate and caparisoned elephants.
  ground("Pooram festival ground", 78, 116, -762, -722, m.sand, 0.055, 4);
  const gateY = terrainHeight(78, -750);
  for (const side of [-6, 6])
    block(root, m.laterite, 78, gateY + 2.6, -750 + side, 1.6, 5.2, 1.6, true);
  block(root, m.cream, 78, gateY + 5.6, -750, 1.9, 1.1, 14, true);
  block(root, m.roof, 78, gateY + 6.5, -750, 2.3, 0.8, 12, true);
  block(root, m.roofDark, 78, gateY + 7.2, -750, 1.7, 0.7, 8, true);
  block(root, m.gold, 78, gateY + 7.9, -750, 0.5, 0.8, 3, true);
  const elephants = [];
  function elephant(x, z, yaw, dressed = false) {
    const e = group("Elephant", x, terrainHeight(x, z), z);
    e.rotation.y = yaw;
    const ears = [];
    mesh(e, sphere, m.grey, 0, 1.9, 0.3, 1.25, 1.15, 1.75, true);
    mesh(e, sphere, m.grey, 0, 2.3, -1.35, 0.8, 0.85, 0.8, true);
    for (const side of [-1, 1]) {
      const ear = mesh(
        e,
        sphere,
        m.grey,
        side * 0.75,
        2.4,
        -1.3,
        0.42,
        0.55,
        0.14,
        true,
      );
      ear.rotation.y = side * 0.5;
      ear.userData.side = side;
      ears.push(ear);
      beam(
        e,
        m.white,
        [side * 0.3, 1.75, -1.85],
        [side * 0.42, 1.35, -2.15],
        0.07,
      );
    }
    beam(e, m.grey, [0, 1.95, -1.95], [0, 1.1, -2.2], 0.17);
    beam(e, m.grey, [0, 1.1, -2.2], [0, 0.35, -2.05], 0.13);
    for (const lx of [-0.55, 0.55])
      for (const lz of [-0.7, 1.1]) {
        mesh(e, cylinder, m.grey, lx, 0.65, lz, 0.3, 1.3, 0.3, true);
      }
    beam(e, m.grey, [0, 2.1, 1.9], [0, 1.2, 2.15], 0.05);
    if (dressed) {
      const cap = mesh(e, plane, m.gold, 0, 2.5, -1.78, 1.05, 1.5, 1);
      cap.rotation.x = -0.42;
      block(e, m.rose, 0, 2.62, 0.3, 2, 0.14, 2.4);
      block(e, m.darkWood, 0, 3, 0.3, 0.1, 0.7, 0.1);
      mesh(e, cone, m.teal, 0, 3.7, 0.3, 1, 0.7, 1, true);
    }
    elephants.push({ group: e, ears, baseY: e.position.y });
    return e;
  }
  elephant(98, -742, 0.35, true);
  elephant(103, -750, 0.05, true);
  elephant(99, -758, -0.3, true);
  elephant(476, -494, 2.3);
  elephant(466, -507, 1.7);

  // Contoured tea rows on the Elavara slopes.
  const gradYaw = (x, z) => {
    const gx = terrainHeight(x + 1, z) - terrainHeight(x - 1, z);
    const gz = terrainHeight(x, z + 1) - terrainHeight(x, z - 1);
    return Math.atan2(gz, gx) + Math.PI / 2;
  };
  for (const patch of [
    [516, 556, -316, -246],
    [572, 612, -302, -232],
  ]) {
    for (let x = patch[0]; x <= patch[1]; x += 5) {
      for (let z = patch[2]; z <= patch[3]; z += 4.6) {
        const jx = x + (random() - 0.5) * 1.4;
        const jz = z + (random() - 0.5) * 1.4;
        instance(
          box,
          m.tea,
          jx,
          terrainHeight(jx, jz) + 0.42,
          jz,
          4.1,
          0.95,
          1.35,
          0,
          gradYaw(jx, jz),
          0,
        );
      }
    }
  }

  // Silverthread Falls: cascade sheets off the rocky shoulder into the pool.
  for (const [sx, sz, s] of [
    [641, -180, 3.2],
    [644, -192, 2.7],
    [634, -176, 2.1],
    [630, -195, 1.8],
  ]) {
    instance(
      sphere,
      m.rock,
      sx,
      terrainHeight(sx, sz) - 0.5,
      sz,
      s,
      s * 0.75,
      s * 0.9,
      0.2,
      sx,
      0.1,
    );
  }
  const cascadeTop = terrainHeight(644, -185);
  for (const [ox, w] of [
    [0, 3.4],
    [0.9, 1.6],
  ]) {
    const fall = mesh(
      root,
      plane,
      m.cascade,
      635 - ox,
      (cascadeTop + 23) / 2 + 0.6,
      -185 + ox * 2,
      w,
      cascadeTop - 22.4,
      1,
    );
    fall.rotation.y = -Math.PI / 2;
    fall.rotation.x = 0.1;
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    instance(
      sphere,
      m.rock,
      620 + Math.cos(a) * 8.2,
      23 + random() * 0.4,
      -185 + Math.sin(a) * 8.2,
      between(0.5, 1),
      between(0.35, 0.7),
      between(0.5, 1),
      0,
      a,
      0,
    );
  }

  // Cloudline Viewpoint: a rail at the edge of the high ranges.
  for (let i = 0; i < 7; i++) {
    const a = -0.5 + i * 0.24;
    const vx = 690 + Math.cos(a + Math.PI) * 8;
    const vz = -330 + Math.sin(a + Math.PI) * 8;
    const vy = terrainHeight(vx, vz);
    block(root, m.darkWood, vx, vy + 0.55, vz, 0.15, 1.1, 0.15, true);
    if (i) {
      const px = 690 + Math.cos(a - 0.24 + Math.PI) * 8;
      const pz = -330 + Math.sin(a - 0.24 + Math.PI) * 8;
      beam(
        root,
        m.wood,
        [px, terrainHeight(px, pz) + 1.05, pz],
        [vx, vy + 1.05, vz],
        0.06,
      );
    }
  }
  block(
    root,
    m.wood,
    693,
    terrainHeight(693, -327) + 0.45,
    -327,
    2.4,
    0.12,
    0.8,
    true,
  );

  // Ashtamudi: a moored houseboat and a Chinese fishing net on the shore road.
  const lagoonBoat = boat("Ashtamudi houseboat", 4.3, 13);
  lagoonBoat.position.set(196, -0.02, 428);
  lagoonBoat.rotation.y = 0.8;
  block(lagoonBoat, m.wood, 0, 0.35, 0, 3.4, 0.14, 9.5, true);
  block(lagoonBoat, m.rope, 0, 1.15, 0.4, 3.1, 1.5, 6.9, true);
  const net = group("Chinese fishing net", 168, 0, 470);
  for (const side of [-1, 1])
    beam(net, m.wood, [side * 2.2, 0, 0], [side * 0.5, 5.2, 2.6], 0.14);
  beam(net, m.wood, [-0.5, 5.2, 2.6], [0.5, 5.2, 2.6], 0.1);
  for (const side of [-1, 1])
    beam(net, m.wood, [side * 0.5, 5.2, 2.6], [side * 3.4, 2.2, 9.4], 0.09);
  const netCloth = mesh(net, plane, m.rope, 0, 3.4, 6.6, 6.4, 6.2, 1);
  netCloth.rotation.x = -1.05;

  // Beach market extras: fish table and beached vallams.
  block(
    root,
    m.wood,
    -44,
    terrainHeight(-44, -1012) + 0.5,
    -1012,
    3.4,
    0.14,
    1.4,
    true,
  );
  for (let i = 0; i < 5; i++)
    mesh(
      root,
      sphere,
      m.white,
      -45.3 + i * 0.65,
      terrainHeight(-44, -1012) + 0.68,
      -1012,
      0.24,
      0.1,
      0.09,
    );
  for (let i = 0; i < 3; i++) {
    const vallam = boat(
      "Malabar fishing vallam",
      1.9,
      7,
      i % 2 ? hullMaterial : material("#397b85", { side: THREE.DoubleSide }),
    );
    vallam.position.set(-72 + i * 2.2, 0.25, -1040 + i * 10);
    vallam.rotation.set(0, 0.5 + i * 0.4, 0.14);
  }

  // Region signboards along the highway and the hill road.
  function signboard(x, z, yaw, title, subtitle) {
    const board = group("Region signboard", x, terrainHeight(x, z), z);
    board.rotation.y = yaw;
    for (const side of [-2.4, 2.4])
      block(board, m.darkWood, side, 1.5, 0, 0.16, 3, 0.16, true);
    sign(board, title, subtitle, 0, 2.9, 0.02, 6.4);
    return board;
  }
  signboard(
    10,
    -287,
    Math.PI,
    "CENTRAL KERALA",
    "PALAKKAD  /  THRISSUR  /  ERNAKULAM",
  );
  signboard(
    10,
    -907,
    Math.PI,
    "MALABAR COAST",
    "KOZHIKODE  /  KANNUR  /  KASARAGOD",
  );
  signboard(
    10,
    294,
    0,
    "TRAVANCORE SOUTH",
    "KOLLAM  /  PATHANAMTHITTA  /  THIRUVANANTHAPURAM",
  );
  signboard(
    384,
    -108,
    2.4,
    "THE HIGH RANGES",
    "WAYANAD  /  IDUKKI  /  TEA COUNTRY AHEAD",
  );
  signboard(
    10,
    -160,
    0,
    "THE BACKWATERS",
    "ALAPPUZHA  /  KOTTAYAM  /  KADAL VILLAGE",
  );

  // The people of the wider world.
  resident("Moidu", -46, -1002, m.teal, 0.7);
  resident("Fatima", -20, -868, m.rose, Math.PI / 2, true);
  resident("Thanka", 561, -259, m.gold, -0.7, true);
  resident("Ammini", 30, 558, m.rose, -Math.PI / 2, true);

  // ---- A living Kerala: bus stops, rest spots, wildlife, and weather ----
  for (const stop of REGION_GATEWAYS) {
    if (BUS_STOPS.some((service) => service.name === stop.name)) continue;
    const shelter = group(
      `Bus stand: ${stop.name}`,
      stop.x + 2.6,
      terrainHeight(stop.x + 2.6, stop.z),
      stop.z,
    );
    for (const side of [-1.6, 1.6])
      block(shelter, m.darkWood, side, 1.35, -0.8, 0.15, 2.7, 0.15, true);
    block(shelter, m.roofLight, 0, 2.8, -0.5, 4.4, 0.14, 2.4, true);
    block(shelter, m.wood, 0, 0.62, -1.15, 3.4, 0.1, 0.5);
    for (const side of [-1.4, 1.4])
      block(shelter, m.wood, side, 0.31, -1.15, 0.12, 0.62, 0.12);
    block(shelter, m.gold, 0, 2.2, 0.9, 0.12, 4.4, 0.12, true);
    sign(shelter, "BUS", stop.name.toUpperCase(), 0, 4.1, 0.9, 3.2);
  }
  // Seats sit slightly behind where the player settles, so they read as sat-upon.
  for (const spot of REST_SPOTS) {
    if (spot.seat === "none") continue;
    const sx = spot.x + Math.sin(spot.face) * 0.28;
    const sz = spot.z + Math.cos(spot.face) * 0.28;
    const seat = group(
      `Rest seat: ${spot.name}`,
      sx,
      terrainHeight(sx, sz),
      sz,
    );
    seat.rotation.y = spot.face;
    if (spot.seat === "log") {
      const log = mesh(
        seat,
        cylinder,
        m.wood,
        0,
        0.34,
        0,
        0.34,
        3.8,
        0.34,
        true,
      );
      log.rotation.z = Math.PI / 2;
    } else {
      block(seat, m.wood, 0, 0.44, 0, 2.6, 0.14, 0.72, true);
      block(seat, m.wood, 0, 0.82, 0.32, 2.6, 0.62, 0.1, true);
      for (const side of [-1, 1])
        block(seat, m.darkWood, side, 0.21, 0, 0.15, 0.42, 0.52);
    }
  }

  // Chundan vallam practice on the southern canal reach.
  const snakeBoats = [];
  for (let i = 0; i < 2; i++) {
    const vallam = boat(
      `Chundan vallam ${i + 1}`,
      1.1,
      13,
      material(i ? "#4a3222" : "#332417", { side: THREE.DoubleSide }),
    );
    const prow = mesh(
      vallam,
      cone,
      i ? m.gold : m.rope,
      0,
      1.6,
      6.1,
      0.4,
      3,
      0.35,
      true,
    );
    prow.rotation.x = -0.5;
    const paddlers = [];
    for (let r = 0; r < 6; r++) {
      const rower = group("Rower");
      vallam.add(rower);
      rower.position.set(0, 0.42, -4.4 + r * 1.5);
      block(rower, r % 2 ? m.cream : m.teal, 0, 0.3, 0, 0.42, 0.6, 0.34, true);
      mesh(rower, sphere, m.skin, 0, 0.78, 0, 0.16, 0.18, 0.16);
      const paddle = group("Paddle");
      rower.add(paddle);
      paddle.position.set(0.3, 0.45, 0);
      beam(paddle, m.wood, [0.12, 0.3, 0], [0.3, -0.75, 0], 0.035);
      paddlers.push(paddle);
    }
    snakeBoats.push({ vallam, paddlers, lane: i ? 41.2 : 34.8, phase: i * 40 });
  }

  // Dolphins arcing off the coast.
  const dolphins = [];
  for (const [dx, dz] of [
    [-102, 34],
    [-108, 610],
    [-118, -1040],
  ]) {
    const pod = group("Coastal dolphin");
    mesh(pod, sphere, m.stone, 0, 0, 0, 0.32, 0.3, 0.75, true);
    mesh(pod, cone, m.stone, 0, 0.34, 0.1, 0.14, 0.34, 0.08, true);
    const tail = mesh(pod, cone, m.stone, 0, 0.05, 0.85, 0.3, 0.24, 0.1, true);
    tail.rotation.x = Math.PI / 2;
    dolphins.push({ pod, x: dx, z: dz, phase: dz });
  }

  // A peacock strutting the Pooram ground.
  const peacock = group("Pooram peacock");
  mesh(peacock, sphere, m.teal, 0, 0.5, 0, 0.24, 0.26, 0.34, true);
  beam(peacock, m.teal, [0, 0.6, -0.2], [0, 1.05, -0.34], 0.06);
  mesh(peacock, sphere, m.teal, 0, 1.1, -0.36, 0.11, 0.12, 0.12, true);
  mesh(peacock, sphere, m.gold, 0, 1.28, -0.36, 0.05, 0.09, 0.03);
  const tailFan = mesh(
    peacock,
    cone,
    m.olive,
    0,
    0.85,
    0.42,
    1.15,
    1.5,
    0.12,
    true,
  );
  tailFan.rotation.x = 0.5;
  for (let i = 0; i < 5; i++) {
    mesh(
      peacock,
      sphere,
      m.teal,
      -0.6 + i * 0.3,
      1.15 + Math.sin((i / 4) * Math.PI) * 0.32,
      0.52,
      0.07,
      0.07,
      0.03,
    );
  }
  for (const lx of [-0.1, 0.1])
    beam(peacock, m.gold, [lx, 0.3, 0], [lx, 0, 0.02], 0.025);

  // Fireflies that wake with the night in the quiet green corners.
  const fireflyClusters = [];
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = glowCanvas.height = 64;
  const glowContext = glowCanvas.getContext("2d");
  const glowGradient = glowContext.createRadialGradient(32, 32, 0, 32, 32, 32);
  glowGradient.addColorStop(0, "rgba(255,250,214,1)");
  glowGradient.addColorStop(0.35, "rgba(255,226,140,0.75)");
  glowGradient.addColorStop(1, "rgba(255,214,120,0)");
  glowContext.fillStyle = glowGradient;
  glowContext.fillRect(0, 0, 64, 64);
  const glowTexture = new THREE.CanvasTexture(glowCanvas);
  glowTexture.colorSpace = THREE.SRGBColorSpace;
  textures.add(glowTexture);
  const fireflyMaterial = new THREE.PointsMaterial({
    map: glowTexture,
    color: "#ffe9a0",
    size: 0.7,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  materials.add(fireflyMaterial);
  for (const [fx, fz] of [
    [92, -70],
    [77, -118],
    [470, -500],
  ]) {
    const positions = [];
    for (let i = 0; i < 14; i++)
      positions.push(
        (random() - 0.5) * 12,
        1 + random() * 2.6,
        (random() - 0.5) * 12,
      );
    const geometry = ownGeometry(new THREE.BufferGeometry());
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    const cloud = new THREE.Points(geometry, fireflyMaterial);
    cloud.name = "Fireflies";
    cloud.position.set(fx, terrainHeight(fx, fz), fz);
    cloud.visible = false;
    root.add(cloud);
    fireflyClusters.push(cloud);
  }

  // Monsoon shower: a curtain of slanted streaks that travels with the player.
  const rainCount = 1100;
  const rainPositions = new Float32Array(rainCount * 6);
  for (let i = 0; i < rainCount; i++) {
    const x = (Math.random() - 0.5) * 52;
    const y = Math.random() * 26;
    const z = (Math.random() - 0.5) * 52;
    rainPositions.set([x, y, z, x + 0.16, y - 1.15, z + 0.1], i * 6);
  }
  const rainGeometry = ownGeometry(new THREE.BufferGeometry());
  rainGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(rainPositions, 3),
  );
  const rainMaterial = new THREE.LineBasicMaterial({
    color: "#e6f2ee",
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  });
  materials.add(rainMaterial);
  const rain = new THREE.LineSegments(rainGeometry, rainMaterial);
  rain.name = "Monsoon shower";
  rain.frustumCulled = false;
  rain.visible = false;
  root.add(rain);

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
    if (x > -63 && x < -33 && z > -125 && z < -91) return false;
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
  // Distant silhouettes of the deeper Western Ghats, beyond the playable east edge.
  const mountainMaterial = material("#78958a", { flatShading: true });
  for (let i = 0; i < 16; i++) {
    const height = between(55, 115);
    instance(
      cone,
      mountainMaterial,
      between(800, 1000),
      height / 2 - 6,
      -1250 + i * 105 + Math.sin(i * 3) * 30,
      between(60, 110),
      height,
      between(55, 95),
      0,
      i,
      0,
    );
  }

  // ---- Scattered vegetation across the wider Kerala ----
  const segDist = (x, z, ax, az, bx, bz) => {
    const dx = bx - ax,
      dz = bz - az;
    const t = clampT(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz));
    return Math.hypot(x - (ax + dx * t), z - (az + dz * t));
  };
  function clampT(v) {
    return Math.max(0, Math.min(1, v));
  }
  function nearRoad(x, z, margin = 6) {
    if (Math.abs(x - HIGHWAY.x) < margin + 1) return true;
    for (const road of roads) {
      for (let i = 1; i < road.points.length; i++) {
        const [ax, az] = road.points[i - 1];
        const [bx, bz] = road.points[i];
        if (
          x > Math.min(ax, bx) - margin - 8 &&
          x < Math.max(ax, bx) + margin + 8 &&
          z > Math.min(az, bz) - margin - 8 &&
          z < Math.max(az, bz) + margin + 8 &&
          segDist(x, z, ax, az, bx, bz) < margin
        )
          return true;
      }
    }
    return false;
  }
  function clearWide(x, z) {
    if (x < coastX(z) + 5) return false;
    if (Math.abs(z + 600) < 36 && x < 430) return false;
    if (((x - 250) / 95) ** 2 + ((z - 450) / 140) ** 2 < 1.35) return false;
    if (Math.hypot(x - 620, z + 185) < 20) return false;
    if (x > 29 && x < 47 && z > -160 && z < 160) return false;
    if (x > -63 && x < -33 && z > -125 && z < -91) return false;
    if (Math.hypot(x - 128, z + 1150) < 15) return false;
    if (x > -97 && x < -33 && z > -1378 && z < -1326) return false;
    if (x > 72 && x < 118 && z > -768 && z < -716) return false;
    if (x > 510 && x < 618 && z > -322 && z < -226) return false;
    if (nearRoad(x, z)) return false;
    if (
      buildings.some(
        (b) =>
          Math.abs(x - b.x) < b.w / 2 + 4 && Math.abs(z - b.z) < b.d / 2 + 4,
      )
    )
      return false;
    if (
      solids.some(
        (s) =>
          Math.abs(x - s.x) < s.w / 2 + 3 && Math.abs(z - s.z) < s.d / 2 + 3,
      )
    )
      return false;
    return !sites.some(
      (site) =>
        Math.hypot(x - site.x, z - site.z) < Math.min(site.radius, 10) + 2,
    );
  }
  function roundTree(x, z, size) {
    const y = terrainHeight(x, z);
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
  }
  // Coastal palm fringe the whole length of the shore.
  for (let attempt = 0, count = 0; attempt < 700 && count < 110; attempt++) {
    const z = between(-1490, 890);
    if (Math.abs(z) < 155) continue;
    const x = coastX(z) + between(5, 30);
    if (!clearWide(x, z)) continue;
    palm(x, z, between(0.8, 1.3));
    count++;
  }
  // Mixed countryside trees through the plains.
  for (let attempt = 0, count = 0; attempt < 1200 && count < 175; attempt++) {
    const x = between(-70, 378);
    const z = between(-1460, 870);
    if (Math.abs(z) < 175) continue;
    if (!clearWide(x, z)) continue;
    if (random() < 0.55) palm(x, z, between(0.8, 1.3));
    else roundTree(x, z, between(0.85, 1.4));
    count++;
  }
  // The Wayanad-style forest belt hiding the elephant meadow.
  for (let attempt = 0, count = 0; attempt < 500 && count < 85; attempt++) {
    const x = between(422, 525);
    const z = between(-570, -430);
    if (!clearWide(x, z)) continue;
    roundTree(x, z, between(1.15, 1.75));
    count++;
  }
  // High-range shola trees and grey outcrops.
  for (let attempt = 0, count = 0; attempt < 700 && count < 100; attempt++) {
    const x = between(415, 750);
    const z = between(-1400, 860);
    if (!clearWide(x, z)) continue;
    const y = terrainHeight(x, z);
    const s = between(0.8, 1.5);
    if (random() < 0.75) {
      instance(
        cylinder,
        m.darkWood,
        x,
        y + 1.2 * s,
        z,
        0.16 * s,
        2.4 * s,
        0.16 * s,
      );
      instance(
        cone,
        m.leaf,
        x,
        y + (2.4 + 1.9) * s,
        z,
        1.5 * s,
        4.2 * s,
        1.5 * s,
      );
    } else {
      instance(
        sphere,
        m.rock,
        x,
        y + 0.3,
        z,
        between(0.8, 2.2),
        between(0.5, 1.4),
        between(0.8, 2),
        0,
        x,
        0.1,
      );
    }
    count++;
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

  const walkerConfigs = [
    { x: -1.6, from: -121, to: 127, shirt: m.teal },
    { x: -1.6, from: -121, to: 127, shirt: m.rose },
    { x: -1.6, from: -121, to: 127, shirt: m.white },
    { x: 58, from: -104, to: 72, shirt: m.gold },
    { x: 58, from: -104, to: 72, shirt: m.olive },
    { x: -1.6, from: -540, to: -330, shirt: m.cream },
    { x: -1.6, from: -940, to: -820, shirt: m.teal },
    { x: -1.6, from: 320, to: 520, shirt: m.rose },
    { x: 540, from: -302, to: -262, shirt: m.gold },
  ];
  const walkers = walkerConfigs.slice(5).map((config, i) => ({
    ...human(`Kerala walker ${i + 1}`, config.shirt, m.cream),
    ...config,
    phase: i * 43,
  }));
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
  function makeRickshaw(bodyColor) {
    const rickshaw = group("Auto-rickshaw");
    block(rickshaw, bodyColor, 0, 0.62, 0.2, 1.45, 0.6, 2.35, true);
    block(rickshaw, m.gold, 0, 0.85, -0.96, 1.35, 0.8, 0.55, true);
    block(rickshaw, m.black, 0, 1.93, 0.08, 1.62, 0.2, 2.24, true);
    block(rickshaw, m.darkWood, 0, 1.07, 0.5, 1.18, 0.21, 0.55);
    block(rickshaw, m.glass, 0, 1.47, -0.99, 1.15, 0.66, 0.045);
    for (const side of [-1, 1]) {
      block(rickshaw, m.gold, side * 0.68, 1.44, -1, 0.08, 0.93, 0.08);
      block(rickshaw, m.black, side * 0.68, 1.4, 1.04, 0.09, 1, 0.09);
      mesh(
        rickshaw,
        sphere,
        m.lamp,
        side * 0.43,
        0.91,
        -1.25,
        0.15,
        0.12,
        0.06,
      );
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
    return { group: rickshaw, wheels };
  }
  const feederAuto = makeRickshaw(m.black);
  feederAuto.group.name = "Village feeder auto";
  for (const stop of AUTO_STOPS) {
    const stand = group(
      stop.name,
      stop.x + 2,
      terrainHeight(stop.x + 2, stop.z),
      stop.z + 2,
    );
    block(stand, m.wood, 0, 1, 0, 0.12, 2, 0.12);
    sign(stand, "AUTO", "BUS STAND / FAR BANK", 0, 2, 0, 2.3);
  }
  const rickshaws = [
    {
      ...makeRickshaw(m.teal),
      x: 3.5,
      from: -120,
      to: 124,
      speed: 8,
      phase: 0,
    },
    {
      ...makeRickshaw(m.gold),
      x: 3.5,
      from: -1280,
      to: -180,
      speed: 12,
      phase: 700,
    },
    {
      ...makeRickshaw(m.rose),
      x: 3.5,
      from: 170,
      to: 820,
      speed: 11,
      phase: 300,
    },
  ];

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
  for (let i = 0; i < 15; i++) {
    const bird = group("Coastal bird");
    mesh(bird, sphere, m.cream, 0, 0, 0, 0.12, 0.11, 0.32);
    const wings = [-1, 1].map((side) =>
      mesh(bird, wingGeometry, birdMaterial, 0, 0, 0, side, 1, 1),
    );
    const home =
      i < 8
        ? { x: -34, z: 22, rx: 49, rz: 65 }
        : i < 12
          ? { x: 250, z: 450, rx: 60, rz: 80 }
          : { x: -60, z: -1050, rx: 45, rz: 70 };
    birds.push({ bird, wings, home });
  }

  const bus = group("Kadal–Periyar local bus");
  const busPaint = material("#af493c");
  block(bus, busPaint, 0, 1.5, 0, 2.35, 2.15, 8, true);
  block(bus, m.cream, 0, 2.85, 0, 2.38, 0.58, 8.05, true);
  block(bus, m.gold, 0, 1.15, 0, 2.4, 0.16, 8.08);
  for (const side of [-1, 1]) {
    for (let z = -2.8; z <= 2.9; z += 1.15)
      block(bus, m.glass, side * 1.19, 2.2, z, 0.03, 0.72, 0.93);
    for (const z of [-2.6, 2.6]) {
      const wheel = mesh(
        bus,
        cylinder,
        m.black,
        side * 1.18,
        0.55,
        z,
        0.5,
        0.24,
        0.5,
      );
      wheel.rotation.z = Math.PI / 2;
      const hub = mesh(
        bus,
        cylinder,
        m.cream,
        side * 1.32,
        0.55,
        z,
        0.2,
        0.025,
        0.2,
      );
      hub.rotation.z = Math.PI / 2;
    }
    block(bus, m.lamp, side * 0.8, 1.1, -4.03, 0.35, 0.25, 0.06);
  }
  block(bus, m.glass, 0, 2.1, -4.02, 1.95, 0.86, 0.04);
  block(bus, m.darkWood, 0, 0.82, -4.09, 2.35, 0.18, 0.12);
  sign(bus, "KADAL – PERIYAR", "LOCAL SERVICE", 0, 2.9, -4.08, 1.95, Math.PI);
  const busDriver = human("Local bus driver", m.cream);
  bus.add(busDriver.person);
  busDriver.person.position.set(0.55, 1, -2.8);
  busDriver.person.scale.setScalar(0.75);
  const commuters = [human("Madhan", m.olive), human("Sreedevi", m.rose)];
  for (const stop of BUS_STOPS) {
    const stand = group(
      "Local service waiting shelter",
      stop.x,
      terrainHeight(stop.x, stop.z),
      stop.z,
    );
    roof(stand, 2.8, 2.65, 0, 4.8, 5, 0.8);
    for (const z of [-2, 2]) block(stand, m.wood, 4.5, 1.3, z, 0.13, 2.6, 0.13);
    block(stand, m.wood, 3.2, 0.6, 0, 1.4, 0.16, 3);
    sign(
      stand,
      "KADAL / PERIYAR",
      "LOCAL BUS · 6 AM – 8 PM",
      2.8,
      2.2,
      2.4,
      3.8,
    );
  }

  // Broad, folded banana leaves use one small geometry shared by every plant.
  const bananaGeometry = ownGeometry(new THREE.BufferGeometry());
  const bananaVertices = [];
  for (let i = 0; i < 8; i++) {
    const a = i / 8,
      b = (i + 1) / 8;
    const center = (t) => [t * 4.4, Math.sin(t * Math.PI) - t * t, 0];
    for (const side of [-1, 1]) {
      const edge = (t) => [
        t * 4.4,
        center(t)[1] - 0.16,
        side * Math.sin(t * Math.PI) * 0.85,
      ];
      bananaVertices.push(
        ...center(a),
        ...edge(a),
        ...edge(b),
        ...center(a),
        ...edge(b),
        ...center(b),
      );
    }
  }
  bananaGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(bananaVertices, 3),
  );
  bananaGeometry.computeVertexNormals();
  // Small gardens and layered banks share geometry and instance batches.
  const blossom = material("#db786d"),
    gardenGreen = material("#477956");
  for (const [x, z] of [
    [-32, 50],
    [-34, 78],
    [79, 32],
    [80, -34],
    [-34, -52],
  ]) {
    for (let i = 0; i < 7; i++) {
      const gx = x + Math.cos(i * 2.4) * 2.3,
        gz = z + Math.sin(i * 2.4) * 2;
      if (!clearVegetation(gx, gz, 2)) continue;
      const y = terrainHeight(gx, gz);
      instance(sphere, gardenGreen, gx, y + 0.65, gz, 0.8, 0.7, 0.8);
      for (let j = 0; j < 3; j++)
        instance(
          sphere,
          blossom,
          gx + Math.cos(j * 2) * 0.6,
          y + 1,
          gz + Math.sin(j * 2) * 0.6,
          0.11,
          0.1,
          0.11,
        );
    }
    if (clearVegetation(x, z, 2)) {
      const y = terrainHeight(x, z);
      instance(cylinder, m.olive, x, y + 1.5, z, 0.16, 3, 0.16);
      for (let leaf = 0; leaf < 7; leaf++)
        instance(
          bananaGeometry,
          leaf % 2 ? m.leafLight : m.leaf,
          x,
          y + 3,
          z,
          0.55,
          0.45,
          0.5,
          0,
          (leaf * Math.PI * 2) / 7,
          -0.18,
        );
    }
  }
  for (let z = -136; z < 138; z += 4.5) {
    if (
      Math.abs(z) < 10 ||
      Math.abs(z + 90) < 10 ||
      Math.abs(z - 8) < 9 ||
      Math.abs(z - 65) < 9
    )
      continue;
    for (const x of [28.2, 48]) {
      const y = terrainHeight(x, z);
      instance(sphere, gardenGreen, x, y + 0.2, z, 0.6, 0.35, 1.1);
      instance(
        cone,
        m.leafLight,
        x + 0.25,
        y + 0.55,
        z,
        0.15,
        1,
        0.2,
        0,
        z,
        0.15,
      );
    }
  }

  const animated = new Set([
    catchBoat,
    fisher.person,
    fishBasket,
    vendor.person,
    marketFish,
    fishBuyer.person,
    feederAuto.group,
    bus,
    ...commuters.map((p) => p.person),
    player,
    ferry,
    coirCover,
    ...[...villagers.values()].map((v) => v.person),
    canoe,
    houseboat,
    lagoonBoat,
    ...rickshaws.map((r) => r.group),
    scooter,
    peacock,
    ...beacons.values(),
    ...elephants.map((e) => e.group),
    ...snakeBoats.map((s) => s.vallam),
    ...dolphins.map((d) => d.pod),
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
  function update(time = 0, dt = 0, night = 0, world = {}) {
    if (disposed) return;
    const t = Number.isFinite(time) ? time : 0;
    const darkness = THREE.MathUtils.clamp(Number(night) || 0, 0, 1);
    const wetness = THREE.MathUtils.clamp(Number(world.rain) || 0, 0, 1);
    if (world.life) {
      const life = world.life;
      const fishing = life.fishing,
        fp = fishingPosition(fishing);
      catchBoat.position.set(
        fp.atSea ? fp.x : -89,
        -0.03 + Math.sin(t) * 0.025,
        fp.atSea ? fp.z : 12,
      );
      catchBoat.rotation.y = fp.atSea ? fp.heading : Math.PI * 0.35;
      fisher.person.position.set(
        fp.x,
        fp.atSea ? 0.18 : terrainHeight(fp.x, fp.z),
        fp.z,
      );
      fisher.person.rotation.y = fp.heading;
      const carrying = fishing.phase === "delivering";
      fisher.limbs.forEach((limb, i) => {
        limb.rotation.x =
          carrying && i > 1
            ? -0.9
            : ["delivering", "walking-home"].includes(fishing.phase)
              ? Math.sin(t * 6) * (i % 2 ? -0.4 : 0.4)
              : 0;
      });
      fishBasket.visible = fishing.cargo > 0;
      fishBasket.position.set(
        fp.x,
        fp.atSea ? 0.3 : terrainHeight(fp.x, fp.z) + (carrying ? 1 : 0.2),
        fp.z + 0.8,
      );
      fishBasket.children.forEach((crate, i) => {
        crate.visible = i < fishing.cargo;
      });
      const trading = fishMarketOpen(fishing, lifeHour(life), wetness);
      vendor.person.visible = lifeHour(life) >= 6 && lifeHour(life) < 18;
      marketFish.children.forEach((fish, i) => {
        fish.visible = i < fishing.stock;
      });
      marketFish.visible = fishing.stock > 0;
      const buyerX = -4 - fishing.buyer * 4,
        buyerZ = 52 - fishing.buyer * 6;
      fishBuyer.person.position.set(
        buyerX,
        terrainHeight(buyerX, buyerZ),
        buyerZ,
      );
      fishBuyer.person.visible = trading || fishing.buyer > 0;
      fishBuyer.person.rotation.y = trading ? 0.59 : Math.PI + 0.59;
      fishBuyer.limbs.forEach((limb, i) => {
        limb.rotation.x =
          fishing.buyer > 0 && fishing.buyer < 1
            ? Math.sin(t * 6) * (i % 2 ? -0.4 : 0.4)
            : 0;
      });
      const ap = autoPosition(life.auto);
      feederAuto.group.position.set(ap.x, terrainHeight(ap.x, ap.z), ap.z);
      feederAuto.group.rotation.y = ap.heading;
      feederAuto.wheels.forEach((w) => {
        if (life.auto.phase === "travelling" && !life.auto.yielding)
          w.rotation.x += dt * 10;
      });
      const bp = busPosition(life.bus);
      bus.position.set(bp.x, terrainHeight(bp.x, bp.z), bp.z);
      bus.rotation.y = bp.heading;
      life.bus.commuters.forEach((p, i) => {
        const actor = commuters[i];
        const x = p.aboard ? bp.x + (i ? -0.55 : 0.55) : p.x,
          z = p.aboard ? bp.z + 0.7 : p.z;
        actor.person.position.set(
          x,
          terrainHeight(x, z) + (p.aboard ? 1 : 0),
          z,
        );
        const destination = lifeHour(life) >= 7 && lifeHour(life) < 16 ? 1 : 0;
        const targetX = p.stop === destination ? 26 : 8;
        const walking = !p.aboard && Math.abs(p.x - targetX) > 0.05;
        actor.person.rotation.y = p.aboard
          ? bp.heading
          : targetX > p.x
            ? Math.PI / 2
            : -Math.PI / 2;
        actor.limbs.forEach((limb, j) => {
          limb.rotation.x = walking
            ? Math.sin(t * 6 + i) * (j % 2 ? -0.4 : 0.4)
            : 0;
        });
      });
      const f = ferryPosition(life);
      ferry.position.set(f.x, -0.03 + Math.sin(t) * 0.025, f.z);
      ferry.rotation.y = f.heading;
      coirCover.visible = life.coir.phase !== "outside";
      coirCover.scale.z =
        life.coir.phase === "covering"
          ? Math.max(0.1, 1 - life.coir.remaining / 24) * 2.5
          : 2.5;
      life.residents.forEach((r) => {
        const v = villagers.get(r.id);
        const passenger = life.ferry.passengers.indexOf(r.id);
        const target =
          passenger >= 0
            ? {
                x: f.x + (passenger % 2 ? 0.5 : -0.5),
                z: f.z + Math.floor(passenger / 2),
              }
            : r;
        const blend =
          dt > 0 && v.person.userData.onBoat === passenger >= 0
            ? 1 - Math.exp(-18 * dt)
            : 1;
        v.person.position.x += (target.x - v.person.position.x) * blend;
        v.person.position.z += (target.z - v.person.position.z) * blend;
        v.person.position.y =
          passenger >= 0
            ? 0.2
            : terrainHeight(v.person.position.x, v.person.position.z);
        v.person.userData.onBoat = passenger >= 0;
        v.person.rotation.y = passenger >= 0 ? f.heading : r.heading;
        v.limbs.forEach((limb, i) => {
          limb.rotation.x = r.moving
            ? Math.sin(t * (wetness > 0.4 ? 9 : 6)) * (i % 2 ? -0.4 : 0.4)
            : 0;
          if (r.mode === "covering" && i > 1)
            limb.rotation.x = -0.9 + Math.sin(t * 3) * 0.3;
        });
      });
    }
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
    // When the rain comes everyone walks faster, heads down, arm over the head.
    const hurry = 1 + wetness * 1.35;
    walkers.forEach(({ person, limbs, x, from, to, phase }) => {
      const length = to - from;
      const pace = t * 0.85 * hurry;
      const travel =
        (((pace + phase) % (length * 2)) + length * 2) % (length * 2);
      const forward = travel < length;
      const z = from + (forward ? travel : length * 2 - travel);
      person.position.set(x, terrainHeight(x, z), z);
      person.rotation.y = forward ? Math.PI : 0;
      const swing = Math.sin(t * 4 * hurry + phase) * (0.38 + wetness * 0.22);
      limbs.forEach((limb, i) => {
        if (wetness > 0.45 && i === 2) {
          // One arm up against the shower, the way everyone does it.
          limb.rotation.x = -2.5;
          return;
        }
        limb.rotation.x = swing * (i === 0 || i === 3 ? 1 : -1);
      });
    });
    drummers.forEach(({ limbs }, i) => {
      const participant = world.life?.residents.find(
        (r) => r.id === ["anil", "usha", "mani"][i],
      );
      if (!world.life?.rehearsal.active || participant?.mode !== "working")
        return;
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
    lagoonBoat.position.y = -0.02 + Math.sin(t * 0.7 + 2) * 0.035;
    lagoonBoat.rotation.z = Math.sin(t * 0.5) * 0.008;
    rickshaws.forEach(({ group: auto, wheels, x, from, to, speed, phase }) => {
      auto.visible = !(world.life && from === -120);
      if (!auto.visible) return;
      const length = to - from;
      const travel =
        (((t * speed + phase) % (length * 2)) + length * 2) % (length * 2);
      const forward = travel < length;
      const z = from + (forward ? travel : length * 2 - travel);
      auto.position.set(x, terrainHeight(x, z) + 0.045, z);
      auto.rotation.y = forward ? Math.PI : 0;
      wheels.forEach((tire) => {
        tire.rotation.x = t * 7;
      });
    });
    birds.forEach(({ bird, wings, home }, i) => {
      const angle = t * 0.035 + i * 0.075;
      bird.position.set(
        home.x + Math.cos(angle) * home.rx + i * 0.5,
        19 + Math.sin(t * 0.3 + i) * 1.3 + (i % 6) * 0.4,
        home.z + Math.sin(angle) * home.rz - (i % 5) * 2,
      );
      bird.rotation.y = -angle;
      wings[0].rotation.z = Math.sin(t * 4.8 + i * 0.6) * 0.45;
      wings[1].rotation.z = -wings[0].rotation.z;
    });
    beacons.forEach((beacon) => {
      if (!beacon.visible) return;
      const phase = beacon.userData.phase;
      beacon.position.y =
        beacon.userData.baseY + Math.sin(t * 1.6 + phase) * 0.35;
      beacon.rotation.y = t * 0.9 + phase;
      beacon.material.opacity = 0.62 + Math.sin(t * 2.4 + phase) * 0.22;
    });
    // Chundan vallams race the canal in long, surging strokes.
    snakeBoats.forEach(({ vallam, paddlers, lane, phase }, i) => {
      // Keep the canal clear for its service; races will return as scheduled gatherings.
      vallam.visible = !world.life;
      if (!vallam.visible) return;
      const stroke = t * 1.9 + i;
      const surge = 0.72 + Math.max(0, Math.sin(stroke)) * 0.55;
      const travel = ((t * 9 * surge + phase) % 300) - 140;
      vallam.position.set(lane, -0.05 + Math.sin(t * 1.6 + i) * 0.05, travel);
      vallam.rotation.y = Math.PI;
      vallam.rotation.z = Math.sin(stroke) * 0.035;
      paddlers.forEach((p, j) => {
        p.rotation.x = Math.sin(stroke - j * 0.12) * 0.85;
      });
    });
    // Dolphins arc out of the sea and slip back under.
    dolphins.forEach(({ pod, x, z, phase }, i) => {
      const cycle = (t * 0.5 + phase) % 9;
      const leap = cycle < 2.4 ? Math.sin((cycle / 2.4) * Math.PI) : 0;
      pod.visible = leap > 0.02;
      pod.position.set(
        x + Math.sin(t * 0.2 + i) * 5,
        -0.5 + leap * 2.1,
        z + cycle * 4 - 8,
      );
      pod.rotation.x = Math.cos((cycle / 2.4) * Math.PI) * 0.8;
      pod.rotation.y = 0.3 + i;
    });
    // Elephants breathe, sway, and flap their ears.
    elephants.forEach(({ group: e, ears, baseY }, i) => {
      e.position.y = baseY + Math.sin(t * 0.9 + i) * 0.045;
      ears.forEach((ear) => {
        ear.rotation.y =
          ear.userData.side * (0.5 + Math.sin(t * 1.7 + i * 2) * 0.35);
      });
    });
    // The peacock patrols the Pooram ground and fans its tail now and then.
    const strut = t * 0.16 + 1;
    peacock.position.set(
      95 + Math.cos(strut) * 7,
      terrainHeight(95, -740) + 0.1,
      -740 + Math.sin(strut) * 7,
    );
    peacock.rotation.y = -strut + Math.PI / 2;
    const fan = Math.max(0, Math.sin(t * 0.25));
    tailFan.scale.set(0.5 + fan * 1.4, 1.5, 0.12);
    tailFan.rotation.x = 0.5 + fan * 0.5;
    // Fireflies only come out at night.
    const fireflyOn = darkness > 0.45;
    fireflyClusters.forEach((cloud, i) => {
      cloud.visible = fireflyOn;
      if (fireflyOn) cloud.rotation.y = t * 0.12 + i;
    });
    fireflyMaterial.opacity = 0.35 + Math.sin(t * 2.2) * 0.25 + darkness * 0.3;
    // Monsoon drizzle falls around the player while a rain event is running.
    rain.visible = wetness > 0.01;
    if (rain.visible) {
      const rx = world.x || 0;
      const rz = world.z || 0;
      rain.position.set(rx, terrainHeight(rx, rz) - 1, rz);
      rainMaterial.opacity = 0.62 * wetness;
      const array = rainGeometry.attributes.position.array;
      const fall = dt * 34;
      for (let i = 1; i < array.length; i += 3) {
        array[i] -= fall;
        if (array[i] < -1.2) array[i] += 26;
      }
      rainGeometry.attributes.position.needsUpdate = true;
    }
    // Player movement, limb gait, canoe visibility and scene lighting belong to the engine.
    // The paddle only works when the canoe is actually being driven along.
    if (canoe.visible) {
      const rowing = THREE.MathUtils.clamp(Number(world.rowing) || 0, 0, 1);
      paddle.rotation.z =
        -0.7 + Math.sin(t * (1.4 + rowing * 3.2)) * (0.06 + rowing * 0.42);
    }
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
  return {
    player,
    playerLimbs,
    canoe,
    scooter,
    scooterWheels,
    beacons,
    update,
    dispose,
  };
}
