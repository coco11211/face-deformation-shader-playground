# Quick Start Guide

Get Face Deformation Studio running in 5 minutes!

## For Developers

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Webcam
- Windows 10/11 (64-bit)

### Installation Steps

```bash
# 1. Install dependencies
npm install

# 2. Run the app
npm start
```

That's it! The app will launch and request camera access.

### Building Production Version

```bash
# Build Windows installer and portable version
npm run build

# Outputs to: dist/Face-Deformation-Studio-Setup-1.0.0.exe
#             dist/Face-Deformation-Studio-Portable-1.0.0.exe
```

## For End Users

### Using Pre-built Version

1. Download `Face-Deformation-Studio-Setup-1.0.0.exe`
2. Run the installer
3. Launch from Start Menu
4. Allow camera access when prompted
5. Start creating!

### First Time Setup

When you first launch the app:

1. **Camera Permission** - Click "Allow" when prompted
2. **Face Detection** - Wait 2-3 seconds for AI model to load
3. **Choose Effect** - Click any effect button on the right panel
4. **Adjust Settings** - Use sliders to control intensity and radius

## Tips & Tricks

### Best Lighting
- Face a window or light source
- Avoid backlighting
- Even lighting reduces detection errors

### Performance
- Close unnecessary apps
- Update GPU drivers for best performance
- Lower intensity/radius if experiencing lag

### Keyboard Shortcuts
- `Space` - Hide/show control panel
- `1-9` - Quick switch effects
- `↑↓` - Adjust intensity
- `Ctrl+E` - Export screenshot

## Troubleshooting

### Camera not working?
1. Check Windows camera permissions
2. Close other apps using the camera (Zoom, Teams, etc.)
3. Restart the application

### Face not detected?
1. Ensure good lighting
2. Face the camera directly
3. Wait for "Face: Detected" status to turn green

### App won't start?
1. Verify Windows 10/11 (64-bit)
2. Update graphics drivers
3. Check if WebGL is supported in your browser

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore all 10 shader effects
- Experiment with parameter combinations
- Export and share your creations!

## Support

Having issues? Open an issue on GitHub or check the FAQ in README.md

---

**Happy Creating! 🎨✨**
