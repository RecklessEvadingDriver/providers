const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

/**
 * Streaming website server with provider integration
 */
class StreamingServer {
  constructor() {
    this.app = express();
    this.port = 3002;
    this.distDir = path.join(__dirname, "dist");
    this.websiteDir = path.join(__dirname, "website");
    this.manifestPath = path.join(__dirname, "manifest.json");
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  getProviderContext() {
    const axios = require("axios");
    const cheerio = require("cheerio");
    
    // Stub for Aes crypto (most providers don't use it)
    const AesStub = {
      pbkdf2: async () => "",
      decrypt: async () => "",
      encrypt: async () => "",
    };
    
    // Load the required modules
    const getBaseUrl = async (providerValue) => {
      try {
        const response = await axios.get('https://raw.githubusercontent.com/himanshu8443/providers/main/modflix.json');
        const providers = response.data;
        return providers[providerValue] || "";
      } catch (error) {
        console.error('Error getting base URL:', error);
        return "";
      }
    };
    
    const commonHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    };
    
    // Load extractors
    let extractors = {};
    try {
      const hubcloudPath = path.join(this.distDir, "hubcloudExtractor.js");
      const gofilePath = path.join(this.distDir, "gofileExtracter.js");
      const superVideoPath = path.join(this.distDir, "superVideoExtractor.js");
      const gdflixPath = path.join(this.distDir, "gdflixExtractor.js");
      
      if (fs.existsSync(hubcloudPath)) {
        const { hubcloudExtracter } = require(hubcloudPath);
        extractors.hubcloudExtracter = hubcloudExtracter;
      }
      if (fs.existsSync(gofilePath)) {
        const { gofileExtracter } = require(gofilePath);
        extractors.gofileExtracter = gofileExtracter;
      }
      if (fs.existsSync(superVideoPath)) {
        const { superVideoExtractor } = require(superVideoPath);
        extractors.superVideoExtractor = superVideoExtractor;
      }
      if (fs.existsSync(gdflixPath)) {
        const { gdFlixExtracter } = require(gdflixPath);
        extractors.gdFlixExtracter = gdFlixExtracter;
      }
    } catch (error) {
      console.error('Error loading extractors:', error);
    }
    
    return {
      axios,
      cheerio,
      Aes: AesStub,
      getBaseUrl,
      commonHeaders,
      extractors
    };
  }

  setupMiddleware() {
    // Enable CORS
    this.app.use(cors({
      origin: "*",
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }));

    // Serve static files from website directory
    this.app.use(express.static(this.websiteDir));
    
    // Serve dist files
    this.app.use("/dist", express.static(this.distDir));

    // JSON parsing
    this.app.use(express.json());

    // Logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    });
  }

  setupRoutes() {
    // Serve the main website
    this.app.get("/", (req, res) => {
      res.sendFile(path.join(this.websiteDir, "index.html"));
    });

    // Get all available providers
    this.app.get("/api/providers", (req, res) => {
      if (fs.existsSync(this.manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(this.manifestPath, "utf8"));
        res.json(manifest);
      } else {
        res.status(404).json({ error: "Manifest not found" });
      }
    });

    // Get provider catalog
    this.app.get("/api/provider/:value/catalog", async (req, res) => {
      try {
        const { value } = req.params;
        const catalogPath = path.join(this.distDir, value, "catalog.js");
        
        if (!fs.existsSync(catalogPath)) {
          return res.status(404).json({ error: "Provider not found" });
        }

        // Load the catalog module
        delete require.cache[require.resolve(catalogPath)];
        const catalogModule = require(catalogPath);
        
        res.json({
          catalog: catalogModule.catalog || [],
          genres: catalogModule.genres || []
        });
      } catch (error) {
        console.error("Error loading catalog:", error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get posts from provider
    this.app.post("/api/provider/:value/posts", async (req, res) => {
      try {
        const { value } = req.params;
        const { filter, page = 1 } = req.body;
        
        const postsPath = path.join(this.distDir, value, "posts.js");
        
        if (!fs.existsSync(postsPath)) {
          return res.status(404).json({ error: "Provider not found" });
        }

        // Load modules
        delete require.cache[require.resolve(postsPath)];
        
        const postsModule = require(postsPath);
        const providerContext = this.getProviderContext();
        
        const posts = await postsModule.getPosts({
          filter,
          page,
          providerValue: value,
          signal: new AbortController().signal,
          providerContext
        });
        
        res.json(posts);
      } catch (error) {
        console.error("Error getting posts:", error);
        res.status(500).json({ error: error.message });
      }
    });

    // Search posts
    this.app.post("/api/provider/:value/search", async (req, res) => {
      try {
        const { value } = req.params;
        const { query, page = 1 } = req.body;
        
        const postsPath = path.join(this.distDir, value, "posts.js");
        
        if (!fs.existsSync(postsPath)) {
          return res.status(404).json({ error: "Provider not found" });
        }

        // Load modules
        delete require.cache[require.resolve(postsPath)];
        
        const postsModule = require(postsPath);
        
        if (!postsModule.getSearchPosts) {
          return res.status(501).json({ error: "Search not supported by this provider" });
        }
        
        const providerContext = this.getProviderContext();
        const posts = await postsModule.getSearchPosts({
          searchQuery: query,
          page,
          providerValue: value,
          signal: new AbortController().signal,
          providerContext
        });
        
        res.json(posts);
      } catch (error) {
        console.error("Error searching:", error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get metadata
    this.app.post("/api/provider/:value/meta", async (req, res) => {
      try {
        const { value } = req.params;
        const { link } = req.body;
        
        const metaPath = path.join(this.distDir, value, "meta.js");
        
        if (!fs.existsSync(metaPath)) {
          return res.status(404).json({ error: "Provider not found" });
        }

        // Load modules
        delete require.cache[require.resolve(metaPath)];
        
        const metaModule = require(metaPath);
        const providerContext = this.getProviderContext();
        
        const meta = await metaModule.getMeta({
          link,
          providerContext
        });
        
        res.json(meta);
      } catch (error) {
        console.error("Error getting metadata:", error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get stream
    this.app.post("/api/provider/:value/stream", async (req, res) => {
      try {
        const { value } = req.params;
        const { link, type } = req.body;
        
        const streamPath = path.join(this.distDir, value, "stream.js");
        
        if (!fs.existsSync(streamPath)) {
          return res.status(404).json({ error: "Provider not found" });
        }

        // Load modules
        delete require.cache[require.resolve(streamPath)];
        
        const streamModule = require(streamPath);
        const providerContext = this.getProviderContext();
        
        const streams = await streamModule.getStream({
          link,
          type,
          signal: new AbortController().signal,
          providerContext
        });
        
        res.json(streams);
      } catch (error) {
        console.error("Error getting stream:", error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get episodes
    this.app.post("/api/provider/:value/episodes", async (req, res) => {
      try {
        const { value } = req.params;
        const { url } = req.body;
        
        const episodesPath = path.join(this.distDir, value, "episodes.js");
        
        if (!fs.existsSync(episodesPath)) {
          return res.status(404).json({ error: "Provider episodes not found" });
        }

        // Load modules
        delete require.cache[require.resolve(episodesPath)];
        
        const episodesModule = require(episodesPath);
        const providerContext = this.getProviderContext();
        
        const episodes = await episodesModule.getEpisodes({
          url,
          providerContext
        });
        
        res.json(episodes);
      } catch (error) {
        console.error("Error getting episodes:", error);
        res.status(500).json({ error: error.message });
      }
    });

    // Health check
    this.app.get("/api/health", (req, res) => {
      res.json({ status: "healthy", timestamp: new Date().toISOString() });
    });
  }

  start() {
    this.app.listen(this.port, "0.0.0.0", () => {
      console.log(`
🎬 Vega Streaming Website Started!

📺 Website: http://localhost:${this.port}
🔌 API: http://localhost:${this.port}/api

💡 Features:
   ✓ Browse providers and content
   ✓ Search across providers
   ✓ Stream movies and TV shows
   ✓ Fast and cross-platform

🚀 Open http://localhost:${this.port} in your browser
      `);

      // Check if build exists
      if (!fs.existsSync(this.distDir)) {
        console.log('\n⚠️  No build found. Run "npm run build" first!\n');
      }
    });
  }
}

// Start the server
const server = new StreamingServer();
server.start();
