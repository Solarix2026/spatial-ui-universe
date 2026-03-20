"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Sparkles, Stars, Sphere, MeshDistortMaterial, Clouds, Cloud } from "@react-three/drei";
import * as THREE from "three";

// Supernova Easter Egg Component
function SupernovaEasterEgg({ active, color, onComplete }: { active: boolean, color: string, onComplete: () => void }) {
  const count = 75; // Even less particles, but thicker bridging
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Distribute particles perfectly on the sphere shell initially
  const initialPositions = useMemo(() => {
    const pts = [];
    for(let i=0; i<count; i++) {
        const p = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
        ).normalize().multiplyScalar(1.5); // Start exactly on the Coreradius
        pts.push(p);
    }
    return pts;
  }, []);
  
  const velocities = useMemo(() => initialPositions.map(p => p.clone().normalize().multiplyScalar(Math.random() * 20 + 20)), [initialPositions]);
  
  const currentPositions = useRef(initialPositions.map(p => p.clone()));
  const time = useRef(0);
  const Y_AXIS = useMemo(() => new THREE.Vector3(0,1,0), []);
  const tempVel = useMemo(() => new THREE.Vector3(), []);

  const maxBonds = 300;
  const bondsMeshRef = useRef<THREE.InstancedMesh>(null);
  const centralBlobRef = useRef<THREE.Mesh>(null);
  const dummyBond = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!active) return;
    time.current += delta;
    const t = time.current;

    let phase = 0; 
    if (t < 2.0) phase = 1; // Violent Explosion
    else if (t < 4.0) phase = 2; // Drift and expand lines
    else if (t < 6.5) phase = 3; // Contract back to dense cage and melt into blob
    else if (t < 8.0) phase = 4; // Blob wobbles and fades out, letting core emerge
    else {
        onComplete();
        time.current = 0;
        currentPositions.current = initialPositions.map(p => p.clone());
        for(let i=0; i<count;i++) {
            velocities[i] = initialPositions[i].clone().normalize().multiplyScalar(Math.random() * 20 + 20);
        }
        if (bondsMeshRef.current) bondsMeshRef.current.count = 0;
        if (centralBlobRef.current) centralBlobRef.current.scale.set(0,0,0);
        return;
    }

    if (centralBlobRef.current) {
        if (phase === 3) {
            // Blob grows as drops condense
            const p = (t - 4.0) / 2.5;
            const ease = 1 - Math.pow(1 - p, 4); // ease out
            const s = ease * 1.5; 
            centralBlobRef.current.scale.set(s, s, s);
        } else if (phase === 4) {
            // Blob shrinks away
            const p = (t - 6.5) / 1.5;
            const s = 1.5 * Math.max(0, 1.0 - Math.pow(p, 2));
            centralBlobRef.current.scale.set(s, s, s);
        } else {
            centralBlobRef.current.scale.set(0, 0, 0);
        }
    }

    let bondCount = 0;

    let bondThreshold = 0;
    if (phase === 2) {
        bondThreshold = ((t - 2.0) / 2.0) * 1.5; 
    } else if (phase === 3) {
        // Quickly dissolve the bonds as the main blob takes over
        const progress = Math.min((t - 4.0) / 1.0, 1.0);
        bondThreshold = 1.5 * (1.0 - progress); 
    } else if (phase === 4) {
        bondThreshold = 0; 
    }

    for (let i = 0; i < count; i++) {
        let p = currentPositions.current[i];
        
        if (phase === 1) {
            tempVel.copy(velocities[i]).multiplyScalar(delta);
            p.add(tempVel);
            velocities[i].multiplyScalar(0.92); 
            p.applyAxisAngle(Y_AXIS, delta * 2.0); 
        } else if (phase === 2) {
            tempVel.copy(velocities[i]).multiplyScalar(delta);
            p.add(tempVel);
            velocities[i].multiplyScalar(0.95); 
            p.applyAxisAngle(Y_AXIS, delta * 0.5); 
        } else {
            // Sucked tightly into the center
            const target = initialPositions[i].clone().normalize().multiplyScalar(0.1);
            p.lerp(target, 1.0 - Math.pow(0.0001, delta)); 
            p.applyAxisAngle(Y_AXIS, delta * 2.0); 
        }
        
        // Connect points
        if (bondThreshold > 0 && phase <= 3) {
            const thresholdSq = bondThreshold * bondThreshold;
            for (let j = i + 1; j < count; j++) {
                const p2 = currentPositions.current[j];
                const distSq = p.distanceToSquared(p2);
                if (distSq < thresholdSq && distSq < 2.25) { 
                    if (bondCount < maxBonds) {
                        const dist = Math.sqrt(distSq);
                        const thickness = Math.max(0.08, 0.45 - (dist * 0.25));
                        
                        dummyBond.position.copy(p).lerp(p2, 0.5); 
                        dummyBond.lookAt(p2); 
                        dummyBond.scale.set(thickness, thickness, dist * 0.54); 
                        dummyBond.updateMatrix();
                        
                        if (bondsMeshRef.current) bondsMeshRef.current.setMatrixAt(bondCount, dummyBond.matrix);
                        bondCount++;
                    }
                }
            }
        }
        
        // Scale handles visual pop nicely
        let scale = 0.35; 
        if (phase === 1) {
            scale = Math.max(0.15, 0.6 - p.length()*0.02);
        } else if (phase === 2) {
            scale = 0.35;
        } else if (phase === 3) {
            // Shrink completely as the central blob manifests
            const progress = (t - 4.0) / 2.5;
            scale = 0.35 * Math.max(0, 1.0 - Math.pow(progress, 2));
        } else if (phase === 4) {
            scale = 0;
        }
        
        dummy.position.copy(p);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        if (meshRef.current) meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    if (meshRef.current) meshRef.current.instanceMatrix.needsUpdate = true;
    
    if (bondsMeshRef.current) {
        bondsMeshRef.current.count = bondCount;
        bondsMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  if (!active) return null;

  // Let bond lines fade during phase 4 smoothly
  const lineOpacity = time.current > 6.5 ? Math.max(0, 0.4 - ((time.current - 6.5)/1.5)*0.4) : 0.4;
  const pointOpacity = time.current > 6.5 ? Math.max(0, 0.9 - ((time.current - 6.5)/1.5)*0.9) : 0.9;

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
            color="#0ea5e9"
            emissive="#0369a1" 
            emissiveIntensity={0.2} 
            transparent 
            opacity={pointOpacity} 
            roughness={0.0} 
            metalness={0.5} 
            envMapIntensity={2.0}
        />
      </instancedMesh>
      <instancedMesh ref={bondsMeshRef} args={[undefined, undefined, maxBonds]} frustumCulled={false}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
            color="#38bdf8" 
            transparent 
            opacity={lineOpacity * 2.0} 
            roughness={0.0} 
            metalness={0.5} 
            envMapIntensity={3.0} 
            depthWrite={false}
            blending={THREE.NormalBlending}
        />
      </instancedMesh>
      <Sphere ref={centralBlobRef} args={[1.0, 64, 64]} scale={0}>
        <MeshDistortMaterial 
            color="#0ea5e9"
            emissive="#0369a1" 
            emissiveIntensity={0.2} 
            transparent 
            opacity={0.9} 
            roughness={0.0} 
            metalness={0.8} 
            envMapIntensity={3.0}
            distort={0.4}
            speed={4}
        />
      </Sphere>
    </group>
  );
}

// The central "Black Hole" or pulsing star
export function BlackHoleCore({ color = "#312e81" }: { color?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const visualsGroupRef = useRef<THREE.Group>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const [clicked, setClicked] = useState(false);
  const shockProgress = useRef(0);
  const [easterEggActive, setEasterEggActive] = useState(false);
  
  // Track egg time internally for the BlackHole to know when to grow back
  const eggTime = useRef(0);

  const triggerShockwave = () => {
    if (easterEggActive) return;
    setClicked(true);
    shockProgress.current = 0;
    setTimeout(() => setClicked(false), 800);
  };

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.rotation.x += delta * 0.02;
    }

    if (visualsGroupRef.current) {
      if (easterEggActive) {
        eggTime.current += delta;
        // The egg takes 8.0s. It fades back in during Phase 4 (6.5s to 8.0s)
        if (eggTime.current > 6.5) {
            const progress = Math.min((eggTime.current - 6.5) / 1.5, 1.0);
            const ease = 1 - Math.pow(1 - progress, 3); // cubic ease out
            visualsGroupRef.current.scale.set(ease, ease, ease);
        } else {
            visualsGroupRef.current.scale.lerp(new THREE.Vector3(0, 0, 0), delta * 25); // Shrink intensely at start
        }
      } else {
        eggTime.current = 0;
        visualsGroupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 5);
      }
    }

    if (clicked && shockProgress.current < 1) shockProgress.current += delta * 2;
    else if (!clicked && shockProgress.current > 0) shockProgress.current -= delta * 1;
    if (shockProgress.current < 0) shockProgress.current = 0;

    if (shockwaveRef.current) {
      const s = 1 + shockProgress.current * 15;
      shockwaveRef.current.scale.set(s, s, s);
      (shockwaveRef.current.material as THREE.Material).opacity = Math.max(0, 0.6 - shockProgress.current * 0.6);
    }
  });

  return (
    <group 
      ref={groupRef} 
      onClick={triggerShockwave} 
      onDoubleClick={() => setEasterEggActive(true)}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "crosshair"; }} 
      onPointerOut={() => { document.body.style.cursor = "default"; }}
    >
      <SupernovaEasterEgg active={easterEggActive} color={color} onComplete={() => setEasterEggActive(false)} />
      
      <group ref={visualsGroupRef}>
        <Sphere args={[1.5, 64, 64]}>
          <MeshDistortMaterial color={color} emissive={color} emissiveIntensity={0.5} distort={0.4} speed={3} roughness={0.1} metalness={0.8} envMapIntensity={2.0} />
        </Sphere>
        
        <mesh ref={shockwaveRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.6, 2.0, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0} side={THREE.DoubleSide} />
        </mesh>

        <mesh rotation={[Math.PI / 2.2, 0.1, 0]}>
          <torusGeometry args={[3.2, 0.015, 16, 100]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
        <mesh rotation={[Math.PI / 2.2, -0.1, 0]}>
          <torusGeometry args={[4.5, 0.03, 16, 100]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} />
        </mesh>
      </group>
    </group>
  );
}

// Asteroid field that physically runs away from the user's mouse cursor
export function AsteroidField({ count = 150, color = "#6366f1", shape = "dodecahedron" }: { count?: number, color?: string, shape?: "dodecahedron" | "icosahedron" | "box" }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.InstancedMesh>(null); // Dedicated mesh for warp speed light beams
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const [isPressing, setIsPressing] = useState(false);
  const warpSpeedRef = useRef(0);
  
  // Listen for global pointer down to trigger Warp Speed
  useEffect(() => {
    const handleDown = () => setIsPressing(true);
    const handleUp = () => setIsPressing(false);
    window.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
    };
  }, []);
  
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      pos: new THREE.Vector3((Math.random() - 0.5) * 25, (Math.random() - 0.5) * 25, (Math.random() - 0.5) * 40), // wider Z
      vel: new THREE.Vector3((Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.04),
      baseZSpeed: Math.random() * 0.05 + 0.01,
      scale: Math.random() * 0.3 + 0.05,
      rotSpeed: new THREE.Vector3(Math.random() * 0.1, Math.random() * 0.1, Math.random() * 0.1),
      rotation: new THREE.Vector3()
    }));
  }, [count, shape]);

  // Dedicated light beams that only appear during Warp Speed
  const warpLinesCount = 300;
  const warpLines = useMemo(() => {
    return Array.from({ length: warpLinesCount }, () => ({
      pos: new THREE.Vector3((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 100),
      speed: Math.random() * 0.8 + 0.5,
      length: Math.random() * 5 + 3,
    }));
  }, [warpLinesCount]);

  useFrame((state, delta) => {
    // Warp speed smooth logic
    const targetWarp = isPressing ? 1 : 0;
    warpSpeedRef.current += (targetWarp - warpSpeedRef.current) * 0.05;
    
    const mouse3D = new THREE.Vector3(state.pointer.x * 12, state.pointer.y * 12, 2);
    const pushDir = new THREE.Vector3();

    // 1. Update Asteroids (Rocks) -> No stretching anymore! 
    if (meshRef.current) {
        particles.forEach((p, i) => {
          // If warp speed active, push rocks backwards extremely fast straight ahead
          if (warpSpeedRef.current > 0.01) {
             const currentVelX = THREE.MathUtils.lerp(p.vel.x, 0, warpSpeedRef.current);
             const currentVelY = THREE.MathUtils.lerp(p.vel.y, 0, warpSpeedRef.current);
             p.pos.set(p.pos.x + currentVelX, p.pos.y + currentVelY, p.pos.z + (p.baseZSpeed + warpSpeedRef.current * 4.0));
             p.rotation.set(
                 p.rotation.x + p.rotSpeed.x * (1 - warpSpeedRef.current),
                 p.rotation.y + p.rotSpeed.y * (1 - warpSpeedRef.current),
                 p.rotation.z + p.rotSpeed.z * (1 - warpSpeedRef.current)
             );
          } else {
             p.pos.add(p.vel);
             p.rotation.add(p.rotSpeed);
             p.pos.z += p.baseZSpeed;
          }

          // Wrap around space boundaries
          if (Math.abs(p.pos.x) > 20) p.vel.x *= -1;
          if (Math.abs(p.pos.y) > 20) p.vel.y *= -1;
          if (p.pos.z > 15) {
             p.pos.z = -50; 
             p.pos.x = (Math.random() - 0.5) * 60; 
             p.pos.y = (Math.random() - 0.5) * 60;
          }
          if (p.pos.z < -60) p.vel.z *= -1;

          // Mouse Repulsion Interaction
          const dist = p.pos.distanceTo(mouse3D);
          if (dist < 4 && warpSpeedRef.current < 0.5) {
            pushDir.copy(p.pos).sub(mouse3D).normalize();
            p.pos.add(pushDir.multiplyScalar((4 - dist) * 0.08));
          }
          
          if (warpSpeedRef.current < 0.1) {
            const s = Math.sin(0.001);
            const c = Math.cos(0.001);
            const x = p.pos.x;
            const z = p.pos.z;
            p.pos.x = x * c + z * s;
            p.pos.z = z * c - x * s;
          }

          dummy.position.copy(p.pos);
          // Preserve uniform scaling (NOT stretched like logs)
          // Fade them out slightly by making them smaller if zooming past near camera bounds
          const visualScale = p.scale * (1.0 - (warpSpeedRef.current * 0.5));
          dummy.scale.setScalar(visualScale);
          dummy.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z);
          dummy.updateMatrix();
          meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current!.instanceMatrix.needsUpdate = true;
    }

    // 2. Update Warp Lines (Lasers) -> Only visible when warpSpeed > 0
    if (linesRef.current) {
        warpLines.forEach((line, i) => {
            // Move incredibly fast during warp
            line.pos.z += (line.speed + (warpSpeedRef.current * 8.0));
            
            // Loop lines back
            if (line.pos.z > 15) {
                line.pos.z = -80;
                line.pos.x = (Math.random() - 0.5) * 50;
                line.pos.y = (Math.random() - 0.5) * 50;
            }

            dummy.position.copy(line.pos);
            // Orient cylinder along Z axis rigidly
            dummy.rotation.set(Math.PI / 2, 0, 0); 
            // Stretch based on warp intensity
            const stretch = line.length + (warpSpeedRef.current * 15.0);
            const thinness = 1.0 - (warpSpeedRef.current * 0.8);
            dummy.scale.set(thinness, stretch, thinness);
            dummy.updateMatrix();
            linesRef.current!.setMatrixAt(i, dummy.matrix);
        });
        linesRef.current.instanceMatrix.needsUpdate = true;
        
        // Link opacity to warp intensity directly
        const mat = linesRef.current.material as THREE.Material;
        mat.opacity = warpSpeedRef.current * 0.6; // Soft laser glow
    }
    
    // Dynamic FOV for Tunnel effect
    if (state.camera instanceof THREE.PerspectiveCamera) {
      const targetFov = 45 + (warpSpeedRef.current * 30); 
      state.camera.fov += (targetFov - state.camera.fov) * 0.05;
      state.camera.updateProjectionMatrix();
    }
  });

  return (
    <group>
        {/* The true asteroids (No stretching, just rocks) */}
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]} key={shape}>
          {shape === "dodecahedron" && <dodecahedronGeometry args={[1, 0]} />}
          {shape === "icosahedron" && <icosahedronGeometry args={[1, 0]} />}
          {shape === "box" && <boxGeometry args={[1, 1, 1]} />}
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
        </instancedMesh>
        
        {/* The sci-fi light speed trails */}
        <instancedMesh ref={linesRef} args={[undefined, undefined, warpLinesCount]}>
          <cylinderGeometry args={[0.08, 0.08, 1, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
        </instancedMesh>
    </group>
  );
}

// Controls camera movement based on Scroll + Mouse Tracking
function CameraController() {
  useFrame((state) => {
    // 1. SCROLL PARALLAX: moves camera down effectively floating through space as you scroll down
    const scrollY = window.scrollY;
    // Reduce Y target so the camera doesn't veer off too drastically
    const targetY = (-scrollY * 0.005) + (state.pointer.y * 1.5);
    
    // 2. MOUSE PARALLAX: entire universe tilts slightly opposite to your mouse
    const targetX = state.pointer.x * 2;
    
    // Smooth Lerp
    state.camera.position.x += (targetX - state.camera.position.x) * 0.05;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.05;
    
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

// Background Nebula Clouds
export function NebulaClouds() {
  const particleTexture = useMemo(() => {
    // Generate a soft radial gradient for the "cloud" particle
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.3, 'rgba(255,255,255,0.4)');
      gradient.addColorStop(0.7, 'rgba(255,255,255,0.05)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  const count = 400;
  
  // Use useMemo to generate organic nebula shapes (Perlin/Simplex noise-like clusters)
  const { positions1, colors1, positions2, colors2 } = useMemo(() => {
    const p1 = new Float32Array(count * 3);
    const c1 = new Float32Array(count * 3);
    const p2 = new Float32Array(count * 3);
    const c2 = new Float32Array(count * 3);

    const baseColor1 = new THREE.Color("#4c1d95"); // Deep Purple
    const accentColor1 = new THREE.Color("#be185d"); // Deep Pink
    
    const baseColor2 = new THREE.Color("#1e3a8a"); // Deep Blue
    const accentColor2 = new THREE.Color("#0ea5e9"); // Cyan

    for (let i = 0; i < count; i++) {
        // Nebula 1: Large sweeping galactic arm
        const angle = Math.random() * Math.PI * 2;
        const radius = 10 + Math.random() * 40;
        const spreadY = (Math.random() - 0.5) * 15;
        p1[i * 3] = Math.cos(angle) * radius + (Math.random()-0.5)*15;
        p1[i * 3 + 1] = spreadY + (Math.random()-0.5)*10;
        p1[i * 3 + 2] = Math.sin(angle) * radius - 20 + (Math.random()-0.5)*15;
        
        const mixColor1 = baseColor1.clone().lerp(accentColor1, Math.random());
        c1[i * 3] = mixColor1.r;
        c1[i * 3 + 1] = mixColor1.g;
        c1[i * 3 + 2] = mixColor1.b;

        // Nebula 2: Concentrated core / diffuse background
        const angle2 = Math.random() * Math.PI * 2;
        const radius2 = Math.random() * 35;
        p2[i * 3] = Math.cos(angle2) * radius2 * 1.5;
        p2[i * 3 + 1] = (Math.random() - 0.5) * 25;
        p2[i * 3 + 2] = Math.sin(angle2) * radius2 - 30;

        const mixColor2 = baseColor2.clone().lerp(accentColor2, Math.random());
        c2[i * 3] = mixColor2.r;
        c2[i * 3 + 1] = mixColor2.g;
        c2[i * 3 + 2] = mixColor2.b;
    }
    return { positions1: p1, colors1: c1, positions2: p2, colors2: c2 };
  }, [count]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
        // Extremely slow drift of the entire nebula to make it feel alive
        groupRef.current.rotation.y += delta * 0.01;
        groupRef.current.rotation.z += delta * 0.002;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -10]}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} args={[positions1, 3]} />
          <bufferAttribute attach="attributes-color" count={count} args={[colors1, 3]} />
        </bufferGeometry>
        <pointsMaterial 
          size={35} 
          map={particleTexture} 
          vertexColors 
          transparent 
          opacity={0.08} 
          depthWrite={false}
          depthTest={false} 
          blending={THREE.AdditiveBlending} 
          sizeAttenuation={true}
        />
      </points>
      <points rotation={[0.2, 0.5, -0.1]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} args={[positions2, 3]} />
          <bufferAttribute attach="attributes-color" count={count} args={[colors2, 3]} />
        </bufferGeometry>
        <pointsMaterial 
          size={45} 
          map={particleTexture} 
          vertexColors 
          transparent 
          opacity={0.06} 
          depthWrite={false}
          depthTest={false}  
          blending={THREE.AdditiveBlending} 
          sizeAttenuation={true}
        />
      </points>
    </group>
  );
}

export default function Scene({ 
  coreColor = "#312e81", 
  particleColor = "#6366f1", 
  particleCount = 150, 
  particleShape = "dodecahedron",
  children
}: { 
  coreColor?: string, 
  particleColor?: string, 
  particleCount?: number, 
  particleShape?: "dodecahedron" | "icosahedron" | "box",
  children?: React.ReactNode
}) {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto bg-[#020205]">
      <Canvas camera={{ position: [0, 0, 12], fov: 45 }} gl={{ alpha: true }}>
        <color attach="background" args={['#020205']} />
        <React.Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={3} color="#818cf8" />
          <directionalLight position={[-10, -10, -5]} intensity={2} color="#c084fc" />
          
          <CameraController />
          <BlackHoleCore color={coreColor} />
          <AsteroidField count={particleCount} color={particleColor} shape={particleShape} />
          <NebulaClouds />

          {/* Render User's Custom 3D/4D Models Here */}
          {children}
          
          {/* Dense Universe Stars & Sparkles */}
          <Stars radius={150} depth={100} count={8000} factor={6} saturation={1} fade speed={2} />
          <Sparkles count={300} scale={25} size={3} speed={0.2} opacity={0.4} color="#818cf8" />
          <Sparkles count={200} scale={20} size={1} speed={0.4} opacity={0.6} color="#c084fc" />
          <Sparkles count={100} scale={30} size={6} speed={0.1} opacity={0.2} color="#2dd4bf" />
          
          <Environment preset="city" />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
