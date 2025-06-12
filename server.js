import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch"; // Não use se estiver no Node 18+

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY não está definida no .env");
  process.exit(1);
}

app.post("/chat", async (req, res) => {
  const { mensagem } = req.body;

  if (!mensagem) {
    return res.status(400).json({ erro: "Mensagem não enviada" });
  }

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: mensagem }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512
    }
  };

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Erro na API Gemini:", errorData);
      return res.status(500).json({ erro: "Erro na API Gemini", detalhes: errorData });
    }

    const data = await response.json();
    const resposta = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta";

    res.json({ resposta });
  } catch (error) {
    console.error("❌ Erro ao chamar a API Gemini:", error);
    res.status(500).json({ erro: "Erro ao se comunicar com a API Gemini." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
