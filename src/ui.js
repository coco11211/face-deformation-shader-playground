import { effectPresets } from './shaders.js';

// UI Controller
class UIController {
  constructor(app) {
    this.app = app;
    this.panelVisible = true;
    this.init();
  }

  init() {
    // Effect buttons
    document.querySelectorAll('.effect-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const effectName = e.currentTarget.dataset.effect;
        this.selectEffect(effectName);
      });
    });

    // Parameter sliders
    document.getElementById('intensity').addEventListener('input', (e) => {
      this.app.updateIntensity(parseFloat(e.target.value));
    });

    document.getElementById('radius').addEventListener('input', (e) => {
      this.app.updateRadius(parseFloat(e.target.value));
    });

    // Action buttons
    document.getElementById('export-btn').addEventListener('click', () => {
      this.app.exportFrame();
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
      this.app.resetEffects();
    });

    document.getElementById('toggle-panel-btn').addEventListener('click', () => {
      this.togglePanel();
    });

    // About modal
    document.getElementById('close-about')?.addEventListener('click', () => {
      this.closeAbout();
    });

    // Electron IPC listeners
    if (window.electronAPI) {
      window.electronAPI.onExportFrame(() => {
        this.app.exportFrame();
      });

      window.electronAPI.onToggleCamera((event, enable) => {
        this.app.toggleCamera(enable);
      });

      window.electronAPI.onResetEffects(() => {
        this.app.resetEffects();
      });

      window.electronAPI.onShowAbout(() => {
        this.showAbout();
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Space - Toggle panel
      if (e.code === 'Space' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        this.togglePanel();
      }

      // Number keys - Select effects
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        const effects = Object.keys(effectPresets);
        if (effects[num - 1]) {
          this.selectEffect(effects[num - 1]);
        }
      }

      // Arrow keys - Adjust intensity
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const slider = document.getElementById('intensity');
        slider.value = Math.min(200, parseFloat(slider.value) + 5);
        this.app.updateIntensity(parseFloat(slider.value));
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const slider = document.getElementById('intensity');
        slider.value = Math.max(0, parseFloat(slider.value) - 5);
        this.app.updateIntensity(parseFloat(slider.value));
      }

      // Left/Right arrows - Adjust radius
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const slider = document.getElementById('radius');
        slider.value = Math.max(0, parseFloat(slider.value) - 5);
        this.app.updateRadius(parseFloat(slider.value));
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const slider = document.getElementById('radius');
        slider.value = Math.min(100, parseFloat(slider.value) + 5);
        this.app.updateRadius(parseFloat(slider.value));
      }
    });

    // Hide loading screen after initialization
    setTimeout(() => {
      const loadingScreen = document.getElementById('loading-screen');
      loadingScreen.classList.add('hidden');
    }, 2000);
  }

  selectEffect(effectName) {
    // Update active button
    document.querySelectorAll('.effect-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    const activeBtn = document.querySelector(`[data-effect="${effectName}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }

    // Apply effect
    this.app.changeEffect(effectName);
  }

  togglePanel() {
    this.panelVisible = !this.panelVisible;
    const panel = document.getElementById('control-panel');
    const toggleBtn = document.getElementById('toggle-panel-btn');

    if (this.panelVisible) {
      panel.classList.remove('hidden');
      toggleBtn.querySelector('.btn-icon').textContent = '👁️';
      toggleBtn.querySelector('.effect-name')?.remove();
      const span = document.createElement('span');
      span.textContent = 'Hide Panel';
      toggleBtn.appendChild(span);
    } else {
      panel.classList.add('hidden');
      toggleBtn.querySelector('.btn-icon').textContent = '👁️';
      toggleBtn.querySelector('span:last-child')?.remove();
      const span = document.createElement('span');
      span.textContent = 'Show Panel';
      toggleBtn.appendChild(span);
    }
  }

  showAbout() {
    document.getElementById('about-modal').style.display = 'flex';
  }

  closeAbout() {
    document.getElementById('about-modal').style.display = 'none';
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const app = new window.FaceDeformationApp();
  const ui = new UIController(app);

  try {
    await app.init();
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }

  // Make app globally accessible for debugging
  window.app = app;
  window.ui = ui;
});
