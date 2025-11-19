// Face Deformation Shaders Collection

export const shaderLibrary = {
  // Vertex Shader - Common for all effects
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  // Fragment Shaders for different effects
  fragmentShaders: {
    // 1. Ripple Deformation
    ripple: `
      uniform sampler2D tDiffuse;
      uniform float time;
      uniform vec2 faceCenter;
      uniform float intensity;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;
        vec2 center = faceCenter;
        float dist = distance(uv, center);

        float wave = sin(dist * 30.0 - time * 5.0) * intensity * 0.02;
        uv += normalize(uv - center) * wave;

        vec4 texel = texture2D(tDiffuse, uv);
        gl_FragColor = texel;
      }
    `,

    // 2. Bulge/Pinch Deformation
    bulge: `
      uniform sampler2D tDiffuse;
      uniform vec2 faceCenter;
      uniform float intensity;
      uniform float radius;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;
        vec2 center = faceCenter;
        float dist = distance(uv, center);

        if (dist < radius) {
          float percent = (radius - dist) / radius;
          float theta = percent * percent * intensity * 0.5;
          float sinTheta = sin(theta);
          float cosTheta = cos(theta);

          vec2 delta = uv - center;
          uv = center + vec2(
            delta.x * cosTheta - delta.y * sinTheta,
            delta.x * sinTheta + delta.y * cosTheta
          );
        }

        vec4 texel = texture2D(tDiffuse, uv);
        gl_FragColor = texel;
      }
    `,

    // 3. Swirl Deformation
    swirl: `
      uniform sampler2D tDiffuse;
      uniform vec2 faceCenter;
      uniform float intensity;
      uniform float radius;
      uniform float time;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;
        vec2 center = faceCenter;
        vec2 delta = uv - center;
        float dist = length(delta);

        if (dist < radius) {
          float percent = (radius - dist) / radius;
          float theta = percent * percent * intensity * 3.14159 + time * 0.5;
          float s = sin(theta);
          float c = cos(theta);

          uv = center + vec2(
            delta.x * c - delta.y * s,
            delta.x * s + delta.y * c
          );
        }

        vec4 texel = texture2D(tDiffuse, uv);
        gl_FragColor = texel;
      }
    `,

    // 4. Pixelate
    pixelate: `
      uniform sampler2D tDiffuse;
      uniform vec2 faceCenter;
      uniform float intensity;
      uniform float radius;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;
        vec2 center = faceCenter;
        float dist = distance(uv, center);

        if (dist < radius) {
          float pixelSize = intensity * 0.02;
          uv = floor(uv / pixelSize) * pixelSize;
        }

        vec4 texel = texture2D(tDiffuse, uv);
        gl_FragColor = texel;
      }
    `,

    // 5. Kaleidoscope
    kaleidoscope: `
      uniform sampler2D tDiffuse;
      uniform vec2 faceCenter;
      uniform float intensity;
      uniform float time;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv - faceCenter;
        float angle = atan(uv.y, uv.x);
        float radius = length(uv);

        float segments = floor(intensity * 8.0) + 2.0;
        angle = mod(angle, 6.28318 / segments);
        angle = abs(angle - 3.14159 / segments);

        uv = vec2(cos(angle + time * 0.2), sin(angle + time * 0.2)) * radius + faceCenter;

        vec4 texel = texture2D(tDiffuse, uv);
        gl_FragColor = texel;
      }
    `,

    // 6. Wave Distortion
    wave: `
      uniform sampler2D tDiffuse;
      uniform float time;
      uniform vec2 faceCenter;
      uniform float intensity;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;
        float dist = distance(uv, faceCenter);

        uv.x += sin(uv.y * 20.0 + time * 3.0) * intensity * 0.01;
        uv.y += cos(uv.x * 20.0 + time * 3.0) * intensity * 0.01;

        vec4 texel = texture2D(tDiffuse, uv);
        gl_FragColor = texel;
      }
    `,

    // 7. Mirror Effect
    mirror: `
      uniform sampler2D tDiffuse;
      uniform vec2 faceCenter;
      uniform float intensity;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;

        if (intensity > 0.5) {
          if (uv.x > faceCenter.x) {
            uv.x = faceCenter.x - (uv.x - faceCenter.x);
          }
        } else {
          if (uv.y > faceCenter.y) {
            uv.y = faceCenter.y - (uv.y - faceCenter.y);
          }
        }

        vec4 texel = texture2D(tDiffuse, uv);
        gl_FragColor = texel;
      }
    `,

    // 8. Chromatic Aberration
    chromatic: `
      uniform sampler2D tDiffuse;
      uniform vec2 faceCenter;
      uniform float intensity;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;
        vec2 direction = normalize(uv - faceCenter);
        float dist = distance(uv, faceCenter);

        float offset = intensity * 0.01 * dist;

        float r = texture2D(tDiffuse, uv + direction * offset).r;
        float g = texture2D(tDiffuse, uv).g;
        float b = texture2D(tDiffuse, uv - direction * offset).b;

        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `,

    // 9. Thermal Vision
    thermal: `
      uniform sampler2D tDiffuse;
      uniform float intensity;
      varying vec2 vUv;

      void main() {
        vec4 texel = texture2D(tDiffuse, vUv);
        float gray = dot(texel.rgb, vec3(0.299, 0.587, 0.114));

        vec3 cold = vec3(0.0, 0.0, 1.0);
        vec3 medium = vec3(1.0, 1.0, 0.0);
        vec3 hot = vec3(1.0, 0.0, 0.0);

        vec3 color;
        if (gray < 0.5) {
          color = mix(cold, medium, gray * 2.0);
        } else {
          color = mix(medium, hot, (gray - 0.5) * 2.0);
        }

        gl_FragColor = vec4(mix(texel.rgb, color, intensity), 1.0);
      }
    `,

    // 10. Glitch Effect
    glitch: `
      uniform sampler2D tDiffuse;
      uniform float time;
      uniform float intensity;
      varying vec2 vUv;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      void main() {
        vec2 uv = vUv;

        float glitchStrength = intensity * 0.1;
        float glitch = step(0.98, random(vec2(time * 0.1, uv.y)));

        uv.x += (random(vec2(time, uv.y)) - 0.5) * glitchStrength * glitch;

        vec4 texel = texture2D(tDiffuse, uv);

        if (glitch > 0.5) {
          texel.r = texture2D(tDiffuse, uv + vec2(0.01 * intensity, 0.0)).r;
          texel.b = texture2D(tDiffuse, uv - vec2(0.01 * intensity, 0.0)).b;
        }

        gl_FragColor = texel;
      }
    `
  }
};

export const effectPresets = {
  ripple: { name: 'Ripple Wave', intensity: 1.0, radius: 0.3 },
  bulge: { name: 'Bulge/Pinch', intensity: 1.0, radius: 0.3 },
  swirl: { name: 'Swirl', intensity: 1.0, radius: 0.3 },
  pixelate: { name: 'Pixelate', intensity: 0.5, radius: 0.3 },
  kaleidoscope: { name: 'Kaleidoscope', intensity: 0.5, radius: 0.5 },
  wave: { name: 'Wave Distortion', intensity: 1.0, radius: 0.5 },
  mirror: { name: 'Mirror', intensity: 1.0, radius: 0.5 },
  chromatic: { name: 'Chromatic Aberration', intensity: 1.0, radius: 0.3 },
  thermal: { name: 'Thermal Vision', intensity: 1.0, radius: 0.5 },
  glitch: { name: 'Glitch', intensity: 1.0, radius: 0.5 }
};
