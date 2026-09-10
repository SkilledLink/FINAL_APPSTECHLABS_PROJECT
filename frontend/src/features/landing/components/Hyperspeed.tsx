// src/components/Hyperspeed.tsx
import React, { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

export interface HyperspeedProps {
  lineColor?: string;
  glowColor?: string;
  speed?: number;
  scale?: number;
  rotation?: number;
  rotationSpeed?: number;
  layers?: number;
  waveAmplitude?: number;
  waveFrequency?: number;
  waveSpeed?: number;
  layerSpeed?: number;
  twist?: number;
  twistFrequency?: number;
  twistSpeed?: number;
  lineFrequency?: number;
  lineSpacing?: number;
  lineSharpness?: number;
  glowFalloff?: number;
  glowIntensity?: number;
  brightness?: number;
  blueBoost?: number;
  vignette?: number;
  grain?: number;
  lightMode?: boolean;
  dpr?: number;
  fps?: number;
  paused?: boolean;
  className?: string;
}

const hexToRgb = (hex: string): [number, number, number] => {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
};

export const Hyperspeed: React.FC<HyperspeedProps> = ({
  lineColor = '#140E35',
  glowColor = '#3437A0',
  speed = 0.2,
  scale = 2,
  rotation = 0,
  rotationSpeed = 0.25,
  layers = 4,
  waveAmplitude = 0.015,
  waveFrequency = 3,
  waveSpeed = 0.15,
  layerSpeed = 0.08,
  twist = 0.1,
  twistFrequency = 5,
  twistSpeed = 1.2,
  lineFrequency = 5,
  lineSpacing = 2,
  lineSharpness = 16,
  glowFalloff = 10,
  glowIntensity = 1.6,
  brightness = 2,
  blueBoost = 1.25,
  vignette = 0.8,
  grain = 0.05,
  lightMode = false,
  dpr = 1,
  fps = 60,
  paused = false,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      dpr: Math.min(Math.max(dpr, 0.5), 2),
      alpha: true
    });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);

    const vertexShader = `
      attribute vec2 uv;
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      varying vec2 vUv;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform vec3 uLineColor;
      uniform vec3 uGlowColor;
      uniform float uSpeed;
      uniform float uScale;
      uniform float uRotation;
      uniform float uRotationSpeed;
      uniform int uLayers;
      uniform float uWaveAmplitude;
      uniform float uWaveFrequency;
      uniform float uWaveSpeed;
      uniform float uLayerSpeed;
      uniform float uTwist;
      uniform float uTwistFrequency;
      uniform float uTwistSpeed;
      uniform float uLineFrequency;
      uniform float uLineSpacing;
      uniform float uLineSharpness;
      uniform float uGlowFalloff;
      uniform float uGlowIntensity;
      uniform float uBrightness;
      uniform float uBlueBoost;
      uniform float uVignette;
      uniform float uGrain;
      uniform bool uLightMode;

      float rand(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        vec2 st = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);
        st *= uScale;

        float rad = radians(uRotation + uTime * uRotationSpeed);
        mat2 rot = mat2(cos(rad), -sin(rad), sin(rad), cos(rad));
        st = rot * st;

        vec3 color = uLightMode ? vec3(1.0) : vec3(0.0);
        float t = uTime * uSpeed;

        for (int i = 0; i < 10; i++) {
          if (i >= uLayers) break;
          float fi = float(i);
          float layerTime = t + fi * uLayerSpeed;
          
          vec2 waveSt = st + sin(st.yx * uWaveFrequency + layerTime * uWaveSpeed) * uWaveAmplitude;
          float twistAngle = sin(length(waveSt) * uTwistFrequency + layerTime * uTwistSpeed) * uTwist;
          mat2 twistRot = mat2(cos(twistAngle), -sin(twistAngle), sin(twistAngle), cos(twistAngle));
          waveSt = twistRot * waveSt;

          float freq = uLineFrequency + fi * uLineSpacing;
          float pattern = sin(waveSt.x * freq + layerTime) * 0.5 + 0.5;
          
          float lineCore = pow(pattern, uLineSharpness);
          float glowBand = pow(pattern, uGlowFalloff) * uGlowIntensity;

          vec3 layerColor = mix(uLineColor, uGlowColor, glowBand);
          color += layerColor * (lineCore + glowBand);
        }

        color *= uBrightness;
        color.b *= uBlueBoost;

        float vig = length(gl_FragCoord.xy - 0.5 * uResolution.xy) / (0.5 * length(uResolution.xy));
        color *= mix(1.0, 1.0 - vig, uVignette);

        float grainVal = (rand(st + uTime) - 0.5) * uGrain;
        color += grainVal;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uResolution: { value: [window.innerWidth, window.innerHeight] },
        uTime: { value: 0 },
        uLineColor: { value: hexToRgb(lineColor) },
        uGlowColor: { value: hexToRgb(glowColor) },
        uSpeed: { value: speed },
        uScale: { value: scale },
        uRotation: { value: rotation },
        uRotationSpeed: { value: rotationSpeed },
        uLayers: { value: layers },
        uWaveAmplitude: { value: waveAmplitude },
        uWaveFrequency: { value: waveFrequency },
        uWaveSpeed: { value: waveSpeed },
        uLayerSpeed: { value: layerSpeed },
        uTwist: { value: twist },
        uTwistFrequency: { value: twistFrequency },
        uTwistSpeed: { value: twistSpeed },
        uLineFrequency: { value: lineFrequency },
        uLineSpacing: { value: lineSpacing },
        uLineSharpness: { value: lineSharpness },
        uGlowFalloff: { value: glowFalloff },
        uGlowIntensity: { value: glowIntensity },
        uBrightness: { value: brightness },
        uBlueBoost: { value: blueBoost },
        uVignette: { value: vignette },
        uGrain: { value: grain },
        uLightMode: { value: lightMode }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      program.uniforms.uResolution.value = [width * renderer.dpr, height * renderer.dpr];
    };

    window.addEventListener('resize', resize);
    resize();

    let animationFrameId: number;
    let lastTime = performance.now();
    const interval = 1000 / fps;

    const update = (time: number) => {
      animationFrameId = requestAnimationFrame(update);
      if (paused) return;

      const delta = time - lastTime;
      if (delta >= interval) {
        lastTime = time - (delta % interval);
        program.uniforms.uTime.value = time * 0.001;
        renderer.render({ scene: mesh });
      }
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      if (gl.canvas.parentNode) {
        gl.canvas.parentNode.removeChild(gl.canvas);
      }
    };
  }, [
    lineColor, glowColor, speed, scale, rotation, rotationSpeed, layers,
    waveAmplitude, waveFrequency, waveSpeed, layerSpeed, twist, twistFrequency,
    twistSpeed, lineFrequency, lineSpacing, lineSharpness, glowFalloff,
    glowIntensity, brightness, blueBoost, vignette, grain, lightMode, dpr, fps, paused
  ]);

  return <div ref={containerRef} className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} />;
};