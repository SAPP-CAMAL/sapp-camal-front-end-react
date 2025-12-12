"use client";

import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Environment } from "@react-three/drei";
import * as THREE from "three";
import type { AnimalIncomeData } from "../domain/animal-income.types";

interface PieSliceProps {
  startAngle: number;
  endAngle: number;
  color: string;
  radius: number;
  height: number;
  label: string;
  percentage: number;
}

function PieSlice({
  startAngle,
  endAngle,
  color,
  radius,
  height,
  label,
  percentage,
}: PieSliceProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.1 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    
    shape.moveTo(0, 0);
    for (let angle = startAngle; angle <= endAngle; angle += 0.1) {
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      shape.lineTo(x, y);
    }
    shape.lineTo(0, 0);

    const extrudeSettings = {
      depth: height,
      bevelEnabled: true,
      bevelThickness: 0.2,
      bevelSize: 0.1,
      bevelSegments: 5,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [startAngle, endAngle, radius, height]);

  const midAngle = (startAngle + endAngle) / 2;
  const labelX = Math.cos(midAngle) * (radius * 1.3);
  const labelY = Math.sin(midAngle) * (radius * 1.3);

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[0, 0, -height / 2]}
        geometry={geometry}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          metalness={0.5}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={hovered ? 0.4 : 0.1}
        />
      </mesh>
      <Text
        position={[labelX, labelY, height / 2 + 0.5]}
        fontSize={0.35}
        color="#1e293b"
        anchorX="center"
        anchorY="middle"
        maxWidth={3}
      >
        {`${label}\n${percentage.toFixed(1)}%`}
      </Text>
    </group>
  );
}

interface Chart3DContentProps {
  data: AnimalIncomeData[];
}

const COLORS = [
  "#0f766e", // Teal 700 (BOVINO)
  "#14b8a6", // Teal 500 (PORCINO)
  "#f59e0b", // Amber 500 (OVINO/CAPRINO)
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#ec4899", // Pink
];

const Scene = React.memo(function Scene({ data }: { data: AnimalIncomeData[] }) {
  const slices = useMemo(() => {
    let currentAngle = 0;
    return data.map((item, index) => {
      const startAngle = currentAngle;
      const angleSize = (item.percentage / 100) * Math.PI * 2;
      const endAngle = currentAngle + angleSize;
      currentAngle = endAngle;

      return {
        key: `slice-${index}`,
        startAngle,
        endAngle,
        color: COLORS[index % COLORS.length],
        label: item.species,
        percentage: item.percentage,
      };
    });
  }, [data]);

  return (
    <React.Suspense fallback={null}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        castShadow
      />
      <Environment preset="city" />
      
      <group rotation={[Math.PI / 6, 0, 0]}>
        {slices.map((slice) => (
          <PieSlice
            key={slice.key}
            startAngle={slice.startAngle}
            endAngle={slice.endAngle}
            color={slice.color}
            radius={4}
            height={2}
            label={slice.label}
            percentage={slice.percentage}
          />
        ))}
      </group>

      <OrbitControls
        enableZoom={true}
        enablePan={true}
        minDistance={8}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </React.Suspense>
  );
});

const Chart3DContent = React.memo(function Chart3DContent({ data }: Chart3DContentProps) {
  const [error, setError] = useState<string | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] rounded-xl overflow-hidden flex items-center justify-center bg-slate-50">
        <div className="text-center px-4">
          <p className="text-slate-600 text-sm sm:text-base">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] rounded-xl overflow-hidden flex items-center justify-center bg-slate-50">
        <div className="text-center px-4">
          <p className="text-red-600 text-sm sm:text-base">Error al cargar el gráfico 3D</p>
          <p className="text-slate-500 text-xs mt-2">{error}</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
        <Canvas 
          camera={{ position: [0, 0, 12], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          onError={(error: any) => {
            setError(String(error) || "Error desconocido");
          }}
        >
          <Scene data={data} />
        </Canvas>
      </div>
    );
  } catch (err) {
    return (
      <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] rounded-xl overflow-hidden flex items-center justify-center bg-slate-50">
        <div className="text-center px-4">
          <p className="text-red-600 text-sm sm:text-base">Error al renderizar el gráfico 3D</p>
        </div>
      </div>
    );
  }
});

export default Chart3DContent;
