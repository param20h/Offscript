"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import CanvasFallback from "./CanvasFallback";

export default function SignatureCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setHasWebGL(false);
      return;
    }

    // Verify WebGL capability
    try {
      const testCanvas = document.createElement("canvas");
      const gl =
        testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!gl) {
        setHasWebGL(false);
        return;
      }
      setHasWebGL(true);
    } catch {
      setHasWebGL(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // --- 1. Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x171717, 0.08);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.4, 4.6);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x171717, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);

    // Master Group for pointer parallax
    const sculptureGroup = new THREE.Group();
    scene.add(sculptureGroup);

    // --- 2. Lighting System ---
    // Ambient fill
    const ambientLight = new THREE.AmbientLight(0x222222, 1.2);
    scene.add(ambientLight);

    // Directional Warm Ivory Key Light
    const keyLight = new THREE.DirectionalLight(0xf0ede5, 2.8);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    // Acid Lime Edge Accent Light (creates metallic green highlights)
    const acidAccentLight = new THREE.PointLight(0xd6ff35, 3.5, 8, 1.2);
    acidAccentLight.position.set(-2, 1.5, 2.5);
    scene.add(acidAccentLight);

    // Secondary subtle rim light
    const rimLight = new THREE.DirectionalLight(0x888888, 1.4);
    rimLight.position.set(-3, -3, -2);
    scene.add(rimLight);

    // --- 3. Sculptural Elements ---
    // Materials
    const darkMetalMaterial = new THREE.MeshStandardMaterial({
      color: 0x1c1c1c,
      metalness: 0.88,
      roughness: 0.22,
      flatShading: true,
    });

    const ivoryAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a28,
      metalness: 0.7,
      roughness: 0.35,
      flatShading: true,
    });

    const acidWireframeMaterial = new THREE.LineBasicMaterial({
      color: 0xd6ff35,
      transparent: true,
      opacity: 0.85,
    });

    const ivoryWireframeMaterial = new THREE.LineBasicMaterial({
      color: 0xf0ede5,
      transparent: true,
      opacity: 0.4,
    });

    const disposables: (THREE.BufferGeometry | THREE.Material)[] = [
      darkMetalMaterial,
      ivoryAccentMaterial,
      acidWireframeMaterial,
      ivoryWireframeMaterial,
    ];

    // Element A: Central Monolithic Slab (Asymmetrical Obelisk)
    const slabGeo = new THREE.BoxGeometry(0.75, 2.2, 0.4);
    disposables.push(slabGeo);
    const slabMesh = new THREE.Mesh(slabGeo, darkMetalMaterial);
    slabMesh.rotation.set(0.2, 0.4, -0.25);
    sculptureGroup.add(slabMesh);

    // Hairline edges for Slab A
    const slabEdgesGeo = new THREE.EdgesGeometry(slabGeo);
    disposables.push(slabEdgesGeo);
    const slabEdges = new THREE.LineSegments(slabEdgesGeo, acidWireframeMaterial);
    slabMesh.add(slabEdges);

    // Element B: Intersecting Horizontal Cantilever Plate
    const plateGeo = new THREE.BoxGeometry(2.0, 0.28, 0.95);
    disposables.push(plateGeo);
    const plateMesh = new THREE.Mesh(plateGeo, ivoryAccentMaterial);
    plateMesh.position.set(0.2, -0.3, 0.15);
    plateMesh.rotation.set(-0.35, 0.6, 0.15);
    sculptureGroup.add(plateMesh);

    const plateEdgesGeo = new THREE.EdgesGeometry(plateGeo);
    disposables.push(plateEdgesGeo);
    const plateEdges = new THREE.LineSegments(plateEdgesGeo, ivoryWireframeMaterial);
    plateMesh.add(plateEdges);

    // Element C: Crystalline Wireframe Cage (Octahedral Lattice)
    const cageGeo = new THREE.OctahedronGeometry(1.4, 0);
    disposables.push(cageGeo);
    const cageEdgesGeo = new THREE.WireframeGeometry(cageGeo);
    disposables.push(cageEdgesGeo);
    const cageMesh = new THREE.LineSegments(cageEdgesGeo, acidWireframeMaterial);
    cageMesh.rotation.set(0.4, -0.3, 0.2);
    sculptureGroup.add(cageMesh);

    // Element D: Orbital Ring / Precision Coordinate Hoop
    const ringGeo = new THREE.TorusGeometry(1.65, 0.008, 6, 64);
    disposables.push(ringGeo);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf0ede5,
      transparent: true,
      opacity: 0.45,
    });
    disposables.push(ringMat);
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.3;
    ringMesh.rotation.y = 0.3;
    sculptureGroup.add(ringMesh);

    // Element E: Second Tilted Ring (Acid Lime Accent)
    const ringGeo2 = new THREE.TorusGeometry(1.2, 0.006, 6, 48);
    disposables.push(ringGeo2);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xd6ff35,
      transparent: true,
      opacity: 0.6,
    });
    disposables.push(ringMat2);
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.x = -Math.PI / 3;
    ringMesh2.rotation.z = 0.5;
    sculptureGroup.add(ringMesh2);

    // Element F: Precision Vertex Anchor Points
    const nodeGeo = new THREE.BufferGeometry();
    const nodePositions = new Float32Array([
      0, 1.4, 0,
      0, -1.4, 0,
      1.4, 0, 0,
      -1.4, 0, 0,
      0, 0, 1.4,
      0, 0, -1.4,
    ]);
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));
    disposables.push(nodeGeo);
    const nodeMat = new THREE.PointsMaterial({
      color: 0xd6ff35,
      size: 0.05,
      transparent: true,
      opacity: 0.9,
    });
    disposables.push(nodeMat);
    const nodes = new THREE.Points(nodeGeo, nodeMat);
    cageMesh.add(nodes);

    // Element G: Subtle Ambient Coordinate Dust
    const dustCount = 45;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 5.5;
      dustPositions[i + 1] = (Math.random() - 0.5) * 4.5;
      dustPositions[i + 2] = (Math.random() - 0.5) * 4;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    disposables.push(dustGeo);
    const dustMat = new THREE.PointsMaterial({
      color: 0xf0ede5,
      size: 0.02,
      transparent: true,
      opacity: 0.35,
    });
    disposables.push(dustMat);
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // --- 4. Interactive Physics & Motion System ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      mouseX = (x / rect.width) * 2 - 1;
      mouseY = -(y / rect.height) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth pointer lerp
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      // Compound organic & architectural rotation
      slabMesh.rotation.y = 0.4 + elapsedTime * 0.08;
      plateMesh.rotation.y = 0.6 - elapsedTime * 0.06;
      cageMesh.rotation.y = -0.3 + elapsedTime * 0.05;
      cageMesh.rotation.x = 0.4 + Math.sin(elapsedTime * 0.3) * 0.05;

      ringMesh.rotation.z = elapsedTime * 0.04;
      ringMesh2.rotation.z = -elapsedTime * 0.07;

      // Parallax response to cursor
      sculptureGroup.rotation.y = targetX * 0.45;
      sculptureGroup.rotation.x = -targetY * 0.35;
      sculptureGroup.position.x = targetX * 0.15;
      sculptureGroup.position.y = targetY * 0.12;

      // Subtle light oscillation
      acidAccentLight.position.x = -2 + Math.sin(elapsedTime * 0.5) * 0.4;
      acidAccentLight.position.y = 1.5 + Math.cos(elapsedTime * 0.4) * 0.3;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);

      renderer.dispose();
      disposables.forEach((item) => item.dispose());

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (hasWebGL === false) {
    return <CanvasFallback />;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[420px] sm:min-h-[480px] lg:min-h-[560px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
      aria-label="OFFSCRIPT Digital Architectural Sculpture"
    >
      {/* Precision Corner Crosshair Accents */}
      <div className="absolute top-2 left-2 font-mono text-[9px] text-ivory-dim/70 tracking-widest flex items-center gap-1.5 pointer-events-none">
        <span className="w-1.5 h-1.5 bg-acid rounded-none inline-block animate-pulse" />
        <span>SCULPTURE // ISO_ARCH_01</span>
      </div>
      <div className="absolute top-2 right-2 font-mono text-[9px] text-ivory-dim/70 tracking-widest pointer-events-none">
        3D_AXIS: REACTIVE
      </div>
      <div className="absolute bottom-2 left-2 font-mono text-[9px] text-ivory-dim/70 tracking-widest pointer-events-none">
        RENDER: PBR_METALLIC
      </div>
      <div className="absolute bottom-2 right-2 font-mono text-[9px] text-acid/80 tracking-widest pointer-events-none flex items-center gap-1">
        <span className="w-1 h-1 bg-acid inline-block" />
        ROTATION: DAMPED_LERP
      </div>

      {/* Fallback mount while detecting WebGL */}
      {hasWebGL === null && <CanvasFallback />}
    </div>
  );
}
