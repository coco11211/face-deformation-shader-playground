import * as THREE from 'three';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { shaderLibrary, effectPresets } from './shaders.js';

class FaceDeformationApp {
  constructor() {
    this.camera = null;
    this.scene = null;
    this.renderer = null;
    this.videoElement = null;
    this.videoTexture = null;
    this.material = null;
    this.mesh = null;
    this.detector = null;
    this.animationId = null;
    this.startTime = Date.now();

    // Effect state
    this.currentEffect = 'ripple';
    this.intensity = 1.0;
    this.radius = 0.3;
    this.faceCenter = new THREE.Vector2(0.5, 0.5);
    this.isRunning = false;

    // Stats
    this.fps = 0;
    this.lastFrameTime = Date.now();
    this.frameCount = 0;
  }

  async init() {
    try {
      // Initialize TensorFlow.js
      await tf.ready();
      console.log('TensorFlow.js ready');

      // Initialize Three.js scene
      this.initScene();

      // Initialize video
      await this.initCamera();

      // Initialize face detection
      await this.initFaceDetection();

      // Start rendering
      this.isRunning = true;
      this.animate();

      console.log('App initialized successfully');
    } catch (error) {
      console.error('Initialization error:', error);
      this.showError('Failed to initialize application: ' + error.message);
    }
  }

  initScene() {
    const container = document.getElementById('canvas-container');

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Video element
    this.videoElement = document.createElement('video');
    this.videoElement.setAttribute('playsinline', '');
    this.videoElement.autoplay = true;
    this.videoElement.muted = true;

    // Video texture
    this.videoTexture = new THREE.VideoTexture(this.videoElement);
    this.videoTexture.minFilter = THREE.LinearFilter;
    this.videoTexture.magFilter = THREE.LinearFilter;

    // Create material with shader
    this.createMaterial(this.currentEffect);

    // Create plane mesh
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  createMaterial(effectName) {
    const fragmentShader = shaderLibrary.fragmentShaders[effectName] ||
                          shaderLibrary.fragmentShaders.ripple;

    const uniforms = {
      tDiffuse: { value: this.videoTexture },
      time: { value: 0.0 },
      faceCenter: { value: this.faceCenter },
      intensity: { value: this.intensity },
      radius: { value: this.radius }
    };

    if (this.material) {
      this.material.dispose();
    }

    this.material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: shaderLibrary.vertexShader,
      fragmentShader: fragmentShader
    });

    if (this.mesh) {
      this.mesh.material = this.material;
    }
  }

  async initCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      this.videoElement.srcObject = stream;
      await this.videoElement.play();

      console.log('Camera initialized');
      document.getElementById('status').textContent = 'Camera active';
    } catch (error) {
      console.error('Camera error:', error);
      throw new Error('Could not access camera. Please grant camera permissions.');
    }
  }

  async initFaceDetection() {
    try {
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig = {
        runtime: 'tfjs',
        refineLandmarks: true,
        maxFaces: 1
      };

      this.detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
      console.log('Face detection initialized');
    } catch (error) {
      console.error('Face detection error:', error);
      // Continue without face detection
      this.detector = null;
    }
  }

  async detectFace() {
    if (!this.detector || !this.videoElement) return;

    try {
      const faces = await this.detector.estimateFaces(this.videoElement, {
        flipHorizontal: false
      });

      if (faces.length > 0) {
        const face = faces[0];
        const box = face.box;

        // Calculate face center in normalized coordinates
        const centerX = (box.xMin + box.width / 2) / this.videoElement.videoWidth;
        const centerY = (box.yMin + box.height / 2) / this.videoElement.videoHeight;

        this.faceCenter.set(centerX, 1.0 - centerY); // Flip Y for texture coordinates

        document.getElementById('face-detected').textContent = 'Face: Detected';
        document.getElementById('face-detected').style.color = '#00ff00';
      } else {
        document.getElementById('face-detected').textContent = 'Face: Not Detected';
        document.getElementById('face-detected').style.color = '#ff6b6b';
      }
    } catch (error) {
      console.error('Face detection error:', error);
    }
  }

  animate() {
    if (!this.isRunning) return;

    this.animationId = requestAnimationFrame(() => this.animate());

    // Update time uniform
    const elapsed = (Date.now() - this.startTime) * 0.001;
    if (this.material && this.material.uniforms.time) {
      this.material.uniforms.time.value = elapsed;
    }

    // Update face center uniform
    if (this.material && this.material.uniforms.faceCenter) {
      this.material.uniforms.faceCenter.value = this.faceCenter;
    }

    // Detect face (throttle to ~10fps for performance)
    if (this.frameCount % 6 === 0) {
      this.detectFace();
    }

    // Render
    this.renderer.render(this.scene, this.camera);

    // Update FPS
    this.updateFPS();
    this.frameCount++;
  }

  updateFPS() {
    const now = Date.now();
    const delta = now - this.lastFrameTime;

    if (delta >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / delta);
      document.getElementById('fps').textContent = `FPS: ${this.fps}`;
      this.frameCount = 0;
      this.lastFrameTime = now;
    }
  }

  changeEffect(effectName) {
    if (!effectPresets[effectName]) return;

    this.currentEffect = effectName;
    const preset = effectPresets[effectName];

    this.intensity = preset.intensity;
    this.radius = preset.radius;

    this.createMaterial(effectName);

    // Update UI
    document.getElementById('intensity').value = this.intensity * 100;
    document.getElementById('radius').value = this.radius * 100;
    document.getElementById('intensity-value').textContent = Math.round(this.intensity * 100);
    document.getElementById('radius-value').textContent = Math.round(this.radius * 100);
    document.getElementById('current-effect').textContent = preset.name;
  }

  updateIntensity(value) {
    this.intensity = value / 100;
    if (this.material && this.material.uniforms.intensity) {
      this.material.uniforms.intensity.value = this.intensity;
    }
    document.getElementById('intensity-value').textContent = Math.round(value);
  }

  updateRadius(value) {
    this.radius = value / 100;
    if (this.material && this.material.uniforms.radius) {
      this.material.uniforms.radius.value = this.radius;
    }
    document.getElementById('radius-value').textContent = Math.round(value);
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderer.setSize(width, height);
  }

  exportFrame() {
    const canvas = this.renderer.domElement;
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `face-deformation-${timestamp}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    this.showNotification('Frame exported successfully!');
  }

  toggleCamera(enable) {
    if (enable && !this.isRunning) {
      this.initCamera().then(() => {
        this.isRunning = true;
        this.animate();
      });
    } else if (!enable && this.isRunning) {
      this.isRunning = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      if (this.videoElement.srcObject) {
        this.videoElement.srcObject.getTracks().forEach(track => track.stop());
      }
    }
  }

  resetEffects() {
    this.changeEffect('ripple');
    this.showNotification('Effects reset');
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }

  dispose() {
    this.isRunning = false;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.videoElement && this.videoElement.srcObject) {
      this.videoElement.srcObject.getTracks().forEach(track => track.stop());
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    if (this.material) {
      this.material.dispose();
    }
  }
}

// Export for use in main HTML
window.FaceDeformationApp = FaceDeformationApp;
