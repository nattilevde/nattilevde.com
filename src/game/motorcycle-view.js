import * as THREE from "three";
export function buildMotorcycle({
  group,
  block,
  mesh,
  cylinder,
  sphere,
  m,
  material,
  human,
}) {
  const root = group("Trail motorcycle");
  const paint = material("#a15c35", { roughness: 0.45 });
  const head = material("#ffefc8", {
    emissive: "#ffe3a4",
    emissiveIntensity: 0.1,
  });
  const tail = material("#c3261c", {
    emissive: "#ff2714",
    emissiveIntensity: 0.05,
  });
  block(root, m.darkWood, 0, 0.65, 0, 0.3, 0.18, 1.9);
  mesh(root, sphere, paint, 0, 0.95, -0.25, 0.3, 0.3, 0.48);
  block(root, m.black, 0, 1.02, 0.35, 0.45, 0.13, 0.85);
  block(root, m.darkWood, 0, 0.56, 0, 0.45, 0.4, 0.6);
  block(root, m.grey, 0.33, 0.5, 0.35, 0.12, 0.12, 0.8);
  block(root, tail, 0, 0.88, 1.02, 0.23, 0.13, 0.06);
  const wheels = [];
  for (const z of [-0.92, 0.92]) {
    const pivot = group("Motorcycle wheel");
    root.add(pivot);
    pivot.position.set(0, 0.4, z);
    const rolling = group("Motorcycle tyre");
    pivot.add(rolling);
    const tyre = mesh(rolling, cylinder, m.black, 0, 0, 0, 0.4, 0.16, 0.4);
    tyre.rotation.z = Math.PI / 2;
    const hub = mesh(rolling, cylinder, m.grey, 0, 0, 0, 0.25, 0.17, 0.25);
    hub.rotation.z = Math.PI / 2;
    wheels.push({ pivot, rolling, front: z < 0 });
  }
  const fork = group("Steering fork");
  root.add(fork);
  fork.position.set(0, 0, -0.92);
  for (const x of [-0.13, 0.13])
    block(fork, m.grey, x, 0.75, 0, 0.055, 0.75, 0.07);
  block(fork, m.black, 0, 1.2, 0, 0.8, 0.07, 0.07);
  mesh(fork, sphere, head, 0, 1.03, -0.1, 0.18, 0.18, 0.1);
  const rider = human("Motorcycle rider", m.teal);
  root.add(rider.person);
  rider.person.position.set(0, 0.12, 0.28);
  rider.person.scale.setScalar(0.72);
  rider.limbs.slice(0, 2).forEach((l) => (l.rotation.x = -0.85));
  rider.limbs.slice(2).forEach((l) => (l.rotation.x = -0.85));
  mesh(rider.person, sphere, m.darkWood, 0, 1.97, 0, 0.29, 0.29, 0.29);
  rider.person.visible = false;
  const light = new THREE.SpotLight(0xffedc8, 0, 50, 0.55, 0.5, 1);
  light.position.set(0, 1, -1);
  light.target.position.set(0, 0, -20);
  root.add(light, light.target);
  return {
    animated: [root],
    update(life) {
      const p = life.motorcycle;
      root.position.set(p.x, p.y, p.z);
      root.rotation.set(p.pitch, p.heading, p.roll);
      wheels.forEach((w) => {
        w.pivot.rotation.y = w.front ? -p.steer : 0;
        w.rolling.rotation.x = p.travel / 0.4;
      });
      fork.rotation.y = -p.steer;
    },
    setLighting(on, braking, active) {
      light.intensity = on ? 130 : 0;
      head.emissiveIntensity = on ? 2.5 : 0.1;
      tail.emissiveIntensity = braking ? 4 : on ? 0.4 : 0.05;
      rider.person.visible = active;
    },
  };
}
