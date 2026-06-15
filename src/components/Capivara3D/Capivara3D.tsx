"use client";

import React from "react";
import styles from "./Capivara3D.module.css";

interface CubeProps {
  w: number; // width (X)
  h: number; // height (Y)
  d: number; // depth (Z)
  x: number; // position X (left offset)
  y: number; // position Y (top offset)
  z: number; // position Z (depth offset)
  color: string; // base color
  topColor?: string; // highlight color for top face
  rightColor?: string; // shade color for right/left face
}

// Helper component to render a 3D rectangular prism (cube) using CSS 3D transforms
function Cube({ w, h, d, x, y, z, color, topColor, rightColor }: CubeProps) {
  const style = {
    width: `${w}px`,
    height: `${h}px`,
    left: `${x}px`,
    top: `${y}px`,
    transform: `translate3d(0, 0, ${z}px)`,
    "--w": `${w}px`,
    "--h": `${h}px`,
    "--d": `${d}px`,
    "--color-base": color,
    "--color-top": topColor || color,
    "--color-side": rightColor || color,
  } as React.CSSProperties;

  return (
    <div className={styles.cube} style={style}>
      <div className={`${styles.face} ${styles.front}`} />
      <div className={`${styles.face} ${styles.back}`} />
      <div className={`${styles.face} ${styles.left}`} />
      <div className={`${styles.face} ${styles.right}`} />
      <div className={`${styles.face} ${styles.top}`} />
      <div className={`${styles.face} ${styles.bottom}`} />
    </div>
  );
}

interface Capivara3DProps {
  sizeMultiplier?: number;
}

export default function Capivara3D({ sizeMultiplier = 1 }: Capivara3DProps) {
  // Color palette
  const furLight = "#a06a42"; // Back/sides
  const furDark = "#6d3d1e";  // Focinho/Patas
  const eyeColor = "#111111"; // Eyes
  const orangeColor = "#ff9800"; // Orange fruit
  const leafColor = "#4caf50";   // Orange leaf

  const scaleStyle = {
    transform: `scale(${sizeMultiplier})`,
  } as React.CSSProperties;

  return (
    <div className={styles.container} style={scaleStyle}>
      <div className={styles.scene}>
        <div className={styles.capivara}>
          {/* 1. Corpo principal (Body) */}
          <Cube
            w={80} h={52} d={54}
            x={-40} y={-10} z={-27}
            color={furLight}
            topColor="#bd855b"
            rightColor="#84522f"
          />

          {/* 2. Cabeça (Head) */}
          <Cube
            w={38} h={38} d={38}
            x={24} y={-36} z={-19}
            color={furLight}
            topColor="#bd855b"
            rightColor="#84522f"
          />

          {/* 3. Focinho (Snout) */}
          <Cube
            w={20} h={24} d={32}
            x={56} y={-24} z={-16}
            color={furDark}
            topColor="#84522f"
            rightColor="#522d14"
          />

          {/* 4. Olhos (Eyes) - Left and Right */}
          <Cube w={4} h={4} d={4} x={42} y={-30} z={19} color={eyeColor} />
          <Cube w={4} h={4} d={4} x={42} y={-30} z={-23} color={eyeColor} />

          {/* 5. Orelhas (Ears) - Left and Right */}
          <Cube w={8} h={10} d={4} x={26} y={-44} z={18} color={furDark} />
          <Cube w={8} h={10} d={4} x={26} y={-44} z={-22} color={furDark} />

          {/* 6. Pernas dianteiras (Front Legs) - Left and Right */}
          <Cube
            w={14} h={28} d={14}
            x={20} y={42} z={14}
            color={furDark}
            topColor="#84522f"
            rightColor="#522d14"
          />
          <Cube
            w={14} h={28} d={14}
            x={20} y={42} z={-28}
            color={furDark}
            topColor="#84522f"
            rightColor="#522d14"
          />

          {/* 7. Pernas traseiras (Back Legs) - Left and Right */}
          <Cube
            w={16} h={28} d={16}
            x={-34} y={42} z={14}
            color={furDark}
            topColor="#84522f"
            rightColor="#522d14"
          />
          <Cube
            w={16} h={28} d={16}
            x={-34} y={42} z={-30}
            color={furDark}
            topColor="#84522f"
            rightColor="#522d14"
          />

          {/* 8. A Laranja na Cabeça (Orange on Head) */}
          <Cube w={18} h={18} d={18} x={34} y={-54} z={-9} color={orangeColor} topColor="#ffa726" rightColor="#f57c00" />
          {/* Folhinha da Laranja (Orange leaf) */}
          <Cube w={4} h={4} d={8} x={41} y={-58} z={-4} color={leafColor} />
        </div>
        
        {/* Shadow floor under capy */}
        <div className={styles.shadow} />
      </div>
    </div>
  );
}
