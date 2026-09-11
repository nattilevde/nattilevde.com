import * as THREE from "three";
export function buildRoadCar({ group, block, mesh, cylinder, m, material }) {
  const car = group("Coastal Saloon");
  const paint = material("#345a70", { roughness: 0.38, metalness: 0.15 });
  const glass = material("#34464e", { roughness: 0.2 });
  const head = material("#fff0c9", {
    emissive: "#ffe4ac",
    emissiveIntensity: 0.1,
  });
  const tail = material("#bd251f", {
    emissive: "#ff2211",
    emissiveIntensity: 0.05,
  });
  block(car, paint, 0, 0.65, 0, 1.85, 0.65, 4.1);
  block(car, paint, 0, 1.13, 0.15, 1.65, 0.65, 2.05);
  block(car, glass, 0, 1.23, -0.9, 1.48, 0.42, 0.06);
  block(car, glass, 0, 1.23, 1.2, 1.48, 0.42, 0.06);
  for (const side of [-1, 1]) {
    block(car, glass, side * 0.835, 1.23, 0.15, 0.04, 0.42, 1.75);
    block(car, paint, side * 0.86, 1.25, 0.15, 0.05, 0.45, 0.08);
    block(car, head, side * 0.62, 0.72, -2.06, 0.45, 0.2, 0.06);
    block(car, tail, side * 0.62, 0.72, 2.06, 0.45, 0.18, 0.06);
    block(car, m.black, side * 1.02, 1.12, -0.65, 0.22, 0.13, 0.22);
  }
  block(car, m.black, 0, 0.57, -2.075, 0.6, 0.2, 0.05);
  const wheels = [];
  for (const x of [-0.94, 0.94])
    for (const z of [-1.3, 1.3]) {
      const pivot = group("Saloon wheel");
      car.add(pivot);
      pivot.position.set(x, 0.36, z);
      const wheel = mesh(pivot, cylinder, m.black, 0, 0, 0, 0.36, 0.18, 0.36);
      wheel.rotation.z = Math.PI / 2;
      wheels.push({ pivot, wheel, front: z < 0 });
    }
  const light = new THREE.SpotLight(0xffefcb, 0, 60, 0.6, 0.55, 1);
  light.position.set(0, 0.85, -2);
  light.target.position.set(0, -0.2, -20);
  car.add(light, light.target);
  return {
    animated: [car],
    update(life) {
      const p = life.car;
      car.position.set(p.x, p.y, p.z);
      car.rotation.set(p.pitch, p.heading, p.roll);
      wheels.forEach(({ pivot, wheel, front }) => {
        pivot.rotation.y = front ? -p.steer : 0;
        wheel.rotation.x = p.travel / 0.36;
      });
    },
    setLighting(on, braking) {
      light.intensity = on ? 160 : 0;
      head.emissiveIntensity = on ? 2.5 : 0.1;
      tail.emissiveIntensity = braking ? 4 : on ? 0.4 : 0.05;
    },
  };
}
