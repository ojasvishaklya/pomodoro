# 🍅 Pomodoro Timer PWA

A minimal, distraction-free Pomodoro timer that works offline and can be installed on any device.

## Features

- **Classic Pomodoro Flow**: 25-min focus → 5-min break → repeat 4x → 15-min long break
- **Progressive Web App**: Install on Android/iOS like a native app
- **Fully Offline**: Works without internet connection
- **Responsive**: Adapts to any screen size and orientation
- **Clean Design**: Minimal distractions, maximum focus
- **Keyboard Shortcuts**: Space to start/pause, R to reset, L to toggle layout

## Installation

### Desktop (Chrome/Edge)
1. Visit the deployed URL
2. Click the install icon in the address bar
3. Click "Install"

### Android (Chrome)
1. Open in Chrome browser
2. Tap menu → "Add to Home screen"
3. Tap "Add"
4. Launch from home screen

### iOS (Safari)
1. Open in Safari (must be Safari, not Chrome)
2. Tap Share button → "Add to Home Screen"
3. Tap "Add"
4. Launch from home screen

## Deployment

### GitHub Pages
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```
Then enable GitHub Pages in repository Settings → Pages → main branch

### Netlify
1. Visit https://app.netlify.com/drop
2. Drag and drop the entire project folder
3. Done!

### Vercel
```bash
npx vercel
```

## Local Development

**Python**:
```bash
python -m http.server 8000
```

**PHP**:
```bash
php -S localhost:8000
```

**Node**:
```bash
npx serve
```

Then visit `http://localhost:8000`

> Note: Service worker (offline mode) requires HTTPS or localhost

## Generate Icons

Before deploying, you need PWA icons. Create a simple HTML file to generate them:

1. Create `icon-gen.html`:
```html
<!DOCTYPE html>
<html>
<head><title>Icon Generator</title></head>
<body>
<canvas id="c"></canvas>
<script>
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
sizes.forEach(size => {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');

    // Background
    const g = ctx.createLinearGradient(0, 0, size, size);
    g.addColorStop(0, '#e94560');
    g.addColorStop(1, '#d63850');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    // Tomato
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size*0.35, 0, Math.PI*2);
    ctx.fill();

    // Download
    c.toBlob(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `icon-${size}x${size}.png`;
        a.click();
    });
});
</script>
</body>
</html>
```

2. Open it in browser, icons download automatically
3. Save all to `icons/` folder

## Settings

Click the gear icon to customize:
- Focus duration (default: 25 min)
- Short break (default: 5 min)
- Long break (default: 15 min)
- Sound notifications
- Vibration

Settings are saved locally on your device.

## Keyboard Shortcuts

- `Space` / `Enter` - Start/Pause
- `R` - Reset
- `L` - Toggle landscape/portrait layout
- `Esc` - Close settings

## Browser Support

- Chrome/Edge 90+
- Safari 11.3+
- Firefox 90+
- Samsung Internet 14+

## Tech Stack

- Vanilla HTML, CSS, JavaScript
- Service Worker for offline support
- Web App Manifest for PWA
- LocalStorage for settings
- Web Audio API for notifications
- Wake Lock API to prevent screen sleep

## License

Open source, free for personal and commercial use.

---

**Built with vanilla JavaScript - no frameworks needed! 🚀**
