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

    // --- 1. Scene & Camera Setup ---
    const scene = new THREE.Scene();

    const width = container.clientWidth;
    const height = container.clientHeight;
    const aspect = width / height;

    const camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);
    camera.position.set(0, 0.2, 5.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Procedural Reflection Environment (Simulates an architectural studio environment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    const envBoxGeom = new THREE.BoxGeometry(10, 10, 10);
    const envBoxMat = new THREE.MeshBasicMaterial({
      color: 0x333538,
      side: THREE.BackSide,
    });
    const envMesh = new THREE.Mesh(envBoxGeom, envBoxMat);
    envScene.add(envMesh);

    // Light cards in the reflection environment to produce specular glints
    const lightCard1 = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 4),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    lightCard1.position.set(4, 4, 3);
    lightCard1.lookAt(0, 0, 0);
    envScene.add(lightCard1);

    const lightCard2 = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 5),
      new THREE.MeshBasicMaterial({ color: 0xf0ede5, side: THREE.DoubleSide })
    );
    lightCard2.position.set(-4, -2, 2);
    lightCard2.lookAt(0, 0, 0);
    envScene.add(lightCard2);

    const envMap = pmremGenerator.fromScene(envScene, 0.04).texture;
    scene.environment = envMap;
    pmremGenerator.dispose();

    // --- 2. Master Sculptural Group ---
    const sculptureGroup = new THREE.Group();
    scene.add(sculptureGroup);

    // --- 3. Lighting System ---
    // Soft ambient fill
    const ambientLight = new THREE.AmbientLight(0x242426, 1.2);
    scene.add(ambientLight);

    // Key Light: Pure White Directional Light with Soft Shadows
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(4.5, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Warm Ivory Fill Light
    const fillLight = new THREE.DirectionalLight(0xf0ede5, 1.4);
    fillLight.position.set(-4, -1, 3);
    scene.add(fillLight);

    // Acid Lime Rim Accent Light
    const limeRimLight = new THREE.DirectionalLight(0xd6ff35, 2.0);
    limeRimLight.position.set(-2, 4, -4);
    scene.add(limeRimLight);

    // --- 4. Material Palette ---
    // A: Brushed Silver Metallic (High specularity, anisotropic feel)
    const brushedSilverMat = new THREE.MeshStandardMaterial({
      color: 0xd8dde4,
      metalness: 0.94,
      roughness: 0.16,
      envMapIntensity: 1.4,
    });

    // B: Warm Ivory Matte Ceramic (Tactile, smooth architectural stone)
    const warmIvoryMat = new THREE.MeshStandardMaterial({
      color: 0xf0ede5,
      metalness: 0.04,
      roughness: 0.38,
      envMapIntensity: 0.6,
    });

    // C: Precision Acid Lime Architectural Inset Fin
    const acidLimeMat = new THREE.MeshStandardMaterial({
      color: 0xd6ff35,
      emissive: 0x2a3800,
      metalness: 0.45,
      roughness: 0.22,
    });

    // D: Dark Graphite Structural Core (provides grounding contrast)
    const graphiteMat = new THREE.MeshStandardMaterial({
      color: 0x1c1c1e,
      metalness: 0.7,
      roughness: 0.3,
    });

    // --- 5. Intersecting Architectural Geometry ---

    // 1. Vertical Brushed Silver Monolith (Primary Pillar)
    const monolithGeom = new THREE.BoxGeometry(0.85, 2.6, 0.55);
    const monolith = new THREE.Mesh(monolithGeom, brushedSilverMat);
    monolith.position.set(-0.25, 0.1, 0);
    monolith.rotation.set(0.08, -0.2, 0.05);
    monolith.castShadow = true;
    monolith.receiveShadow = true;
    sculptureGroup.add(monolith);

    // 2. Horizontal Warm Ivory Cantilever Slab (Intersects through the silver pillar)
    const cantileverGeom = new THREE.BoxGeometry(2.3, 0.55, 0.95);
    const cantilever = new THREE.Mesh(cantileverGeom, warmIvoryMat);
    cantilever.position.set(0.35, -0.2, 0.15);
    cantilever.rotation.set(-0.06, 0.24, -0.04);
    cantilever.castShadow = true;
    cantilever.receiveShadow = true;
    sculptureGroup.add(cantilever);

    // 3. Precision Acid Lime Inset Datum Blade
    const datumGeom = new THREE.BoxGeometry(2.45, 0.04, 1.05);
    const datumBlade = new THREE.Mesh(datumGeom, acidLimeMat);
    datumBlade.position.set(0.35, 0.09, 0.15);
    datumBlade.rotation.set(-0.06, 0.24, -0.04);
    datumBlade.castShadow = true;
    sculptureGroup.add(datumBlade);

    // 4. Secondary Warm Ivory Vertical Stele
    const steleGeom = new THREE.BoxGeometry(0.35, 1.4, 0.4);
    const stele = new THREE.Mesh(steleGeom, warmIvoryMat);
    stele.position.set(1.05, 0.4, -0.3);
    stele.rotation.set(0.12, -0.15, 0.02);
    stele.castShadow = true;
    stele.receiveShadow = true;
    sculptureGroup.add(stele);

    // 5. Polished Silver Floating Spatial Frame
    const ringShape = new THREE.Shape();
    const rw = 1.7;
    const rh = 1.3;
    ringShape.moveTo(-rw / 2, -rh / 2);
    ringShape.lineTo(rw / 2, -rh / 2);
    ringShape.lineTo(rw / 2, rh / 2);
    ringShape.lineTo(-rw / 2, rh / 2);
    ringShape.closePath();

    const ringHole = new THREE.Path();
    const th = 0.035;
    ringHole.moveTo(-rw / 2 + th, -rh / 2 + th);
    ringHole.lineTo(rw / 2 - th, -rh / 2 + th);
    ringHole.lineTo(rw / 2 - th, rh / 2 - th);
    ringHole.lineTo(-rw / 2 + th, rh / 2 - th);
    ringHole.closePath();
    ringShape.holes.push(ringHole);

    const frameGeom = new THREE.ExtrudeGeometry(ringShape, {
      depth: 0.04,
      bevelEnabled: false,
    });
    const frame = new THREE.Mesh(frameGeom, brushedSilverMat);
    frame.position.set(-0.1, 0.2, 0.1);
    frame.rotation.set(0.4, 0.35, -0.2);
    sculptureGroup.add(frame);

    // 6. Subtle Graphite Architectural Base Plinth
    const plinthGeom = new THREE.BoxGeometry(1.6, 0.12, 1.2);
    const plinth = new THREE.Mesh(plinthGeom, graphiteMat);
    plinth.position.set(0, -1.4, 0);
    plinth.receiveShadow = true;
    sculptureGroup.add(plinth);

    // Set initial calibrated orientation
    sculptureGroup.rotation.y = -0.35;
    sculptureGroup.rotation.x = 0.18;

    // --- 6. Smooth Pointer & Scroll Interaction ---
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0.18;
    let targetRotationY = -0.35;
    let scrollYOffset = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      targetRotationY = -0.35 + normX * 0.45;
      targetRotationX = 0.18 - normY * 0.35;
    };

    const handleScroll = () => {
      scrollYOffset = window.scrollY * 0.0004;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    // --- 7. Animation Loop ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Gentle continuous idle oscillation
      const idleY = Math.sin(elapsedTime * 0.6) * 0.06;
      const idleX = Math.cos(elapsedTime * 0.5) * 0.04;

      // Smooth damped lerping
      sculptureGroup.rotation.y +=
        (targetRotationY + idleY - sculptureGroup.rotation.y) * 0.045;
      sculptureGroup.rotation.x +=
        (targetRotationX + idleX + scrollYOffset - sculptureGroup.rotation.x) * 0.045;

      // Subtle counter-rotation on spatial frame
      frame.rotation.z = -0.2 + Math.sin(elapsedTime * 0.8) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // --- 8. Responsive Resize Handler ---
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;
      // Adjust camera distance for mobile viewports
      camera.position.z = newWidth < 640 ? 6.2 : 5.2;
      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Initial check
    handleResize();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose Three.js resources
      renderer.dispose();
      monolithGeom.dispose();
      cantileverGeom.dispose();
      datumGeom.dispose();
      steleGeom.dispose();
      frameGeom.dispose();
      plinthGeom.dispose();
      brushedSilverMat.dispose();
      warmIvoryMat.dispose();
      acidLimeMat.dispose();
      graphiteMat.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[540px] flex items-center justify-center select-none"
      aria-label="OFFSCRIPT Architectural Sculpture"
    >
      {/* Clean Fallback mount while detecting WebGL */}
      {hasWebGL === null && <CanvasFallback />}
    </div>
  );
}
