import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini AI Setup
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route for AI Generation
  app.post("/api/generate-text", async (req, res) => {
    try {
      const { prompt, context } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is not configured." });
      }

      const fullPrompt = `
        You are a professional copywriter for "Parbadiya Infotech", a company specializing in CCTV installation, IT solutions, computer services, and security systems.
        
        Context: ${context}
        User Keywords/Prompt: ${prompt}
        
        Generate a professional, business-optimized text based on the above. 
        If context is "hero-headline", generate a catchy, short, and impactful headline.
        If context is "about-description", generate a compelling "About Us" description that builds trust.
        
        Return ONLY the generated text, no conversational filler or markdown formatting.
      `;

      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: fullPrompt
      });
      
      const text = result.text?.trim() || "";
      
      res.json({ text });
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      res.status(500).json({ error: "Failed to generate text." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
