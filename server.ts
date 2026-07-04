import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase request size limit for uploading larger log files
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Endpoint: AI-powered Downtime Root Cause Analysis
app.post("/api/analyze", async (req, res) => {
  const { plcAlarms, operatorLogs, maintenanceEvents, productionStops } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return res.status(400).json({
      error: "Gemini API key is not configured. Please add GEMINI_API_KEY in the Settings > Secrets panel of AI Studio.",
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    // Construct a comprehensive industrial context prompt for Gemini 3.5 Flash
    const prompt = `
You are an expert Reliability Engineer, Maintenance Manager, and Continuous Improvement Specialist in high-performance manufacturing.
Analyze the following factory data correlation stream to find the true root cause of machinery downtime.

--- INDUSTRIAL EVENTS DATA ---

[PLC Alarms & Events]
${JSON.stringify(plcAlarms || [], null, 2)}

[Operator Shift Logs & Observations]
${JSON.stringify(operatorLogs || [], null, 2)}

[Maintenance & Engineering Action History]
${JSON.stringify(maintenanceEvents || [], null, 2)}

[Production Stoppage Records]
${JSON.stringify(productionStops || [], null, 2)}

--- INSTRUCTIONS ---
Please synthesize and correlate this data across systems, taking note of timestamps (aligning them to identify what happened immediately before/during/after the downtime). Identify potential precursor alarms (alarms occurring 2, 5, or 10 minutes prior to stop).

Generate a structured analysis report. The output must be valid JSON matching this schema:
{
  "executiveSummary": "A highly professional, clear narrative of what occurred, when it happened, the immediate impact, and a summary of the root cause.",
  "fiveWhys": [
    "Why 1: (The direct symptom, e.g., Why did the bottling line stop? It stopped because the bottle conveyor motor tripped.)",
    "Why 2: (Why did it trip? Excess resistance / mechanical jam.)",
    "Why 3: (Why was there a mechanical jam? Accumulation of fallen bottles.)",
    "Why 4: (Why did bottles accumulate? The downstream photo-eye sensor failed to detect backups and did not stop the infeed.)",
    "Why 5: (Why did the photo-eye fail? It was misaligned and coated in sugar residue from cleaning washdowns without protective covers.)"
  ],
  "likelyCauses": [
    {
      "category": "Mechanical / Electrical / Sensor / Operator / Process",
      "cause": "Specific engineering explanation of the cause",
      "confidence": 85, // confidence percentage (0-100)
      "evidence": "Concrete timestamps or log entries from the data pointing to this"
    }
  ],
  "recommendedActions": [
    {
      "type": "Immediate Containment / Corrective / Preventive (CAPA)",
      "action": "Clear actionable engineering or operator task",
      "owner": "Operators / Maintenance Team / Automation Engineers",
      "impact": "High / Medium / Low"
    }
  ],
  "precursorAlert": "Specific warning about which PLC alarms are leading indicators of this failure mode."
}

Respond ONLY with the JSON block. Do not include markdown wraps like \`\`\`json or trailing commentary. Ensure it is directly parseable as valid JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim() || "";
    try {
      // Parse the JSON to ensure it is valid before returning
      const parsedReport = JSON.parse(text);
      return res.json({ report: parsedReport });
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON output:", text, parseError);
      // Fallback: Try cleaning markdown if model added any backticks
      const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      try {
        const fallbackParse = JSON.parse(cleanText);
        return res.json({ report: fallbackParse });
      } catch (e) {
        return res.status(500).json({
          error: "Failed to generate structured JSON report. The model returned non-JSON text.",
          rawText: text,
        });
      }
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({
      error: error?.message || "An unexpected error occurred during AI analysis.",
    });
  }
});

// Configure Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
