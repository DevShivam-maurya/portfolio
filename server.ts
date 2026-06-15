import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. AI Chat will run in mock mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `You are "Shivam Maurya's AI Agent", a highly polished, recruiter-focused AI twin of Shivam Maurya, available 24/7. Shivam is an elite Computer Science Engineering (Data Science) student who matches the tier of applicants to top-tier technology giants like Google, Microsoft, Amazon, Atlassian, Adobe, and Uber.

Your primary mission is to answer recruiter queries, represent Shivam's technical expertise, provide details about his projects/education/skills, and prove why he would be an outstanding intern/engineer for their engineering team.

Here is Shivam Maurya's background profile:
- NAME: Shivam Maurya
- TAGLINE: AI Engineer • Data Analyst • Full Stack Developer
- EDUCATION:
  * GL Bajaj Institute of Technology and Management, Pursuing B.Tech in Computer Science Engineering (Data Science), graduation expected 2027. Currently building machine learning, statistique, and deep software foundations.
  * Academic Global School, Gorakhpur: Class XII in 2023 with 78.6% (Physics, Chemistry, Maths).
  * Saraswati Vidya Mandir, Gorakhpur: Class X in 2021 with 90.16%.
- PROJECTS:
  * "AI Profile Enhancer System" - Tech: React.js, Python, MongoDB, AI APIs, Framer Motion, Tailwind. An evaluation tool that ingests developer profiles from GitHub, LinkedIn, Instagram, portfolios; scores profiles; detects skill gaps; highlights action items; suggests branding.
  * "LifeLine AI Assistant" - Tech: React.js, Python, AI APIs. A companion styled with high-fidelity glassmorphism offering career roadmap generators, productivity loops, task tracking, smart daily heuristic choices, interactive dashboard views.
- SKILLS:
  * Programming: Python, C++
  * Data Analytics: SQL, Power BI, Tableau, Excel, Pandas, NumPy, Matplotlib
  * Web Dev & Databases: React.js, JavaScript, HTML/CSS, MongoDB
  * AI & ML: Generative AI, Prompt Engineering, AI tools, LLM fine-tuning concepts
  * Core: Data Structures & Algorithms (C++ / Python), Problem Solving, UI/UX Basics.
- ACHIEVEMENTS:
  * Developed 5+ advanced AI / full-stack projects.
  * Mastered over 15+ modern engineering technologies.
  * Solved over 300+ programming & DSA problems (on LeetCode, etc.).
  * Gained 4+ professional certifications including:
    - Data Analyst Certification
    - Palo Alto Networks Cybersecurity Certification
- CONTACT & SOCIALS:
  * Email: aniheshmaurya456@gmail.com
  * Phone: +91 9044144059
  * LinkedIn: linkedin.com/in/shivam-maurya-b5468932b
  * GitHub: github.com/DevShivam-maurya

Tone & Persona rules:
1. Speak as Shivam or Shivam Maurya's AI twin. You are highly collaborative, technical, logical, respectful, and sharp. 
2. Ground your answers 100% in facts. Never invent certificates or products he did not build.
3. Be short, concise, and professional. Bullet points are encouraged so busy recruiters read key insights in 5 seconds.
4. If asked about salary, start dates, or anything personal not defined, invite them to send an email directly to Shivam at aniheshmaurya456@gmail.com or ring him up at +91 9044144059.

Let's do some awesome recruiting!`;

// AI Recruiter Twin Chat API Endpoint
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing or invalid 'messages' field." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      // Return a simulated high-quality AI response if API key is not ready
      console.log("Using Mock AI Agent Response");
      return res.json({
        text: `[Offline Demo Mode] I'm Shivam's AI Twin! Real Gemini API can be unlocked with your API Key, but I can tell you that Shivam Maurya has built two incredible AI projects ("AI Profile Enhancer System" and "LifeLine AI Assistant"), excels in Python + SQL/React, and is ready for top product engineering roles. What specifics can I explain for you?`
      });
    }

    // Format messages safely for the @google/genai SDK
    // The SDK expects contents: [{ role: 'user' | 'model', parts: [{ text: string }] }]
    const formattedContents = messages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    const reply = response.text || "I was unable to formulate a response. Feel free to contact the human Shivam!";
    res.json({ text: reply });
  } catch (err: any) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: "Failed to generate AI response. Pls try again shortly." });
  }
});

// Dynamic Profile API to verify server is active and serve profile highlights
app.get("/api/profile-highlights", (req, res) => {
  res.json({
    name: "Shivam Maurya",
    email: "aniheshmaurya456@gmail.com",
    role: "AI Engineer & CSE Data Science Student",
    statusText: "Active & seeking product engineering internships"
  });
});

// Explicit POST route for backup contact message submission
app.post("/api/contact", (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required contact form parameters." });
  }

  console.info("========================================");
  console.info("NEW CONTACT FORM SUBMISSION RECEIVED");
  console.info(`From:    ${name} <${email}>`);
  console.info(`Subject: ${subject || "None"}`);
  console.info(`Message: ${message}`);
  console.info("========================================");

  // Return success status
  res.status(200).json({ success: true, message: "Contact inquiry recorded on server." });
});

// Explicitly serve the pre-compiled Shivam_Maurya_Resume.pdf to bypass SPA fallback
app.get("/resume.pdf", (req, res) => {
  const filePathPublic = path.join(process.cwd(), "public", "resume.pdf");
  const filePathDist = path.join(process.cwd(), "dist", "resume.pdf");
  
  let finalPath = "";
  if (fs.existsSync(filePathDist)) {
    finalPath = filePathDist;
  } else if (fs.existsSync(filePathPublic)) {
    finalPath = filePathPublic;
  } else {
    // Attempt to automatically trigger generation if file isn't found
    console.warn("resume.pdf not found pre-built. Triggering fallback response.");
    return res.status(404).send("Resume PDF file is currently being generated or was not found. Please try refreshing again.");
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=Shivam_Maurya_Resume.pdf");
  res.sendFile(finalPath);
});

// Duplicate helper route for redundancy
app.get("/api/resume", (req, res) => {
  const filePathPublic = path.join(process.cwd(), "public", "resume.pdf");
  const filePathDist = path.join(process.cwd(), "dist", "resume.pdf");
  
  let finalPath = "";
  if (fs.existsSync(filePathDist)) {
    finalPath = filePathDist;
  } else if (fs.existsSync(filePathPublic)) {
    finalPath = filePathPublic;
  } else {
    return res.status(404).json({ error: "Resume PDF not found" });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=Shivam_Maurya_Resume.pdf");
  res.sendFile(finalPath);
});

async function main() {
  // Vite integration in Dev, static assets in Prod
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
    console.log(`[Server] Running full-stack layout on http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Critical server launch error:", err);
  process.exit(1);
});
