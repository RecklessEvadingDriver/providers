# 🎬 Vega Stream - Getting Started

Welcome to Vega Stream! This guide will help you get the streaming website up and running in minutes.

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
cd /path/to/providers
npm install
```

### Step 2: Build the Providers
```bash
npm run build
```
This compiles all 40+ provider modules (~5 seconds).

### Step 3: Start the Streaming Website
```bash
npm run stream
```

That's it! Open **http://localhost:3002** in your browser.

## 🎯 How to Use the Website

### 1. Choose a Provider
- Browse the 40+ available providers on the home page
- Filter by region: All, Global, India, English, or Italy
- Search for a specific provider by name
- Click on any **Active** provider to start browsing

### 2. Browse Content
- View categories (e.g., Home, Movies, TV Shows, Netflix, Amazon Prime)
- Browse genres (Action, Comedy, Drama, Horror, etc.)
- Use the search box to find specific movies or shows
- Click on any poster to view details

### 3. Watch Content
- On the details page, view movie/show information
- For movies: Click the play button to stream
- For TV shows: Select a season, then choose an episode
- If multiple servers are available, you can switch between them
- Enjoy streaming! 🍿

## 📱 Device Support

The website works perfectly on:
- ✅ Desktop computers (Windows, Mac, Linux)
- ✅ Laptops  
- ✅ Tablets (iPad, Android tablets)
- ✅ Mobile phones (iPhone, Android)
- ✅ Smart TVs with browsers

## 🌐 Browser Support

- ✅ Chrome / Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ✅ Brave

## ⚙️ Configuration

### Change Port
Edit `streaming-server.js`, line 5:
```javascript
this.port = 3002; // Change to your desired port
```

### Development Mode
Auto-rebuild providers when files change:
```bash
npm run stream:auto
```

## 🎨 Features

### Theme Toggle
Click the sun/moon icon in the top-right to switch between light and dark themes.

### Search
- **Provider Search**: On the home page, search for providers
- **Content Search**: After selecting a provider, search for movies/shows

### Filters
- Filter providers by region (Global, India, English, Italy)
- Filter content by categories and genres

### Navigation
- Click the **Vega Stream** logo to return home
- Use the **Back** button to go to the previous view

## 🔧 Troubleshooting

### "Error loading providers"
- Make sure you ran `npm run build` first
- Check that the `dist/` folder exists and contains provider files

### "No content found"
- The provider may be temporarily unavailable
- Try a different provider
- Check your internet connection
- Some providers may be region-restricted

### Content won't play
- Try switching to a different server (if available)
- The video source may be temporarily offline
- Check if your browser supports the video format
- Try disabling browser ad-blockers

### Server won't start
- Check if port 3002 is already in use
- Run: `lsof -i :3002` (Mac/Linux) or `netstat -ano | findstr :3002` (Windows)
- Kill the process or change the port in `streaming-server.js`

## 📊 Performance Tips

### For Best Performance:
1. **Use Chrome or Edge** - Best video codec support
2. **Close unnecessary tabs** - Reduces memory usage
3. **Use fast internet** - 5+ Mbps recommended for HD streaming
4. **Clear browser cache** - If experiencing issues

### For Developers:
- Use `npm run build:dev` for faster builds (skips minification)
- Use `npm run stream:auto` for auto-reload during development
- Enable browser DevTools Network tab to debug API calls

## 🆘 Getting Help

### Check the Documentation
- **`STREAMING_WEBSITE.md`** - Complete technical documentation
- **`README.md`** - Main repository documentation

### Common Commands
```bash
# See all available commands
npm run

# Rebuild providers
npm run build

# Start website
npm run stream

# Start with auto-rebuild
npm run stream:auto

# Test a specific provider
npm run test:provider
```

## 🎓 Learn More

### Project Structure
```
providers/
├── website/              # Streaming website frontend
│   ├── index.html       # Main HTML file
│   ├── styles.css       # All styles (dark/light themes)
│   └── app.js           # Application logic
├── streaming-server.js  # Backend Express server
├── providers/           # Provider source code (TypeScript)
├── dist/                # Compiled providers (JavaScript)
└── manifest.json        # Provider manifest
```

### Provider Development
Want to add a new provider? See the main README.md for provider development guide.

## 🎉 Enjoy!

You're all set! Start exploring content from 40+ providers and enjoy unlimited streaming.

**Pro Tip**: Bookmark your favorite providers and categories for quick access!

---

**Questions?** Check `STREAMING_WEBSITE.md` for detailed documentation.
