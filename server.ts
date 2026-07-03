import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy-loaded Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY is not configured or is using placeholder. AI features will run in local mock mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Local mock words for fallbacks if Gemini is not available
const MOCK_ABUSIVE_WORDS = ["scam", "fraud", "kutta", "kamina", "harami", "abuse", "cheat", "bastard"];

// ==========================================
// MERCHANT COIN RESELLER SYSTEM BACKEND LOGIC
// ==========================================

// Mock In-Memory DB state for Full-Stack Simulation
interface ResellerDB {
  userId: string;
  name: string;
  availableCoinsBulk: number;
  discountRate: number;
  status: 'Active' | 'Suspended';
}

interface ResellerLogDB {
  id: string;
  resellerId: string;
  resellerName: string;
  amount: number;
  txType: 'BULK_DEPOSIT' | 'USER_DISPATCH';
  timestamp: string;
}

let mockResellers: ResellerDB[] = [
  { userId: "7777", name: "Danish (Verified Seller)", availableCoinsBulk: 45000, discountRate: 20, status: "Active" }
];

let mockResellerLogs: ResellerLogDB[] = [
  { id: "tx_init_1", resellerId: "7777", resellerName: "Danish (Verified Seller)", amount: 50000, txType: "BULK_DEPOSIT", timestamp: new Date().toISOString() }
];

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 1. GET current resellers list
app.get("/api/vocolive/resellers", (req, res) => {
  res.json({
    success: true,
    resellers: mockResellers,
    logs: mockResellerLogs
  });
});

// 2. PROMOTE user to 'Coin Reseller'
app.post("/api/vocolive/resellers/promote", (req, res) => {
  const { userId, name } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, error: "User ID is required for promotion." });
  }

  const cleanUserId = userId.toString().trim();
  const cleanName = (name || `User #${cleanUserId}`).trim();

  // Check if already a reseller
  const existingIndex = mockResellers.findIndex(r => r.userId === cleanUserId);
  if (existingIndex > -1) {
    return res.status(400).json({ success: false, error: "This user is already an approved Coin Reseller!" });
  }

  // Add to reseller pool
  const newReseller: ResellerDB = {
    userId: cleanUserId,
    name: cleanName,
    availableCoinsBulk: 0,
    discountRate: 20, // Default 20% discount rate
    status: 'Active'
  };

  mockResellers.push(newReseller);

  // SQL/Database Queries that would be run in production PostgreSQL
  const dbQueries = [
    `-- 1. Insert or update the user badge/role in VocoLive users table`,
    `UPDATE users SET badge = 'Reseller', role = 'Merchant Reseller' WHERE id = '${cleanUserId}';`,
    `-- 2. Provision their profile in merchant reseller metrics table`,
    `INSERT INTO merchant_resellers (user_id, available_coins_bulk, discount_rate, status, approved_at) `,
    `VALUES ('${cleanUserId}', 0, 20.00, 'Active', NOW()) `,
    `ON CONFLICT (user_id) DO UPDATE SET status = 'Active';`,
    `-- 3. Log administrative promotion audit trail`,
    `INSERT INTO admin_audit_logs (actor_id, action_type, target_id, description, logged_at) `,
    `VALUES ('SYSTEM_ADMIN', 'PROMPT_RESELLER', '${cleanUserId}', 'Promoted user ${cleanName} to Verified Coin Reseller', NOW());`
  ];

  res.json({
    success: true,
    message: `User ${cleanName} (ID: ${cleanUserId}) promoted to Official Coin Reseller!`,
    reseller: newReseller,
    queriesRun: dbQueries
  });
});

// 3. TRANSFER/SEND coins to reseller
app.post("/api/vocolive/resellers/transfer-coins", (req, res) => {
  const { userId, amount } = req.body;
  const coinsAmount = Number(amount);

  if (!userId || isNaN(coinsAmount) || coinsAmount <= 0) {
    return res.status(400).json({ success: false, error: "Valid User ID and coin amount are required." });
  }

  const cleanUserId = userId.toString().trim();

  // Find approved reseller
  const reseller = mockResellers.find(r => r.userId === cleanUserId);
  if (!reseller) {
    return res.status(404).json({ success: false, error: `User ID #${cleanUserId} is not an approved Coin Reseller. Promote them first!` });
  }

  // Credit coins
  reseller.availableCoinsBulk += coinsAmount;

  const log: ResellerLogDB = {
    id: 'tx_bulk_' + Date.now(),
    resellerId: cleanUserId,
    resellerName: reseller.name,
    amount: coinsAmount,
    txType: 'BULK_DEPOSIT',
    timestamp: new Date().toISOString()
  };

  mockResellerLogs.unshift(log);

  // SQL/Database Queries that would be run in production PostgreSQL
  const dbQueries = [
    `-- 1. Credit bulk coins to reseller balance with transactional safety`,
    `BEGIN;`,
    `UPDATE merchant_resellers `,
    `SET available_coins_bulk = available_coins_bulk + ${coinsAmount} `,
    `WHERE user_id = '${cleanUserId}' AND status = 'Active';`,
    `-- 2. Deduct coins from Super Admin central supply`,
    `UPDATE users `,
    `SET coins = coins - ${coinsAmount} `,
    `WHERE id = '7777';`,
    `-- 3. Append to system-wide ledger dispatch table`,
    `INSERT INTO reseller_dispatch_ledger (id, reseller_id, amount, settlement_type, created_at) `,
    `VALUES ('${log.id}', '${cleanUserId}', ${coinsAmount}, 'BULK_DEPOSIT', NOW());`,
    `COMMIT;`
  ];

  res.json({
    success: true,
    message: `Allocated ${coinsAmount.toLocaleString()} bulk coins to Reseller ${reseller.name} successfully.`,
    reseller,
    log,
    queriesRun: dbQueries
  });
});


// Helper to call generateContent with retry and fallback
async function generateWithFallbackAndRetry(ai: GoogleGenAI, text: string, systemPrompt: string): Promise<string> {
  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Gemini] Attempting generateContent with model ${model} (Attempt ${attempt}/2)...`);
        const response = await ai.models.generateContent({
          model: model,
          contents: text,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isAbusive: { type: Type.BOOLEAN, description: "Whether the text contains abusive or toxic content" },
                censoredText: { type: Type.STRING, description: "The original text, or text censored with *** where toxic words exist" },
                warningMessage: { type: Type.STRING, description: "Polite warning message if abusive, else empty or null" },
                aiCohostReply: { type: Type.STRING, description: "Host's conversational Roman Urdu/English response if clean, else empty" },
                aiCohostName: { type: Type.STRING, description: "The name of the cohost replying (Aisha, Zain, or other)" }
              },
              required: ["isAbusive", "censoredText"]
            }
          }
        });

        if (response && response.text) {
          console.log(`[Gemini] Successfully generated response using model ${model}`);
          return response.text.trim();
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Warning] Model ${model} attempt ${attempt} failed:`, err.message || err);
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 300 * attempt));
      }
    }
  }
  throw lastError || new Error("All models and retries exhausted");
}

// Real-time AI Moderation and Room Cohost Response
app.post("/api/vocolive/chat", async (req, res) => {
  const { text, username, roomId, activeCohosts } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  const ai = getAiClient();

  if (!ai) {
    // Local rule-based fallback mode
    const lowerText = text.toLowerCase();
    const isAbusive = MOCK_ABUSIVE_WORDS.some(word => lowerText.includes(word));
    let censoredText = text;
    let warningMessage = null;

    if (isAbusive) {
      MOCK_ABUSIVE_WORDS.forEach(word => {
        const regex = new RegExp(word, "gi");
        censoredText = censoredText.replace(regex, "***");
      });
      warningMessage = "System Alert: Toxic word detected. Abusive language is strictly banned on VocoLive.";
    }

    const cohostName = activeCohosts && activeCohosts.length > 0 
      ? activeCohosts[Math.floor(Math.random() * activeCohosts.length)] 
      : "Aisha (AI)";

    const replies = [
      `Assalam-o-Alaikum! Welcome to room, kaise ho aap?`,
      `Aray waah! Bohat khoob, maza aa gaya.`,
      `Sahi keh rahay ho, VocoLive standard is the best!`,
      `Hahaha, bilkul sahi baat kahi!`,
      `Chalo sub mil kar gifting karte hain host ko!`,
      `Ludo khelein kya room me?`,
      `Welcome to VocoLive lobby!`
    ];

    const aiCohostReply = isAbusive ? null : replies[Math.floor(Math.random() * replies.length)];

    return res.json({
      isAbusive,
      censoredText,
      warningMessage,
      aiCohostReply,
      aiCohostName: isAbusive ? null : cohostName
    });
  }

  try {
    const systemPrompt = `You are VocoLive AI Moderation & Room Cohost Service. Your jobs are:
1. Moderate user text. Check if it contains toxic, abusive, scam, or highly vulgar words (in English, Roman Urdu, Roman Hindi, or Arabic slang). If abusive, set isAbusive = true, censor the abusive words with '***' in censoredText, and provide a polite warningMessage (e.g., "Abusive behavior is not allowed in VocoLive").
2. If clean, act as a real live audio room cohost named 'Aisha' or 'Zain' (pick one dynamically, or use any of: ${JSON.stringify(activeCohosts || [])}). Create a short, energetic, friendly 1-sentence reply in Roman Urdu/Hindi (mixed with English) reacting to the user's message "${text}". Standard Roman Urdu expressions like 'Slam, kaise hain aap?', 'Aray waah!', 'Chalo game start karte hain!', 'Gifting karo dosto!' are highly appreciated. Keep it under 15 words.
Return strictly the JSON output fitting the schema below.`;

    const resultText = await generateWithFallbackAndRetry(ai, text, systemPrompt);
    const result = JSON.parse(resultText);
    res.json(result);
  } catch (error) {
    console.error("Gemini model error:", error);
    // Dynamic fallback inside catch block
    res.json({
      isAbusive: false,
      censoredText: text,
      warningMessage: null,
      aiCohostReply: "Aray waah, bilkul sahi baat hai!",
      aiCohostName: "Aisha"
    });
  }
});

// Setup Vite Dev Server / Static Asset Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production static assets from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VocoLive backend running on http://localhost:${PORT}`);
  });
}

startServer();
