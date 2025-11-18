# 🎨 Face Deformation Playground

A professional, feature-rich desktop application for real-time face deformation effects using WebGL shaders and AI-powered face detection. Built with Electron, designed with a stunning dark mode interface.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%2011-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### 🎭 12 Professional Shader Effects

- **Bulge** - Expand facial features outward
- **Pinch** - Contract and compress the face
- **Swirl** - Create spiral distortion effects
- **Liquify** - Dynamic liquid-like deformations
- **Fish Eye** - Wide-angle lens distortion
- **Mirror** - Symmetrical mirroring effects
- **Pixelate** - Retro pixelation filter
- **Bloom** - Glowing, dreamy effects
- **Glitch** - Digital corruption aesthetics
- **Ripple** - Water ripple distortions
- **Tunnel** - Psychedelic tunnel vision
- **Kaleidoscope** - Mesmerizing fractal patterns

### 🤖 AI-Powered Face Detection

- Automatic detection of up to 5 faces simultaneously
- 478-point facial landmark tracking via MediaPipe
- Real-time face tracking for dynamic effects
- Visual mesh overlay for debugging
- Manual mode for creative control

### 🎬 Multi-Source Support

- **Images** - JPG, PNG, GIF, WebP
- **Videos** - MP4, WebM with playback controls
- **Webcam** - Live camera feed processing
- Drag & drop file loading
- Seamless source switching

### 🎛️ Professional Controls

- **Intensity** - Effect strength (0-100%)
- **Radius** - Effect area size
- **Speed** - Animation speed control
- **Rotation** - Effect rotation angle
- **Blend** - Mix original with effect
- Real-time parameter updates
- Smooth slider animations

### 💾 Advanced Features

- **Undo/Redo** - 50-step history
- **Presets** - Save and load effect configurations
- **Export** - High-quality image export (PNG/JPG)
- **Recording** - Capture video with effects (WebM)
- **Performance Monitor** - Real-time FPS and processing time
- **Dark Theme** - Figma-level UI/UX design

## 📋 Requirements

### System Requirements

- **Operating System**: Windows 11 (also compatible with Windows 10)
- **RAM**: 4GB minimum, 8GB recommended
- **Graphics**: WebGL-compatible GPU
- **Webcam**: Optional, for live camera features
- **Storage**: 200MB for installation

### Development Requirements

- **Node.js**: v16 or higher
- **npm**: v7 or higher
- **Git**: For cloning the repository

## 🚀 Installation & Setup

### For Windows Users (Running the App)

#### Option 1: Build from Source

1. **Install Node.js**
   - Download from [nodejs.org](https://nodejs.org/)
   - Choose the LTS version for Windows
   - Run the installer and follow the prompts

2. **Clone or Download the Project**
   ```bash
   git clone https://github.com/yourusername/face-deformation-playground.git
   cd face-deformation-playground
   ```

   Or download and extract the ZIP file from GitHub.

3. **Install Dependencies**
   ```bash
   npm install
   ```

   This will download all required packages (may take a few minutes).

4. **Run the Application**
   ```bash
   npm start
   ```

   The app will launch automatically!

#### Option 2: Build a Windows Installer

1. Follow steps 1-3 from Option 1

2. **Build the Windows Application**
   ```bash
   npm run build
   ```

   This creates a Windows installer in the `dist` folder.

3. **Install the App**
   - Navigate to `dist` folder
   - Run the `.exe` installer
   - Follow the installation wizard
   - Launch from Start Menu or Desktop shortcut

### For Developers

```bash
# Clone repository
git clone https://github.com/yourusername/face-deformation-playground.git
cd face-deformation-playground

# Install dependencies
npm install

# Run in development mode
npm start

# Build for production
npm run build

# Build without packaging (faster for testing)
npm run build:dir
```

## 📖 Usage Guide

### Getting Started

1. **Launch the Application**
   - Double-click the app icon or run `npm start`

2. **Load Your Content**
   - Click "Upload Image" or "Upload Video"
   - Or drag & drop a file onto the canvas
   - Or click "Use Webcam" for live feed

3. **Choose an Effect**
   - Select from the "Effect Type" dropdown
   - Try different effects to see what looks best

4. **Adjust Parameters**
   - Use sliders to fine-tune the effect
   - Changes apply in real-time
   - Watch the preview update instantly

5. **Export Your Creation**
   - Click "Export Image" for a single frame
   - Click "Record Video" to capture animation
   - Choose save location and format

### Pro Tips

- **Face Detection**: Keep faces well-lit and facing the camera for best results
- **Multiple Faces**: Effects work on all detected faces simultaneously
- **Performance**: Lower resolution sources run smoother on slower hardware
- **Presets**: Save your favorite settings for quick access later
- **Undo/Redo**: Use toolbar buttons or Ctrl+Z/Ctrl+Y
- **Blend Control**: Use blend slider to mix original with effect

### Keyboard Shortcuts

- **Ctrl + Z** - Undo last change
- **Ctrl + Y** - Redo
- **Space** - Play/Pause video (when video loaded)
- **F11** - Fullscreen (Electron default)

## 🎨 Effect Descriptions

### Bulge
Creates a magnifying glass effect, enlarging facial features. Great for comedic exaggeration.
- **Best Use**: Portrait enhancement, caricatures
- **Tip**: Moderate intensity for subtle beauty effects

### Pinch
Compresses the face toward the center. Creates alien or compressed looks.
- **Best Use**: Artistic portraits, surreal effects
- **Tip**: High intensity for dramatic transformations

### Swirl
Rotates pixels in a spiral pattern around the face.
- **Best Use**: Psychedelic art, dynamic animations
- **Tip**: Combine with rotation parameter for complex spirals

### Liquify
Organic, flowing deformations that animate over time.
- **Best Use**: Dreamy, surreal visuals
- **Tip**: Lower speed for smooth, gentle movements

### Fish Eye
Wide-angle lens distortion effect.
- **Best Use**: Creative portraits, unique perspectives
- **Tip**: Works great with full-face shots

### Mirror
Creates symmetrical reflections across various angles.
- **Best Use**: Artistic symmetry, Rorschach-style images
- **Tip**: Adjust rotation to change mirror axis

### Pixelate
Retro 8-bit style pixelation effect.
- **Best Use**: Censoring, retro aesthetics, privacy
- **Tip**: Lower intensity for subtle mosaic effect

### Bloom
Adds ethereal glow and light diffusion.
- **Best Use**: Beauty shots, magical atmospheres
- **Tip**: Works beautifully with high-key images

### Glitch
Digital corruption and RGB channel separation.
- **Best Use**: Cyberpunk aesthetics, error art
- **Tip**: Looks best with high contrast images

### Ripple
Concentric wave distortions emanating from the face.
- **Best Use**: Water effects, hypnotic animations
- **Tip**: Adjust speed for fast or slow ripples

### Tunnel
Warps the image into a tunnel perspective.
- **Best Use**: Psychedelic visuals, music videos
- **Tip**: Combine with rotation for spinning tunnel

### Kaleidoscope
Fractal-like symmetrical patterns.
- **Best Use**: Abstract art, meditative visuals
- **Tip**: Higher intensity = more segments

## 🛠️ Technical Details

### Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Graphics**: WebGL 2.0 with custom GLSL shaders
- **Desktop**: Electron 27
- **Face Detection**: MediaPipe Face Mesh
- **Video**: WebRTC, MediaRecorder API
- **Build**: electron-builder

### Architecture

```
face-deformation-playground/
├── main.js              # Electron main process
├── index.html           # Main UI structure
├── styles.css           # Dark theme styling
├── app.js              # Application logic
├── shaders.js          # WebGL shader engine
├── face-detection.js   # MediaPipe integration
├── package.json        # Dependencies & scripts
└── assets/             # Icons and resources
```

### Performance

- **60 FPS** target on modern hardware
- **30 FPS** typical on integrated graphics
- Hardware-accelerated WebGL rendering
- Efficient face detection throttling
- Optimized shader compilation

## 🐛 Troubleshooting

### App Won't Start

**Problem**: Application doesn't launch
**Solution**:
- Ensure Node.js is installed: `node --version`
- Reinstall dependencies: `npm install`
- Check for error messages in terminal

### Low FPS / Laggy Performance

**Problem**: Slow or choppy rendering
**Solution**:
- Use lower resolution images/videos
- Reduce effect radius
- Disable "Show Mesh" overlay
- Close other GPU-intensive applications
- Update graphics drivers

### Webcam Not Working

**Problem**: "Failed to access webcam" error
**Solution**:
- Check webcam is connected and working
- Grant browser permissions when prompted
- Close other apps using the webcam
- Restart the application

### Face Detection Not Working

**Problem**: "0 faces detected"
**Solution**:
- Ensure face is well-lit
- Face camera directly
- Avoid extreme angles
- Check "Enable Detection" is toggled on
- Try different lighting conditions

### Export/Recording Issues

**Problem**: Can't save images or videos
**Solution**:
- Check folder write permissions
- Ensure enough disk space
- Try different save location
- For video: Some formats require codecs

### Build Errors

**Problem**: `npm run build` fails
**Solution**:
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 🔒 Privacy & Security

- **No data collection**: All processing happens locally
- **No internet required**: Works offline (after initial setup)
- **No cloud uploads**: Files never leave your computer
- **Webcam privacy**: You control when camera is active
- **Open source**: Audit the code yourself

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new effects
- Improve documentation
- Submit pull requests

## 🙏 Acknowledgments

- **MediaPipe** - Google's face detection framework
- **Electron** - Cross-platform desktop apps
- **WebGL** - Hardware-accelerated graphics
- Shader inspiration from various creative coding communities

## 📞 Support

For issues, questions, or feature requests:

- Open an issue on GitHub
- Check existing issues for solutions
- Read the troubleshooting section above

## 🎯 Roadmap

Future enhancements planned:

- [ ] Additional shader effects (chromatic aberration, displacement maps)
- [ ] Batch processing for multiple files
- [ ] Real-time effect chaining
- [ ] Custom shader editor
- [ ] macOS and Linux builds
- [ ] Plugin system for community effects
- [ ] GPU acceleration optimization
- [ ] Video timeline editing
- [ ] Export to GIF format
- [ ] Social media integration

---

**Made with ❤️ for creative minds**

Enjoy creating stunning face deformations! 🎨✨