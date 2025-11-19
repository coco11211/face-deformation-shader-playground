# Face Deformation Studio

A production-ready Windows 11 application for real-time face deformation effects using WebGL shaders and AI-powered face tracking.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-Windows%2011-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### 🎨 10 Unique Shader Effects

1. **Ripple Wave** - Dynamic wave distortion emanating from face center
2. **Bulge/Pinch** - Spherical deformation effect
3. **Swirl** - Rotating spiral distortion
4. **Pixelate** - Retro pixel art effect
5. **Kaleidoscope** - Mesmerizing mirror patterns
6. **Wave Distortion** - Sinusoidal displacement
7. **Mirror** - Symmetrical reflection effects
8. **Chromatic Aberration** - RGB channel separation
9. **Thermal Vision** - Heat map color grading
10. **Glitch** - Digital corruption aesthetic

### 🤖 AI-Powered Features

- **Real-time Face Detection** - Powered by TensorFlow.js and MediaPipe
- **Automatic Face Tracking** - Effects follow detected faces
- **High Performance** - Optimized for 60+ FPS on modern hardware

### 🎮 User Interface

- **Windows 11 Design Language** - Modern glass morphism UI
- **Intuitive Controls** - Sliders for intensity and radius
- **Keyboard Shortcuts** - Full keyboard navigation support
- **Responsive Layout** - Adapts to different screen sizes

### 📸 Export & Save

- Export current frame as PNG
- High-quality output matching display resolution
- Timestamped filenames for easy organization

## System Requirements

### Minimum Requirements

- **OS**: Windows 10 (64-bit) or Windows 11
- **Processor**: Intel Core i5 or AMD Ryzen 5
- **RAM**: 4 GB
- **Graphics**: DirectX 11 compatible GPU with WebGL 2.0 support
- **Webcam**: Any USB or integrated camera

### Recommended Requirements

- **OS**: Windows 11 (64-bit)
- **Processor**: Intel Core i7 or AMD Ryzen 7
- **RAM**: 8 GB or more
- **Graphics**: Dedicated GPU (NVIDIA GTX 1060 / AMD RX 580 or better)
- **Webcam**: 720p or 1080p camera

## Installation

### Option 1: Download Pre-built Installer

1. Download the latest installer from the releases page
2. Run `Face-Deformation-Studio-Setup-1.0.0.exe`
3. Follow the installation wizard
4. Launch from Start Menu or Desktop shortcut

### Option 2: Portable Version

1. Download `Face-Deformation-Studio-Portable-1.0.0.exe`
2. Run the executable directly - no installation required
3. All settings are stored in the same folder

### Option 3: Build from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/face-deformation-shader-playground.git
cd face-deformation-shader-playground

# Install dependencies
npm install

# Run in development mode
npm start

# Build for production
npm run build
```

## Usage Guide

### Getting Started

1. **Launch the Application** - Open Face Deformation Studio
2. **Grant Camera Permission** - Allow access to your webcam when prompted
3. **Select an Effect** - Click any effect button in the control panel
4. **Adjust Parameters** - Use sliders to control intensity and radius
5. **Export Your Work** - Click "Export Frame" to save screenshots

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Toggle control panel visibility |
| `1-9` | Quick select effects 1-9 |
| `↑` / `↓` | Increase/decrease intensity |
| `←` / `→` | Decrease/increase radius |
| `Ctrl+E` | Export current frame |
| `Ctrl+R` | Reset effects to default |
| `Ctrl+Shift+C` | Start camera |
| `Ctrl+Shift+I` | Open developer tools |
| `F11` | Toggle fullscreen |

### Menu Commands

#### File Menu
- **Export Frame** (Ctrl+E) - Save current view as PNG
- **Exit** (Alt+F4) - Close application

#### Camera Menu
- **Start Camera** (Ctrl+Shift+C) - Initialize webcam
- **Stop Camera** - Disable webcam feed

#### Effects Menu
- **Reset Effects** (Ctrl+R) - Return to default settings

#### View Menu
- **Toggle Fullscreen** (F11) - Maximize view area
- **Toggle Developer Tools** (Ctrl+Shift+I) - Debug console

## Technical Details

### Technologies Used

- **Electron** - Cross-platform desktop framework
- **Three.js** - WebGL 3D graphics library
- **TensorFlow.js** - Machine learning in JavaScript
- **MediaPipe Face Mesh** - Face landmark detection
- **GLSL** - OpenGL Shading Language for effects

### Architecture

```
face-deformation-studio/
├── src/
│   ├── main.js          # Electron main process
│   ├── preload.js       # IPC bridge
│   ├── index.html       # Main window HTML
│   ├── styles.css       # Windows 11 UI styles
│   ├── app.js           # Core application logic
│   ├── ui.js            # UI controller
│   └── shaders.js       # Shader library
├── assets/
│   └── icons/           # Application icons
├── package.json         # Dependencies & scripts
└── electron-builder.yml # Build configuration
```

### Performance Optimization

- **GPU Acceleration** - All effects run on GPU via WebGL
- **Efficient Face Detection** - Throttled to 10 FPS for optimal balance
- **Texture Optimization** - Automatic resolution scaling
- **Memory Management** - Proper resource cleanup and disposal

## Development

### Project Structure

```javascript
// Main application class
class FaceDeformationApp {
  init()              // Initialize all systems
  initScene()         // Setup Three.js renderer
  initCamera()        // Access user's webcam
  initFaceDetection() // Load TensorFlow model
  animate()           // Render loop
  changeEffect()      // Switch shader effects
  exportFrame()       // Save screenshot
}
```

### Adding New Effects

1. Define shader in `src/shaders.js`:

```javascript
fragmentShaders: {
  myEffect: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform vec2 faceCenter;
    uniform float intensity;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      // Your shader code here
      gl_FragColor = texture2D(tDiffuse, uv);
    }
  `
}
```

2. Add preset configuration:

```javascript
effectPresets: {
  myEffect: { name: 'My Effect', intensity: 1.0, radius: 0.3 }
}
```

3. Add UI button in `src/index.html`:

```html
<button class="effect-btn" data-effect="myEffect">
  <span class="effect-icon">✨</span>
  <span class="effect-name">My Effect</span>
</button>
```

### Building for Distribution

```bash
# Build installer + portable version
npm run build

# Build installer only
npm run build:dir

# Test build without packaging
npm run pack
```

Output files will be in the `dist/` directory.

## Troubleshooting

### Camera Not Working

- **Check Permissions**: Ensure camera access is allowed in Windows Settings
- **Close Other Apps**: Make sure no other application is using the camera
- **Update Drivers**: Install latest webcam drivers from manufacturer

### Low Performance

- **Close Background Apps**: Free up system resources
- **Lower Resolution**: Some effects are GPU-intensive
- **Update Graphics Drivers**: Ensure DirectX and GPU drivers are current
- **Disable Hardware Acceleration**: Try toggling in browser settings

### Face Detection Not Working

- **Lighting**: Ensure adequate lighting on your face
- **Camera Position**: Face the camera directly
- **Distance**: Stay within 2-3 feet of the camera
- **Wait for Load**: Face detection takes a few seconds to initialize

### Black Screen

- **WebGL Support**: Check if your GPU supports WebGL 2.0
- **Browser Compatibility**: Update to latest Windows version
- **GPU Drivers**: Update graphics card drivers

## FAQ

**Q: Does this work on Mac or Linux?**
A: Currently optimized for Windows 11, but Electron supports cross-platform builds.

**Q: Can I use this without a camera?**
A: The app requires a camera for face tracking. Static image support may be added in future versions.

**Q: Is my camera data sent anywhere?**
A: No! All processing happens locally on your device. No data is transmitted.

**Q: Can I record video?**
A: Currently only frame export is supported. Video recording may be added in future updates.

**Q: What's the performance impact?**
A: Modern systems should achieve 60+ FPS with minimal CPU/GPU load.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

```bash
git clone https://github.com/yourusername/face-deformation-shader-playground.git
cd face-deformation-shader-playground
npm install
npm start
```

### Code Style

- Use ES6+ JavaScript features
- Follow Airbnb style guide
- Comment complex shader code
- Test on Windows 11 before submitting

## Credits

- **Three.js** - 3D graphics library
- **TensorFlow.js** - Machine learning framework
- **MediaPipe** - Face detection model
- **Electron** - Desktop application framework

## Support

For bug reports and feature requests, please open an issue on GitHub.

## Roadmap

- [ ] Video recording support
- [ ] Custom shader editor
- [ ] Effect presets and favorites
- [ ] Multi-face support
- [ ] Virtual camera output
- [ ] Plugin system for community effects
- [ ] Performance profiling tools
- [ ] Cloud sync for settings

---

**Made with ❤️ for Windows 11**

*Face Deformation Studio - Transform reality with WebGL shaders*
