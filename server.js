import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta2/models/chat-bison-001:generateMessage";

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY não está definida no .env");
  process.exit(1);
}

app.post("/chat", async (req, res) => {
  const { mensagem, historico = [] } = req.body;

  if (!mensagem) {
    return res.status(400).json({ erro: "Mensagem não enviada" });
  }

  try {
    const mensagens = historico.map(msg => ({
      author: msg.role === "user" ? "user" : "model",
      content: msg.parts[0].text
    }));

    mensagens.push({
      author: "user",
      content: mensagem
    });

    const body = {
      prompt: {
        messages: mensagens
      },
      temperature: 0.7,
      candidateCount: 1
    };

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro Gemini API:", errorData);
      return res.status(500).json({ erro: "Erro na API Gemini", detalhes: errorData });
    }

    const data = await response.json();
    const resposta = data?.candidates?.[0]?.content || "Sem resposta";

    const historicoAtualizado = [...mensagens, {
      author: "model",
      content: resposta
    }];

    res.json({
      resposta,
      historico: historicoAtualizado.map(msg => ({
        role: msg.author,
        parts: [{ text: msg.content }]
      }))
    });

  } catch (error) {
    console.error("Erro ao chamar Gemini API:", error);
    res.status(500).json({ erro: "Erro ao se comunicar com a Gemini API." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
