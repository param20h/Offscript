"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import CanvasFallback from "./CanvasFallback";

export default function SignatureCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setHasWebGL(false);
      return;
    }

    // Check WebGL support
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

    // Setup Three.js scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x171717, 0.05);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x171717, 0);

    container.appendChild(renderer.domElement);

    // Group for mouse interaction
    const group = new THREE.Group();
    scene.add(group);

    // 1. Central Geometric Structure: Precision Wireframe Icosahedron
    const icoGeometry = new THREE.IcosahedronGeometry(1.4, 1);
    const wireframeGeometry = new THREE.WireframeGeometry(icoGeometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xd6ff35, // Acid Lime
      transparent: true,
      opacity: 0.85,
    });
    const wireframe = new THREE.LineSegments(wireframeGeometry, lineMaterial);
    group.add(wireframe);

    // 2. Inner architectural cage
    const innerGeometry = new THREE.OctahedronGeometry(0.85, 0);
    const innerWireframe = new THREE.WireframeGeometry(innerGeometry);
    const innerMaterial = new THREE.LineBasicMaterial({
      color: 0xf0ede5, // Warm Ivory
      transparent: true,
      opacity: 0.35,
    });
    const innerMesh = new THREE.LineSegments(innerWireframe, innerMaterial);
    group.add(innerMesh);

    // 3. Coordinate Vertex Points
    const pointMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.04,
      transparent: true,
      opacity: 0.9,
    });
    const points = new THREE.Points(icoGeometry, pointMaterial);
    group.add(points);

    // 4. Subtle ambient coordinate field particles
    const particleCount = 60;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 6;
      particlePositions[i + 1] = (Math.random() - 0.5) * 6;
      particlePositions[i + 2] = (Math.random() - 0.5) * 4;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    const particleFieldMaterial = new THREE.PointsMaterial({
      color: 0xd6ff35,
      size: 0.02,
      transparent: true,
      opacity: 0.4,
    });
    const particleField = new THREE.Points(particleGeometry, particleFieldMaterial);
    scene.add(particleField);

    // Mouse tracking for subtle parallax
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

    window.addEventListener("mousemove", handleMouseMove);

    // Resize handler
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
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Continuous subtle rotation
      wireframe.rotation.x = elapsedTime * 0.15;
      wireframe.rotation.y = elapsedTime * 0.2;

      innerMesh.rotation.x = -elapsedTime * 0.1;
      innerMesh.rotation.y = -elapsedTime * 0.15;

      // Mouse damping
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      group.rotation.y = targetX * 0.6;
      group.rotation.x = -targetY * 0.6;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);

      renderer.dispose();
      icoGeometry.dispose();
      wireframeGeometry.dispose();
      innerGeometry.dispose();
      innerWireframe.dispose();
      particleGeometry.dispose();
      lineMaterial.dispose();
      innerMaterial.dispose();
      pointMaterial.dispose();
      particleFieldMaterial.dispose();

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
      className="relative w-full h-full min-h-[380px] lg:min-h-[460px] bg-obsidian-surface border border-obsidian-border overflow-hidden cursor-crosshair group"
      aria-label="OFFSCRIPT Interactive Architectural Geometry Visualizer"
    >
      {/* Background Architectural Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* Telemetry Overlays */}
      <div className="absolute top-4 left-4 z-10 font-mono text-[9px] text-ivory-dim tracking-widest flex items-center gap-2 pointer-events-none">
        <span className="w-1.5 h-1.5 bg-acid rounded-none animate-pulse" />
        <span>SYS.3D_WIRE // ACTIVE</span>
      </div>

      <div className="absolute top-4 right-4 z-10 font-mono text-[9px] text-ivory-dim tracking-widest pointer-events-none">
        COORD // 0x4F.46.46
      </div>

      <div className="absolute bottom-4 left-4 z-10 font-mono text-[9px] text-ivory-dim tracking-widest pointer-events-none">
        INTERACTION: POINTER_DELTA
      </div>

      <div className="absolute bottom-4 right-4 z-10 font-mono text-[9px] text-acid tracking-widest pointer-events-none flex items-center gap-1.5">
        <span className="w-1 h-1 bg-acid inline-block" />
        ENGINEERED FOR IMPACT
      </div>

      {/* Fallback container until WebGL renders */}
      {hasWebGL === null && <CanvasFallback />}
    </div>
  );
}
