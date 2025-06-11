// server.js
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// --- Configurações da API ---
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("ERRO FATAL: Variável de ambiente GEMINI_API_KEY não definida.");
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

// --- Middlewares ---
app.use(cors());
app.use(express.json()); // Middleware para interpretar JSON
app.use(express.static('public')); // Serve os arquivos da pasta 'public'

// --- Endpoint do Chat ---
app.post('/chat', async (req, res) => {
    const { mensagem, historico } = req.body;

    if (!mensagem) {
        return res.status(400).json({ erro: "A mensagem é obrigatória." });
    }

    try {
        const chat = model.startChat({
            history: historico || [],
            generationConfig,
            safetySettings,
        });

        const result = await chat.sendMessage(mensagem);
        const response = result.response;

        if (!response || response.promptFeedback?.blockReason) {
            const blockReason = response?.promptFeedback?.blockReason || 'desconhecido';
            return res.status(500).json({ erro: `A resposta foi bloqueada por segurança: ${blockReason}` });
        }

        const textoResposta = response.text();

        const novoHistorico = [
            ...(historico || []),
            { role: "user", parts: [{ text: mensagem }] },
            { role: "model", parts: [{ text: textoResposta }] }
        ];

        res.json({ resposta: textoResposta, historico: novoHistorico });

    } catch (error) {
        console.error("Erro na API Gemini:", error);
        res.status(500).json({ erro: "Ocorreu um erro ao se comunicar com a IA." });
    }
});

// --- Inicialização do Servidor ---
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});