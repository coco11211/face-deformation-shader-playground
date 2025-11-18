// WebGL Shader System for Face Deformation
class ShaderEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

        if (!this.gl) {
            throw new Error('WebGL not supported');
        }

        this.currentEffect = 'bulge';
        this.params = {
            intensity: 0.5,
            radius: 150,
            speed: 1.0,
            rotation: 0,
            blend: 1.0,
            time: 0
        };

        this.faceData = null;
        this.sourceTexture = null;
        this.program = null;
        this.positionBuffer = null;
        this.texCoordBuffer = null;

        this.init();
    }

    init() {
        const gl = this.gl;

        // Create buffers for a full-screen quad
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        this.texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        const texCoords = new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]);
        gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

        // Create initial shader program
        this.updateShaderProgram();
    }

    // Vertex Shader (same for all effects)
    getVertexShader() {
        return `
            attribute vec2 aPosition;
            attribute vec2 aTexCoord;
            varying vec2 vTexCoord;

            void main() {
                gl_Position = vec4(aPosition, 0.0, 1.0);
                vTexCoord = aTexCoord;
            }
        `;
    }

    // Fragment Shader Factory
    getFragmentShader(effectType) {
        const commonHeader = `
            precision highp float;
            varying vec2 vTexCoord;
            uniform sampler2D uTexture;
            uniform vec2 uResolution;
            uniform float uIntensity;
            uniform float uRadius;
            uniform float uTime;
            uniform float uRotation;
            uniform float uBlend;
            uniform vec2 uFaceCenter;
            uniform bool uHasFace;

            const float PI = 3.14159265359;
        `;

        const shaders = {
            bulge: `
                ${commonHeader}

                void main() {
                    vec2 uv = vTexCoord;
                    vec2 center = uHasFace ? uFaceCenter : vec2(0.5, 0.5);

                    vec2 delta = (uv - center) * uResolution;
                    float dist = length(delta);

                    if (dist < uRadius) {
                        float percent = (uRadius - dist) / uRadius;
                        float theta = percent * percent * uIntensity * 0.5;
                        float offset = sin(theta * PI);

                        vec2 direction = normalize(delta);
                        uv = uv + direction * offset * (uRadius / uResolution.x) * 0.5;
                    }

                    vec4 original = texture2D(uTexture, vTexCoord);
                    vec4 effect = texture2D(uTexture, uv);
                    gl_FragColor = mix(original, effect, uBlend);
                }
            `,

            pinch: `
                ${commonHeader}

                void main() {
                    vec2 uv = vTexCoord;
                    vec2 center = uHasFace ? uFaceCenter : vec2(0.5, 0.5);

                    vec2 delta = (uv - center) * uResolution;
                    float dist = length(delta);

                    if (dist < uRadius) {
                        float percent = (uRadius - dist) / uRadius;
                        float theta = percent * percent * uIntensity * 0.5;
                        float offset = -sin(theta * PI);

                        vec2 direction = normalize(delta);
                        uv = uv + direction * offset * (uRadius / uResolution.x) * 0.5;
                    }

                    vec4 original = texture2D(uTexture, vTexCoord);
                    vec4 effect = texture2D(uTexture, uv);
                    gl_FragColor = mix(original, effect, uBlend);
                }
            `,

            swirl: `
                ${commonHeader}

                void main() {
                    vec2 uv = vTexCoord;
                    vec2 center = uHasFace ? uFaceCenter : vec2(0.5, 0.5);

                    vec2 delta = uv - center;
                    float dist = length(delta * uResolution);

                    if (dist < uRadius) {
                        float percent = (uRadius - dist) / uRadius;
                        float angle = percent * percent * uIntensity * PI + uRotation * PI / 180.0;

                        float s = sin(angle);
                        float c = cos(angle);

                        vec2 rotated = vec2(
                            delta.x * c - delta.y * s,
                            delta.x * s + delta.y * c
                        );

                        uv = center + rotated;
                    }

                    vec4 original = texture2D(uTexture, vTexCoord);
                    vec4 effect = texture2D(uTexture, uv);
                    gl_FragColor = mix(original, effect, uBlend);
                }
            `,

            liquify: `
                ${commonHeader}

                void main() {
                    vec2 uv = vTexCoord;
                    vec2 center = uHasFace ? uFaceCenter : vec2(0.5, 0.5);

                    vec2 delta = uv - center;
                    float dist = length(delta * uResolution);

                    if (dist < uRadius) {
                        float percent = (uRadius - dist) / uRadius;
                        float angle = uTime * 2.0 + uRotation * PI / 180.0;

                        vec2 offset = vec2(
                            sin(angle + delta.y * 10.0) * percent * uIntensity * 0.1,
                            cos(angle + delta.x * 10.0) * percent * uIntensity * 0.1
                        );

                        uv += offset;
                    }

                    vec4 original = texture2D(uTexture, vTexCoord);
                    vec4 effect = texture2D(uTexture, uv);
                    gl_FragColor = mix(original, effect, uBlend);
                }
            `,

            fisheye: `
                ${commonHeader}

                void main() {
                    vec2 uv = vTexCoord;
                    vec2 center = uHasFace ? uFaceCenter : vec2(0.5, 0.5);

                    vec2 delta = uv - center;
                    float dist = length(delta);

                    if (dist < uRadius / max(uResolution.x, uResolution.y)) {
                        float power = (uIntensity * 2.0 + 1.0);
                        float bound = sqrt(dot(delta, delta));
                        float percent = bound / (uRadius / max(uResolution.x, uResolution.y));

                        float distortion = pow(percent, power);
                        uv = center + normalize(delta) * distortion * bound;
                    }

                    vec4 original = texture2D(uTexture, vTexCoord);
                    vec4 effect = texture2D(uTexture, uv);
                    gl_FragColor = mix(original, effect, uBlend);
                }
            `,

            mirror: `
                ${commonHeader}

                void main() {
                    vec2 uv = vTexCoord;
                    vec2 center = uHasFace ? uFaceCenter : vec2(0.5, 0.5);

                    float angle = uRotation * PI / 180.0;
                    vec2 dir = vec2(cos(angle), sin(angle));

                    float side = dot(uv - center, dir);
                    if (side < 0.0) {
                        vec2 reflected = uv - 2.0 * side * dir;
                        uv = reflected;
                    }

                    vec4 original = texture2D(uTexture, vTexCoord);
                    vec4 effect = texture2D(uTexture, uv);
                    gl_FragColor = mix(original, effect, uBlend * uIntensity);
                }
            `,

            pixelate: `
                ${commonHeader}

                void main() {
                    vec2 uv = vTexCoord;
                    vec2 center = uHasFace ? uFaceCenter : vec2(0.5, 0.5);

                    float dist = length((uv - center) * uResolution);

                    if (dist < uRadius) {
                        float pixelSize = (1.0 - uIntensity) * 0.001 + uIntensity * 0.05;
                        uv = floor(uv / pixelSize) * pixelSize;
                    }

                    vec4 original = texture2D(uTexture, vTexCoord);
                    vec4 effect = texture2D(uTexture, uv);
                    gl_FragColor = mix(original, effect, uBlend);
                }
            `,

            bloom: `
                ${commonHeader}

                void main() {
                    vec2 uv = vTexCoord;
                    vec2 center = uHasFace ? uFaceCenter : vec2(0.5, 0.5);

                    vec4 color = texture2D(uTexture, uv);

                    float dist = length((uv - center) * uResolution);
                    if (dist < uRadius) {
                        vec4 bloom = vec4(0.0);
                        float samples = 16.0;
                        float intensity = uIntensity * 0.01;

                        for (float i = 0.0; i < samples; i++) {
                            float angle = i * 2.0 * PI / samples;
                            vec2 offset = vec2(cos(angle), sin(angle)) * intensity;
                            bloom += texture2D(uTexture, uv + offset);
                        }

                        bloom /= samples;
                        color = color + bloom * uIntensity;
                    }

                    vec4 original = texture2D(uTexture, vTexCoord);
                    gl_FragColor = mix(original, color, uBlend);
                }
            `,

            glitch: `
                ${commonHeader}

                float random(vec2 st) {
                    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
                }

                void main() {
                    vec2 uv = vTexCoord;
                    vec2 center = uHasFace ? uFaceCenter : vec2(0.5, 0.5);

                    float dist = length((uv - center) * uResolution);

                    if (dist < uRadius) {
                        float glitchStrength = uIntensity * 0.1;
                        float blockSize = 0.05;

                        float block = floor(uv.y / blockSize);
                        float noise = random(vec2(block, floor(uTime * 10.0)));

                        if (noise > 0.7) {
                            uv.x += (noise - 0.7) * glitchStrength;
                        }

                        // RGB split
                        vec4 r = texture2D(uTexture, uv + vec2(glitchStrength * 0.01, 0.0));
                        vec4 g = texture2D(uTexture, uv);
                        vec4 b = texture2D(uTexture, uv - vec2(glitchStrength * 0.01, 0.0));

                        gl_FragColor = vec4(r.r, g.g, b.b, 1.0);
                    } else {
                        gl_FragColor = texture2D(uTexture, uv);
                    }
                }
            `,

            ripple: `
                ${commonHeader}

                void main() {
                    vec2 uv = vTexCoord;
                    vec2 center = uHasFace ? uFaceCenter : vec2(0.5, 0.5);

                    vec2 delta = uv - center;
                    float dist = length(delta * uResolution);

                    if (dist < uRadius) {
                        float ripple = sin((dist - uTime * 50.0 * uIntensity) * 0.05) * uIntensity * 20.0;
                        vec2 direction = normalize(delta);
                        uv += direction * ripple / uResolution.x;
                    }

                    vec4 original = texture2D(uTexture, vTexCoord);
                    vec4 effect = texture2D(uTexture, uv);
                    gl_FragColor = mix(original, effect, uBlend);
                }
            `,

            tunnel: `
                ${commonHeader}

                void main() {
                    vec2 uv = vTexCoord;
                    vec2 center = uHasFace ? uFaceCenter : vec2(0.5, 0.5);

                    vec2 delta = uv - center;
                    float dist = length(delta);
                    float angle = atan(delta.y, delta.x) + uRotation * PI / 180.0;

                    float r = dist / (0.5 + uIntensity * 0.5);
                    vec2 tunnelUV = vec2(angle / (2.0 * PI), 1.0 / r);
                    tunnelUV.y += uTime * 0.5;

                    vec4 original = texture2D(uTexture, vTexCoord);
                    vec4 effect = texture2D(uTexture, fract(tunnelUV));

                    float blend = smoothstep(uRadius / max(uResolution.x, uResolution.y), 0.0, dist);
                    gl_FragColor = mix(original, effect, blend * uBlend);
                }
            `,

            kaleidoscope: `
                ${commonHeader}

                void main() {
                    vec2 uv = vTexCoord;
                    vec2 center = uHasFace ? uFaceCenter : vec2(0.5, 0.5);

                    vec2 delta = uv - center;
                    float angle = atan(delta.y, delta.x) + uRotation * PI / 180.0;
                    float dist = length(delta);

                    float segments = floor(uIntensity * 10.0) + 2.0;
                    float segmentAngle = 2.0 * PI / segments;

                    angle = mod(angle, segmentAngle);
                    if (mod(floor(atan(delta.y, delta.x) / segmentAngle), 2.0) == 0.0) {
                        angle = segmentAngle - angle;
                    }

                    vec2 kaleidoUV = vec2(cos(angle), sin(angle)) * dist + center;

                    vec4 original = texture2D(uTexture, vTexCoord);
                    vec4 effect = texture2D(uTexture, kaleidoUV);

                    float blend = smoothstep(uRadius / max(uResolution.x, uResolution.y), 0.0, dist);
                    gl_FragColor = mix(original, effect, blend * uBlend);
                }
            `
        };

        return shaders[effectType] || shaders.bulge;
    }

    compileShader(source, type) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    updateShaderProgram() {
        const gl = this.gl;

        // Delete old program if exists
        if (this.program) {
            gl.deleteProgram(this.program);
        }

        const vertexShader = this.compileShader(this.getVertexShader(), gl.VERTEX_SHADER);
        const fragmentShader = this.compileShader(this.getFragmentShader(this.currentEffect), gl.FRAGMENT_SHADER);

        if (!vertexShader || !fragmentShader) {
            return;
        }

        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error('Program linking error:', gl.getProgramInfoLog(this.program));
            return;
        }

        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
    }

    setEffect(effectType) {
        this.currentEffect = effectType;
        this.updateShaderProgram();
    }

    setParams(params) {
        this.params = { ...this.params, ...params };
    }

    setFaceData(faceData) {
        this.faceData = faceData;
    }

    loadTexture(source) {
        const gl = this.gl;

        if (this.sourceTexture) {
            gl.deleteTexture(this.sourceTexture);
        }

        this.sourceTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.sourceTexture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    }

    render() {
        if (!this.program || !this.sourceTexture) return;

        const gl = this.gl;

        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(this.program);

        // Set up position attribute
        const positionLoc = gl.getAttribLocation(this.program, 'aPosition');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

        // Set up texture coordinate attribute
        const texCoordLoc = gl.getAttribLocation(this.program, 'aTexCoord');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.enableVertexAttribArray(texCoordLoc);
        gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

        // Set uniforms
        gl.uniform1i(gl.getUniformLocation(this.program, 'uTexture'), 0);
        gl.uniform2f(gl.getUniformLocation(this.program, 'uResolution'), this.canvas.width, this.canvas.height);
        gl.uniform1f(gl.getUniformLocation(this.program, 'uIntensity'), this.params.intensity);
        gl.uniform1f(gl.getUniformLocation(this.program, 'uRadius'), this.params.radius);
        gl.uniform1f(gl.getUniformLocation(this.program, 'uTime'), this.params.time);
        gl.uniform1f(gl.getUniformLocation(this.program, 'uRotation'), this.params.rotation);
        gl.uniform1f(gl.getUniformLocation(this.program, 'uBlend'), this.params.blend);

        // Face data
        if (this.faceData && this.faceData.length > 0) {
            const face = this.faceData[0];
            gl.uniform2f(gl.getUniformLocation(this.program, 'uFaceCenter'), face.centerX, face.centerY);
            gl.uniform1i(gl.getUniformLocation(this.program, 'uHasFace'), 1);
        } else {
            gl.uniform2f(gl.getUniformLocation(this.program, 'uFaceCenter'), 0.5, 0.5);
            gl.uniform1i(gl.getUniformLocation(this.program, 'uHasFace'), 0);
        }

        // Bind texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.sourceTexture);

        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // Update time
        this.params.time += 0.016 * this.params.speed;
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }
}
