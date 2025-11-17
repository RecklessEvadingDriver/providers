# Vega Stream - Streaming Website

A fast, cross-platform streaming website built on top of the Vega providers system.

## Features

✨ **40+ Streaming Providers** - Access content from multiple sources worldwide
🚀 **Fast & Lightweight** - Built with vanilla JavaScript for maximum performance
📱 **Cross-Platform** - Works seamlessly on mobile, tablet, and desktop
🎬 **Direct Streaming** - Watch movies and TV shows directly in your browser
🔍 **Search Functionality** - Find content across all providers
🌙 **Dark/Light Theme** - Choose your preferred viewing experience

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/RecklessEvadingDriver/providers.git
cd providers
```

2. Install dependencies:
```bash
npm install
```

3. Build the providers:
```bash
npm run build
```

4. Start the streaming website:
```bash
npm run stream
```

5. Open your browser and navigate to:
```
http://localhost:3002
```

## Usage

### Selecting a Provider

1. On the home page, browse through the available providers
2. Use the filter buttons (All, Global, India, English, Italy) to narrow down providers
3. Search for specific providers using the search box
4. Click on a provider to start browsing content

### Browsing Content

1. After selecting a provider, you'll see available categories and genres
2. Click on different categories to view content (e.g., Netflix, Amazon Prime, 4K Movies)
3. Use the search box to find specific movies or TV shows

### Watching Content

1. Click on any movie or TV show poster to view details
2. For movies: Click the play button to start streaming
3. For TV series: Select a season and episode
4. Choose from available servers if multiple options are provided
5. Enjoy streaming!

## Development Scripts

```bash
# Build providers
npm run build

# Build providers without minification (faster for development)
npm run build:dev

# Start streaming website
npm run stream

# Build and start streaming website
npm run stream:build

# Auto-rebuild on file changes and run streaming website
npm run stream:auto

# Start provider development server (for Vega app integration)
npm run auto
```

## Architecture

### Frontend
- **Vanilla JavaScript** - No framework dependencies for maximum speed
- **Responsive CSS** - Mobile-first design with CSS Grid and Flexbox
- **Progressive Enhancement** - Works on all modern browsers

### Backend
- **Express.js** - Lightweight Node.js server
- **Provider Integration** - Direct integration with compiled provider modules
- **RESTful API** - Clean API endpoints for provider data

### File Structure

```
providers/
├── website/               # Streaming website frontend
│   ├── index.html        # Main HTML file
│   ├── styles.css        # Responsive CSS styles
│   └── app.js            # Application logic
├── streaming-server.js   # Express server
├── providers/            # Provider source code
└── dist/                 # Compiled provider modules
```

## API Endpoints

### GET /api/providers
Get list of all available providers

### GET /api/provider/:value/catalog
Get catalog and genres for a provider

### POST /api/provider/:value/posts
Get posts/content for a category
```json
{
  "filter": "/category/popular-movies",
  "page": 1
}
```

### POST /api/provider/:value/search
Search for content
```json
{
  "query": "avengers",
  "page": 1
}
```

### POST /api/provider/:value/meta
Get metadata for a specific item
```json
{
  "link": "/movie/avengers-endgame"
}
```

### POST /api/provider/:value/stream
Get streaming links
```json
{
  "link": "/movie/avengers-endgame",
  "type": "movie"
}
```

### POST /api/provider/:value/episodes
Get episodes for a season
```json
{
  "url": "/season-1"
}
```

## Performance Optimizations

- **Lazy Loading** - Images are loaded only when visible
- **Debounced Search** - Search requests are debounced to reduce API calls
- **Minimal Dependencies** - No heavy frameworks or libraries
- **Optimized CSS** - CSS variables for theme switching without reload
- **Efficient Rendering** - Virtual scrolling for large content lists

## Cross-Platform Support

The website is fully responsive and optimized for:
- 📱 Mobile devices (phones)
- 📱 Tablets
- 💻 Desktops
- 🖥️ Large screens (4K+)

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## Contributing

Contributions are welcome! Please read the main repository's contributing guidelines.

## License

This project follows the same license as the main providers repository.

## Disclaimer

This software is for educational purposes only. Users are responsible for ensuring they comply with all applicable laws and regulations in their jurisdiction.

## Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation in the main README

## Acknowledgments

Built on top of the Vega Providers system - a collection of streaming content providers for the Vega app.
