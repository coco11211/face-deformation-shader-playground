// Main Application Logic
class FaceDeformationApp {
    constructor() {
        // Core components
        this.shaderEngine = null;
        this.faceDetector = null;

        // DOM elements
        this.canvas = document.getElementById('renderCanvas');
        this.canvasContainer = document.getElementById('canvasContainer');
        this.dropZone = document.getElementById('dropZone');

        // Media sources
        this.sourceImage = null;
        this.sourceVideo = document.getElementById('sourceVideo');
        this.webcamVideo = document.getElementById('webcamVideo');
        this.currentSource = null;
        this.sourceType = null; // 'image', 'video', 'webcam'

        // State
        this.isPlaying = false;
        this.isRecording = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.animationFrameId = null;

        // Performance tracking
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 0;

        // History for undo/redo
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;

        // Presets
        this.presets = this.loadPresetsFromStorage();

        this.init();
    }

    async init() {
        // Initialize shader engine
        this.shaderEngine = new ShaderEngine(this.canvas);

        // Initialize face detector
        this.faceDetector = new FaceDetector();
        await this.faceDetector.initialize();

        this.faceDetector.onResults = (faces, results) => {
            this.shaderEngine.setFaceData(faces);
        };

        // Set up event listeners
        this.setupEventListeners();

        // Start render loop
        this.startRenderLoop();

        console.log('Face Deformation App initialized');
    }

    setupEventListeners() {
        const { ipcRenderer } = require('electron');

        // File upload buttons
        document.getElementById('uploadImageBtn').addEventListener('click', () => {
            document.getElementById('imageFileInput').click();
        });

        document.getElementById('uploadVideoBtn').addEventListener('click', () => {
            document.getElementById('videoFileInput').click();
        });

        document.getElementById('webcamBtn').addEventListener('click', () => {
            this.startWebcam();
        });

        // File inputs
        document.getElementById('imageFileInput').addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.loadImage(e.target.files[0]);
            }
        });

        document.getElementById('videoFileInput').addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.loadVideo(e.target.files[0]);
            }
        });

        // Drag and drop
        this.canvasContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('dragging');
        });

        this.canvasContainer.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('dragging');
        });

        this.canvasContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('dragging');

            const file = e.dataTransfer.files[0];
            if (file) {
                if (file.type.startsWith('image/')) {
                    this.loadImage(file);
                } else if (file.type.startsWith('video/')) {
                    this.loadVideo(file);
                }
            }
        });

        // Effect type selector
        document.getElementById('effectType').addEventListener('change', (e) => {
            this.shaderEngine.setEffect(e.target.value);
            this.saveToHistory();
        });

        // Parameter sliders
        this.setupSlider('intensity', (value) => {
            this.shaderEngine.setParams({ intensity: value / 100 });
        });

        this.setupSlider('radius', (value) => {
            this.shaderEngine.setParams({ radius: value });
        });

        this.setupSlider('speed', (value) => {
            this.shaderEngine.setParams({ speed: value / 100 });
        });

        this.setupSlider('rotation', (value) => {
            this.shaderEngine.setParams({ rotation: value });
        });

        this.setupSlider('blend', (value) => {
            this.shaderEngine.setParams({ blend: value / 100 });
        });

        // Face detection toggles
        document.getElementById('faceDetectionToggle').addEventListener('change', (e) => {
            this.faceDetector.setEnabled(e.target.checked);
        });

        document.getElementById('showMeshToggle').addEventListener('change', (e) => {
            this.faceDetector.setShowMesh(e.target.checked);
        });

        // Toolbar buttons
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetParameters();
        });

        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undo();
        });

        document.getElementById('redoBtn').addEventListener('click', () => {
            this.redo();
        });

        document.getElementById('playPauseBtn').addEventListener('click', () => {
            this.togglePlayPause();
        });

        // Export buttons
        document.getElementById('exportImageBtn').addEventListener('click', () => {
            this.exportImage();
        });

        document.getElementById('exportVideoBtn').addEventListener('click', () => {
            this.toggleRecording();
        });

        // Preset buttons
        document.getElementById('savePresetBtn').addEventListener('click', () => {
            this.savePreset();
        });

        document.getElementById('presetSelect').addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadPreset(e.target.value);
            }
        });

        // Help button
        document.getElementById('helpBtn').addEventListener('click', () => {
            this.showHelp();
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Initialize preset dropdown
        this.updatePresetDropdown();
    }

    setupSlider(id, callback) {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(id + 'Value');

        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            callback(value);

            // Update display
            let displayValue;
            switch (id) {
                case 'intensity':
                case 'blend':
                    displayValue = `${Math.round(value)}%`;
                    break;
                case 'radius':
                    displayValue = `${Math.round(value)}px`;
                    break;
                case 'speed':
                    displayValue = `${(value / 100).toFixed(1)}x`;
                    break;
                case 'rotation':
                    displayValue = `${Math.round(value)}°`;
                    break;
                default:
                    displayValue = value;
            }
            valueDisplay.textContent = displayValue;
        });

        slider.addEventListener('change', () => {
            this.saveToHistory();
        });
    }

    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.sourceImage = img;
                this.currentSource = img;
                this.sourceType = 'image';

                this.stopWebcam();
                this.stopVideo();

                this.dropZone.classList.add('hidden');
                this.updateCanvasSize(img.width, img.height);
                this.shaderEngine.loadTexture(img);
                this.updateResolution(img.width, img.height);
                this.saveToHistory();

                // Detect faces in the image
                this.faceDetector.detect(img);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    loadVideo(file) {
        const url = URL.createObjectURL(file);
        this.sourceVideo.src = url;

        this.sourceVideo.onloadedmetadata = () => {
            this.currentSource = this.sourceVideo;
            this.sourceType = 'video';

            this.stopWebcam();
            this.sourceVideo.style.display = 'none';

            this.dropZone.classList.add('hidden');
            this.updateCanvasSize(this.sourceVideo.videoWidth, this.sourceVideo.videoHeight);
            this.updateResolution(this.sourceVideo.videoWidth, this.sourceVideo.videoHeight);

            this.isPlaying = true;
            this.sourceVideo.play();
            this.updatePlayPauseButton();
            this.saveToHistory();
        };
    }

    async startWebcam() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 }
            });

            this.webcamVideo.srcObject = stream;
            this.currentSource = this.webcamVideo;
            this.sourceType = 'webcam';

            this.stopVideo();
            this.webcamVideo.style.display = 'none';

            this.webcamVideo.onloadedmetadata = () => {
                this.dropZone.classList.add('hidden');
                this.updateCanvasSize(this.webcamVideo.videoWidth, this.webcamVideo.videoHeight);
                this.updateResolution(this.webcamVideo.videoWidth, this.webcamVideo.videoHeight);
                this.isPlaying = true;
                this.updatePlayPauseButton();
            };
        } catch (error) {
            console.error('Failed to access webcam:', error);
            alert('Failed to access webcam. Please check your permissions.');
        }
    }

    stopWebcam() {
        if (this.webcamVideo.srcObject) {
            this.webcamVideo.srcObject.getTracks().forEach(track => track.stop());
            this.webcamVideo.srcObject = null;
        }
    }

    stopVideo() {
        if (this.sourceVideo.src) {
            this.sourceVideo.pause();
            this.sourceVideo.src = '';
        }
    }

    updateCanvasSize(width, height) {
        const containerWidth = this.canvasContainer.clientWidth;
        const containerHeight = this.canvasContainer.clientHeight;

        const scale = Math.min(
            containerWidth / width,
            containerHeight / height,
            1
        );

        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = `${width * scale}px`;
        this.canvas.style.height = `${height * scale}px`;

        this.shaderEngine.resize(width, height);
    }

    handleResize() {
        if (this.currentSource) {
            const width = this.currentSource.width || this.currentSource.videoWidth;
            const height = this.currentSource.height || this.currentSource.videoHeight;
            this.updateCanvasSize(width, height);
        }
    }

    startRenderLoop() {
        const render = (timestamp) => {
            // Calculate FPS
            if (timestamp - this.lastFrameTime >= 1000) {
                this.fps = this.frameCount;
                this.frameCount = 0;
                this.lastFrameTime = timestamp;
                document.getElementById('fpsCounter').textContent = `${this.fps} FPS`;
            }
            this.frameCount++;

            // Render frame
            if (this.currentSource && (this.isPlaying || this.sourceType === 'image')) {
                const source = this.currentSource;

                // Update texture
                this.shaderEngine.loadTexture(source);

                // Detect faces
                if (this.sourceType !== 'image' || this.faceDetector.getFaces().length === 0) {
                    this.faceDetector.detect(source);
                }

                // Render with shader
                this.shaderEngine.render();

                // Draw face mesh overlay if enabled
                if (this.faceDetector.showMesh) {
                    const ctx = this.canvas.getContext('2d', { willReadFrequently: false });
                    this.faceDetector.drawMesh(
                        ctx,
                        this.faceDetector.getFaces(),
                        this.canvas.width,
                        this.canvas.height
                    );
                }

                // Update processing time
                const processingTime = performance.now() - timestamp;
                document.getElementById('processingTime').textContent = `${processingTime.toFixed(1)} ms`;

                // Update faces count
                document.getElementById('facesCount').textContent = this.faceDetector.getFaces().length;
            }

            this.animationFrameId = requestAnimationFrame(render);
        };

        this.animationFrameId = requestAnimationFrame(render);
    }

    togglePlayPause() {
        if (this.sourceType === 'video') {
            if (this.isPlaying) {
                this.sourceVideo.pause();
                this.isPlaying = false;
            } else {
                this.sourceVideo.play();
                this.isPlaying = true;
            }
            this.updatePlayPauseButton();
        }
    }

    updatePlayPauseButton() {
        const playIcon = document.getElementById('playIcon');
        const pauseIcon = document.getElementById('pauseIcon');

        if (this.isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }

    resetParameters() {
        document.getElementById('intensity').value = 50;
        document.getElementById('radius').value = 150;
        document.getElementById('speed').value = 100;
        document.getElementById('rotation').value = 0;
        document.getElementById('blend').value = 100;

        this.shaderEngine.setParams({
            intensity: 0.5,
            radius: 150,
            speed: 1.0,
            rotation: 0,
            blend: 1.0
        });

        // Update displays
        document.getElementById('intensityValue').textContent = '50%';
        document.getElementById('radiusValue').textContent = '150px';
        document.getElementById('speedValue').textContent = '1.0x';
        document.getElementById('rotationValue').textContent = '0°';
        document.getElementById('blendValue').textContent = '100%';

        this.saveToHistory();
    }

    saveToHistory() {
        const state = {
            effect: document.getElementById('effectType').value,
            params: { ...this.shaderEngine.params }
        };

        // Remove future history if we're not at the end
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        this.history.push(state);

        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState(this.history[this.historyIndex]);
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState(this.history[this.historyIndex]);
        }
    }

    restoreState(state) {
        document.getElementById('effectType').value = state.effect;
        this.shaderEngine.setEffect(state.effect);
        this.shaderEngine.setParams(state.params);

        // Update UI
        document.getElementById('intensity').value = state.params.intensity * 100;
        document.getElementById('radius').value = state.params.radius;
        document.getElementById('speed').value = state.params.speed * 100;
        document.getElementById('rotation').value = state.params.rotation;
        document.getElementById('blend').value = state.params.blend * 100;

        // Trigger input events to update displays
        document.getElementById('intensity').dispatchEvent(new Event('input'));
        document.getElementById('radius').dispatchEvent(new Event('input'));
        document.getElementById('speed').dispatchEvent(new Event('input'));
        document.getElementById('rotation').dispatchEvent(new Event('input'));
        document.getElementById('blend').dispatchEvent(new Event('input'));
    }

    async exportImage() {
        const { ipcRenderer } = require('electron');

        const result = await ipcRenderer.invoke('save-file-dialog', {
            title: 'Export Image',
            defaultPath: `face-deformation-${Date.now()}.png`,
            filters: [
                { name: 'PNG Image', extensions: ['png'] },
                { name: 'JPEG Image', extensions: ['jpg', 'jpeg'] }
            ]
        });

        if (!result.canceled && result.filePath) {
            this.canvas.toBlob((blob) => {
                const reader = new FileReader();
                reader.onload = async () => {
                    const buffer = Buffer.from(reader.result);
                    const saveResult = await ipcRenderer.invoke('save-file', result.filePath, buffer);

                    if (saveResult.success) {
                        alert('Image exported successfully!');
                    } else {
                        alert('Failed to export image: ' + saveResult.error);
                    }
                };
                reader.readAsArrayBuffer(blob);
            });
        }
    }

    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    startRecording() {
        const stream = this.canvas.captureStream(30);
        this.mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: 5000000
        });

        this.recordedChunks = [];

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.recordedChunks.push(event.data);
            }
        };

        this.mediaRecorder.onstop = () => {
            this.saveRecording();
        };

        this.mediaRecorder.start();
        this.isRecording = true;

        const btn = document.getElementById('exportVideoBtn');
        btn.textContent = 'Stop Recording';
        btn.classList.add('pulse');
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;

            const btn = document.getElementById('exportVideoBtn');
            btn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="6" fill="currentColor"/>
                </svg>
                Record Video
            `;
            btn.classList.remove('pulse');
        }
    }

    async saveRecording() {
        const { ipcRenderer } = require('electron');

        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });

        const result = await ipcRenderer.invoke('save-file-dialog', {
            title: 'Save Recording',
            defaultPath: `face-deformation-${Date.now()}.webm`,
            filters: [
                { name: 'WebM Video', extensions: ['webm'] }
            ]
        });

        if (!result.canceled && result.filePath) {
            const reader = new FileReader();
            reader.onload = async () => {
                const buffer = Buffer.from(reader.result);
                const saveResult = await ipcRenderer.invoke('save-file', result.filePath, buffer);

                if (saveResult.success) {
                    alert('Video saved successfully!');
                } else {
                    alert('Failed to save video: ' + saveResult.error);
                }
            };
            reader.readAsArrayBuffer(blob);
        }
    }

    savePreset() {
        const name = prompt('Enter preset name:');
        if (name) {
            const preset = {
                name,
                effect: document.getElementById('effectType').value,
                params: { ...this.shaderEngine.params }
            };

            this.presets[name] = preset;
            this.savePresetsToStorage();
            this.updatePresetDropdown();
            alert('Preset saved!');
        }
    }

    loadPreset(name) {
        const preset = this.presets[name];
        if (preset) {
            document.getElementById('effectType').value = preset.effect;
            this.shaderEngine.setEffect(preset.effect);

            document.getElementById('intensity').value = preset.params.intensity * 100;
            document.getElementById('radius').value = preset.params.radius;
            document.getElementById('speed').value = preset.params.speed * 100;
            document.getElementById('rotation').value = preset.params.rotation;
            document.getElementById('blend').value = preset.params.blend * 100;

            // Trigger input events
            document.getElementById('intensity').dispatchEvent(new Event('input'));
            document.getElementById('radius').dispatchEvent(new Event('input'));
            document.getElementById('speed').dispatchEvent(new Event('input'));
            document.getElementById('rotation').dispatchEvent(new Event('input'));
            document.getElementById('blend').dispatchEvent(new Event('input'));

            this.saveToHistory();
        }
    }

    savePresetsToStorage() {
        localStorage.setItem('faceDeformationPresets', JSON.stringify(this.presets));
    }

    loadPresetsFromStorage() {
        const stored = localStorage.getItem('faceDeformationPresets');
        return stored ? JSON.parse(stored) : {};
    }

    updatePresetDropdown() {
        const select = document.getElementById('presetSelect');
        select.innerHTML = '<option value="">Load Preset...</option>';

        Object.keys(this.presets).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        });
    }

    updateResolution(width, height) {
        document.getElementById('resolution').textContent = `${width} × ${height}`;
    }

    showHelp() {
        const helpText = `
Face Deformation Playground - Quick Guide

LOADING MEDIA:
• Click "Upload Image/Video" or drag & drop files
• Click "Use Webcam" for live camera feed
• Supported: JPG, PNG, GIF, WebP, MP4, WebM

EFFECTS:
• Choose from 12 unique shader effects
• Adjust parameters with sliders in real-time
• Effects automatically target detected faces

CONTROLS:
• Intensity: Effect strength
• Radius: Effect area size
• Speed: Animation speed (for animated effects)
• Rotation: Effect rotation angle
• Blend: Mix original with effect

FACE DETECTION:
• Automatically detects up to 5 faces
• Toggle "Show Mesh" to visualize landmarks
• Disable detection to use manual center point

PRESETS:
• Save your favorite settings
• Load presets from dropdown menu

EXPORT:
• "Export Image": Save current frame as PNG/JPG
• "Record Video": Capture animated effects

KEYBOARD SHORTCUTS:
• Ctrl+Z: Undo
• Ctrl+Y: Redo
• Space: Play/Pause video

Enjoy creating amazing face deformations!
        `.trim();

        alert(helpText);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FaceDeformationApp();
});
