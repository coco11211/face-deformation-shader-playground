// Face Detection using MediaPipe Face Mesh
class FaceDetector {
    constructor() {
        this.faceMesh = null;
        this.isInitialized = false;
        this.detectedFaces = [];
        this.showMesh = false;
        this.enabled = true;
        this.onResults = null;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            this.faceMesh = new FaceMesh({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`;
                }
            });

            this.faceMesh.setOptions({
                maxNumFaces: 5,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.faceMesh.onResults((results) => this.handleResults(results));

            this.isInitialized = true;
            console.log('Face detection initialized');
        } catch (error) {
            console.error('Failed to initialize face detection:', error);
        }
    }

    handleResults(results) {
        this.detectedFaces = [];

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            results.multiFaceLandmarks.forEach((landmarks) => {
                const faceData = this.extractFaceData(landmarks);
                this.detectedFaces.push(faceData);
            });
        }

        if (this.onResults) {
            this.onResults(this.detectedFaces, results);
        }
    }

    extractFaceData(landmarks) {
        // Calculate face center from key landmarks
        // Index 1 is nose tip, good center point
        const noseTip = landmarks[1];

        // Calculate bounding box
        let minX = 1, maxX = 0, minY = 1, maxY = 0;

        landmarks.forEach(point => {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        });

        const width = maxX - minX;
        const height = maxY - minY;
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        // Key facial landmarks
        const leftEye = this.getAverageLandmark(landmarks, [33, 133, 157, 158, 159, 160, 161, 246]);
        const rightEye = this.getAverageLandmark(landmarks, [362, 263, 387, 386, 385, 384, 398, 466]);
        const mouth = this.getAverageLandmark(landmarks, [61, 291, 0, 17, 269, 405]);

        return {
            centerX,
            centerY,
            width,
            height,
            minX,
            maxX,
            minY,
            maxY,
            landmarks,
            leftEye,
            rightEye,
            mouth,
            noseTip
        };
    }

    getAverageLandmark(landmarks, indices) {
        let x = 0, y = 0, z = 0;
        indices.forEach(idx => {
            x += landmarks[idx].x;
            y += landmarks[idx].y;
            z += landmarks[idx].z;
        });
        const count = indices.length;
        return { x: x / count, y: y / count, z: z / count };
    }

    async detect(imageSource) {
        if (!this.enabled || !this.isInitialized) {
            if (this.onResults) {
                this.onResults([], null);
            }
            return;
        }

        try {
            await this.faceMesh.send({ image: imageSource });
        } catch (error) {
            console.error('Face detection error:', error);
            if (this.onResults) {
                this.onResults([], null);
            }
        }
    }

    drawMesh(ctx, faces, canvasWidth, canvasHeight) {
        if (!this.showMesh || !faces || faces.length === 0) return;

        ctx.save();

        faces.forEach(face => {
            // Draw face bounding box
            ctx.strokeStyle = 'rgba(0, 245, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                face.minX * canvasWidth,
                face.minY * canvasHeight,
                face.width * canvasWidth,
                face.height * canvasHeight
            );

            // Draw landmarks
            if (face.landmarks) {
                ctx.fillStyle = 'rgba(0, 245, 255, 0.6)';
                face.landmarks.forEach(point => {
                    ctx.beginPath();
                    ctx.arc(
                        point.x * canvasWidth,
                        point.y * canvasHeight,
                        1,
                        0,
                        2 * Math.PI
                    );
                    ctx.fill();
                });
            }

            // Draw center point
            ctx.fillStyle = 'rgba(255, 0, 255, 1)';
            ctx.beginPath();
            ctx.arc(
                face.centerX * canvasWidth,
                face.centerY * canvasHeight,
                5,
                0,
                2 * Math.PI
            );
            ctx.fill();

            // Draw key features
            const features = [
                { point: face.leftEye, color: 'rgba(0, 255, 0, 0.8)' },
                { point: face.rightEye, color: 'rgba(0, 255, 0, 0.8)' },
                { point: face.mouth, color: 'rgba(255, 255, 0, 0.8)' }
            ];

            features.forEach(feature => {
                if (feature.point) {
                    ctx.fillStyle = feature.color;
                    ctx.beginPath();
                    ctx.arc(
                        feature.point.x * canvasWidth,
                        feature.point.y * canvasHeight,
                        3,
                        0,
                        2 * Math.PI
                    );
                    ctx.fill();
                }
            });
        });

        ctx.restore();
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    setShowMesh(show) {
        this.showMesh = show;
    }

    getFaces() {
        return this.detectedFaces;
    }
}
