# Quick Deploy Checklist

## 1. Test Locally (Optional)
```bash
python -m http.server 8000
# Visit http://localhost:8000
```

## 2. Initialize Git & Push
```bash
git init
git add .
git commit -m "Initial commit: Pomodoro Timer PWA"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## 3. Enable GitHub Pages
1. Go to your GitHub repository
2. Click **Settings**
3. Click **Pages** (left sidebar)
4. Under "Source", select **main** branch
5. Click **Save**
6. Wait 1-2 minutes
7. Your site will be live at: `https://yourusername.github.io/pomodoro/`

## 4. Test Installation
- **Desktop**: Visit URL, click install icon in address bar
- **Android**: Open in Chrome, Menu → "Add to Home screen"
- **iOS**: Open in Safari, Share → "Add to Home Screen"

## Alternative: Netlify (Even Easier)
1. Go to https://app.netlify.com/drop
2. Drag & drop the entire `pomodoro` folder
3. Done! Live in 10 seconds

---

**That's it! Your PWA is live! 🚀**
