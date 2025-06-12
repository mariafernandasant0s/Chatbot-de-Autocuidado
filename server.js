// server.js
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config(); // Carrega as variáveis do arquivo .env

const app = express();
const port = process.env.PORT || 3000;

// Pega a chave da API do Gemini do arquivo .env
const API_KEY = process.env.GEMINI_API_KEY;

// Valida se a chave da API está definida
if (!API_KEY) {
  console.error("ERRO FATAL: Variável GEMINI_API_KEY não definida.");
  console.log("Adicione no arquivo .env na raiz do projeto:");
  console.log("GEMINI_API_KEY=SUA_CHAVE_API_AQUI");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const generationConfig = {
  temperature: 0.7,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Endpoint POST /chat
app.post('/chat', async (req, res) => {
  console.log("Requisição /chat recebida:", req.body);

  const mensagemUsuario = req.body.mensagem;
  const historicoRecebido = req.body.historico || [];

  if (!mensagemUsuario || typeof mensagemUsuario !== 'string' || mensagemUsuario.trim() === '') {
    console.log("Requisição inválida: mensagem ausente ou vazia.");
    return res.status(400).json({ erro: "Mensagem inválida ou ausente." });
  }

  if (!Array.isArray(historicoRecebido)) {
    console.log("Requisição inválida: histórico não é um array.");
    return res.status(400).json({ erro: "Formato de histórico inválido." });
  }

  try {
    const chat = model.startChat({
      history: historicoRecebido,
      generationConfig,
      safetySettings,
    });

    const result = await chat.sendMessage(mensagemUsuario);
    const response = result.response;

    if (!response || response.promptFeedback?.blockReason) {
      const blockReason = response?.promptFeedback?.blockReason || 'desconhecido';
      console.warn(`Resposta bloqueada pela API Gemini. Motivo: ${blockReason}`);
      return res.status(400).json({ erro: `Mensagem bloqueada por questões de segurança (${blockReason}). Tente reformular.` });
    }

    const textoResposta = response.text();

    const novoHistorico = [
      ...historicoRecebido,
      { role: "user", parts: [{ text: mensagemUsuario }] },
      { role: "model", parts: [{ text: textoResposta }] },
    ];

    console.log("Enviando resposta e histórico atualizado.");
    res.json({ resposta: textoResposta, historico: novoHistorico });

  } catch (error) {
    console.error("Erro ao interagir com a API Gemini:", error);
    const apiErrorMessage = error?.response?.data?.error?.message || error?.message;
    res.status(500).json({
      erro: `Erro interno no servidor ao processar sua solicitação. Tente novamente mais tarde. (Detalhe: ${apiErrorMessage || 'Erro desconhecido'})`
    });
  }
});

// Rota para evitar erro de favicon
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Inicializa o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`Servindo arquivos estáticos da pasta 'public'`);
  console.log(`API Key do Gemini carregada: ${API_KEY ? 'Sim' : 'NÃO (Verifique o .env!)'}`);
});
