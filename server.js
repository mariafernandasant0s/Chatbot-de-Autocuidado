// server.js (VERSÃO COM PERSONALIDADE ACOLHEDORA)
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.GEMINI_API_KEY) {
    console.error("ERRO: A variável GEMINI_API_KEY não foi encontrada no arquivo .env!");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- MUDANÇA 1: PERSONALIDADE NAS CONVERSAS ---
app.post('/chat', async (req, res) => {
    try {
        const { mensagem, historico } = req.body;

        // A "Instrução Secreta" que define a personalidade do bot
        const persona = "Você é um Chatbot de Autocuidado. Sua personalidade é extremamente querida, acolhedora, gentil e positiva. Você é como uma amiga que oferece conforto e apoio. Suas respostas são sempre carinhosas e encorajadoras. Responda à seguinte mensagem do usuário nesse tom:\n";
        
        const promptCompleto = persona + mensagem;

        const chat = model.startChat({ history: historico });
        const result = await chat.sendMessage(promptCompleto);
        const response = await result.response;
        const textoResposta = response.text();

        // O histórico continua o mesmo, sem a instrução da persona
        const novoHistorico = [
            ...historico,
            { role: "user", parts: [{ text: mensagem }] },
            { role: "model", parts: [{ text: textoResposta }] },
        ];
        res.json({ resposta: textoResposta, historico: novoHistorico });
    } catch (error) {
        console.error("Erro no endpoint /chat:", error);
        res.status(500).json({ erro: "Erro interno no servidor." });
    }
});

// --- MUDANÇA 2: GERANDO DICAS ORIGINAIS E ACOLHEDORAS ---
app.get('/api/dica-do-dia', async (req, res) => {
    try {
        // Não buscamos mais em outra API. Pedimos para a Gemini CRIAR a dica.
        const prompt = "Aja como uma amiga querida e acolhedora. Crie uma dica de autocuidado original, curta, positiva e gentil, em português do Brasil. A dica deve ser algo prático e fácil de fazer no dia a dia para se sentir melhor.";
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const dicaGerada = response.text();

        res.status(200).json({ dica: dicaGerada });
    } catch (error) {
        console.error("Erro ao gerar a dica:", error);
        res.status(500).json({ error: "Desculpe, não consegui pensar em uma dica agora. Tente novamente." });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor com personalidade rodando na porta ${port}`);
    console.log(`Acesse em http://localhost:${port}`);
});