import { ArrowRight, DatabaseZap, Globe2 } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";

const storageKey = "mafy-console-started";

interface LandingGateProps {
  children: ReactNode;
}

function latLonToVector3(lat: number, lon: number, radius: number) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function createMadagascarLine(radius: number, color = 0x39ff14, opacity = 0.95) {
  const outline = [
    [-12.1, 49.1],
    [-14.3, 50.1],
    [-17.2, 49.7],
    [-20.1, 48.3],
    [-23.0, 46.2],
    [-25.4, 44.4],
    [-23.6, 43.5],
    [-20.4, 43.8],
    [-17.2, 44.5],
    [-14.6, 46.2],
    [-12.1, 49.1],
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(
    outline.map(([lat, lon]) => latLonToVector3(lat, lon, radius)),
  );

  return new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
    }),
  );
}

function createMadagascarFocus(radius: number) {
  const group = new THREE.Group();
  const center = latLonToVector3(-19.2, 46.9, radius + 0.08);
  const beaconStart = latLonToVector3(-19.2, 46.9, radius + 0.03);
  const beaconEnd = latLonToVector3(-19.2, 46.9, radius + 0.48);
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 18, 18),
    new THREE.MeshBasicMaterial({ color: 0x39ff14 }),
  );
  const beacon = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([beaconStart, beaconEnd]),
    new THREE.LineBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.86,
    }),
  );

  marker.position.copy(center);
  group.add(
    createMadagascarLine(radius, 0x39ff14, 1),
    createMadagascarLine(radius + 0.018, 0x22d3ee, 0.52),
    createMadagascarLine(radius + 0.036, 0x39ff14, 0.42),
    marker,
    beacon,
  );

  return group;
}

function createSignalPoints(radius: number) {
  const points: THREE.Vector3[] = [];
  const locations = [
    [-18.8, 47.5],
    [-21.4, 47.1],
    [-15.7, 46.3],
    [-23.3, 43.7],
    [-13.3, 49.3],
  ];

  locations.forEach(([lat, lon]) => {
    points.push(latLonToVector3(lat, lon, radius));
  });

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.PointsMaterial({
    color: 0x22d3ee,
    size: 0.065,
    transparent: true,
    opacity: 0.95,
  });

  return new THREE.Points(geometry, material);
}

function GlobeScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) return;

    const container = mount;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const globe = new THREE.Group();
    const sphereGeometry = new THREE.SphereGeometry(1.72, 64, 64);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x176b3a,
      wireframe: true,
      transparent: true,
      opacity: 0.86,
    });
    const shellGeometry = new THREE.SphereGeometry(1.74, 64, 64);
    const shellMaterial = new THREE.MeshBasicMaterial({
      color: 0x39ff14,
      transparent: true,
      opacity: 0.13,
    });
    const globeMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    const shellMesh = new THREE.Mesh(shellGeometry, shellMaterial);
    const madagascarFocus = createMadagascarFocus(1.81);
    const signalPoints = createSignalPoints(1.88);
    const baseRotationY = THREE.MathUtils.degToRad(-137);
    const baseRotationX = THREE.MathUtils.degToRad(-8);
    let frame = 0;

    camera.position.z = 4.05;
    globe.rotation.y = baseRotationY;
    globe.rotation.x = baseRotationX;
    globe.add(shellMesh, globeMesh, madagascarFocus, signalPoints);
    scene.add(globe);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    function resize() {
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }

    function animate(timestamp = 0) {
      frame = window.requestAnimationFrame(animate);
      globe.rotation.y = baseRotationY + Math.sin(timestamp * 0.00045) * 0.075;
      globe.rotation.x = baseRotationX + Math.sin(timestamp * 0.00034) * 0.026;
      (signalPoints.material as THREE.PointsMaterial).opacity =
        0.76 + Math.sin(timestamp * 0.003) * 0.18;
      renderer.render(scene, camera);
    }

    resize();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      container.removeChild(renderer.domElement);
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      shellGeometry.dispose();
      shellMaterial.dispose();
      madagascarFocus.traverse((object) => {
        const target = object as THREE.Mesh | THREE.Line;

        target.geometry?.dispose();
        if (Array.isArray(target.material)) {
          target.material.forEach((material) => material.dispose());
        } else {
          target.material?.dispose();
        }
      });
      signalPoints.geometry.dispose();
      (signalPoints.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}

export default function LandingGate({ children }: LandingGateProps) {
  const [hasStarted, setHasStarted] = useState(() => {
    return window.localStorage.getItem(storageKey) === "true";
  });

  if (hasStarted) {
    return children;
  }

  function startConsole() {
    window.localStorage.setItem(storageKey, "true");
    setHasStarted(true);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink text-ash">
      <GlobeScene />
      <div className="absolute inset-0 bg-ink/10" />
      <div className="absolute bottom-8 right-6 z-10 hidden rounded-md border border-neon/35 bg-ink/75 px-3 py-2 text-xs font-semibold uppercase text-neon backdrop-blur md:block">
        Madagascar focus
      </div>
      <div className="relative z-10 flex min-h-screen items-center px-6 sm:px-10 lg:px-16">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-grid bg-ink/70 px-3 py-2 text-xs font-semibold uppercase text-neon backdrop-blur">
            <Globe2 className="size-4" aria-hidden="true" />
            MAFY health operations
          </div>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
            MAFY Health Operations Console
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-ash sm:text-lg">
            A field-ready view of the anonymized MAFY workbook: where outreach
            happened, where referrals need review, which records weaken
            confidence, and which areas may need attention next.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={startConsole}
              className="inline-flex h-12 items-center gap-2 rounded-md border border-neon bg-neon px-5 text-sm font-semibold text-ink shadow-neon transition hover:bg-neon/85"
            >
              Open MAFY console
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
            <div className="inline-flex h-12 items-center gap-2 rounded-md border border-grid bg-ink/70 px-4 text-xs font-semibold uppercase text-muted backdrop-blur">
              <DatabaseZap className="size-4 text-neon" aria-hidden="true" />
              For field and M&E teams
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
