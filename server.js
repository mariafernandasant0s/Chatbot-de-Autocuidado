import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuração da OpenAI com chave da .env
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.get("/", (req, res) => {
  res.send("Servidor funcionando!");
});

app.post("/chat", async (req, res) => {
  const { mensagem, historico } = req.body;

  if (!mensagem) {
    return res.status(400).json({ erro: "Mensagem não enviada" });
  }

  try {
    // Monta as mensagens para enviar à OpenAI
    // Adaptar conforme seu formato de histórico, aqui um exemplo genérico
    const messages = [];

    if (Array.isArray(historico)) {
      for (const entry of historico) {
        if (entry.role === "user") {
          messages.push({ role: "user", content: entry.parts[0].text });
        } else if (entry.role === "model") {
          messages.push({ role: "assistant", content: entry.parts[0].text });
        }
      }
    }

    // Adiciona a mensagem atual do usuário
    messages.push({ role: "user", content: mensagem });

    // Chama a OpenAI Chat Completion
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: 200,
      temperature: 0.7,
    });

    const resposta = completion.data.choices[0].message.content.trim();

    // Atualiza o histórico com a nova mensagem do usuário e a resposta do bot
    const novoHistorico = [...(historico || [])];
    novoHistorico.push({ role: "user", parts: [{ text: mensagem }] });
    novoHistorico.push({ role: "model", parts: [{ text: resposta }] });

    return res.json({
      resposta,
      historico: novoHistorico,
    });
  } catch (error) {
    console.error("Erro na API OpenAI:", error.response?.data || error.message);
    return res.status(500).json({
      erro: "Ocorreu um erro ao se comunicar com a IA.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
