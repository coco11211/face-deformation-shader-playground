# 🚀 Quick Start Guide

Get your Face Deformation Playground running in 3 simple steps!

## For Windows 11 Users

### Step 1: Install Node.js (5 minutes)

1. Visit [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS version** (recommended)
3. Run the installer
4. Accept all defaults and complete installation
5. Verify installation:
   - Open Command Prompt (Win + R, type `cmd`)
   - Type: `node --version`
   - You should see something like `v18.x.x`

### Step 2: Install Dependencies (3-5 minutes)

1. Open Command Prompt or PowerShell
2. Navigate to this project folder:
   ```bash
   cd path\to\face-deformation-shader-playground
   ```
3. Install required packages:
   ```bash
   npm install
   ```
   This will download all necessary dependencies. Grab a coffee! ☕

### Step 3: Launch the App (30 seconds)

Simply run:
```bash
npm start
```

The application will launch automatically! 🎉

## First-Time Usage

Once the app opens:

1. **Load an image**: Click "Upload Image" and choose a photo with a face
2. **Try an effect**: Select "Bulge" from the Effect Type dropdown
3. **Adjust intensity**: Move the Intensity slider to see the effect
4. **Experiment**: Try different effects and parameters!

### Quick Tips

- **Best results**: Use well-lit photos with faces looking at the camera
- **Live preview**: Use webcam for real-time effects
- **Save your work**: Use "Export Image" to save your creations
- **Save settings**: Use "Save Preset" to store your favorite configurations

## Building a Windows Installer (Optional)

Want a standalone `.exe` you can share or install?

```bash
npm run build
```

The installer will be created in the `dist` folder. Double-click to install!

## Troubleshooting

### "npm is not recognized"
- Node.js isn't installed correctly
- Restart your terminal/computer after installing Node.js
- Reinstall Node.js with "Add to PATH" option checked

### "Cannot find module..."
- Run `npm install` again
- Delete `node_modules` folder and run `npm install`

### App window is blank
- Check your internet connection (needed to download MediaPipe on first run)
- Try disabling antivirus temporarily
- Check console for errors (Ctrl+Shift+I)

### Low performance
- Use smaller image files
- Reduce effect radius in settings
- Update your graphics drivers

## Need More Help?

- Check the full [README.md](README.md) for detailed documentation
- Look at the in-app Help button for quick reference
- Ensure your system meets the requirements (4GB RAM, WebGL support)

---

**That's it! You're ready to create amazing face deformations!** 🎨✨

Have fun experimenting with all 12 shader effects!
