// server.js (VERSÃO SIMULADA - SEM BANCO DE DADOS)
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
// import mongoose from 'mongoose'; // REMOVIDO - Não precisamos mais do Mongoose

// --- CONFIGURAÇÃO INICIAL ---
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// --- VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE (Simplificada) ---
// Apenas verificamos as chaves que realmente vamos usar.
if (!process.env.GEMINI_API_KEY || !process.env.ADMIN_SECRET_PASSWORD) {
    console.error("ERRO: Verifique se as variáveis GEMINI_API_KEY e ADMIN_SECRET_PASSWORD estão no arquivo .env!");
    process.exit(1);
}

// --- BANCO DE DADOS FALSO (EM MEMÓRIA) ---
// Isto simula nossas coleções do MongoDB. Os dados são perdidos quando o servidor reinicia.
let fakeConversasDB = [
    { _id: 'chat1', title: 'Exemplo: Como relaxar agora?', createdAt: new Date(Date.now() - 3600000), messages: [] },
    { _id: 'chat2', title: 'Exemplo: Dica de autocuidado', createdAt: new Date(Date.now() - 7200000), messages: [] }
];
let fakeConfigDB = {
    systemInstruction: "Você é um Chatbot de Autocuidado. Sua personalidade é extremamente querida, acolhedora, gentil e positiva. Você é como uma amiga que oferece conforto e apoio. Suas respostas são sempre carinhosas e encorajadoras."
};
// -----------------------------------------

// --- CONFIGURAÇÃO DO GEMINI ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de autenticação para as rotas de admin (continua igual)
const adminAuth = (req, res, next) => {
    const providedPassword = req.headers['x-admin-password'];
    if (providedPassword === process.env.ADMIN_SECRET_PASSWORD) {
        next();
    } else {
        res.status(403).json({ message: 'Acesso Negado: Senha de administrador inválida.' });
    }
};

// --- ROTAS PÚBLICAS (DO CHATBOT) ---

app.post('/api/chat', async (req, res) => {
    try {
        const { mensagem, historico } = req.body;

   
        const persona = fakeConfigDB.systemInstruction;
        const promptCompleto = `${persona}\n\n${mensagem}`;

        // 2. Interage com a IA (sem alterações aqui)
        const chatAI = model.startChat({ history: historico });
        const result = await chatAI.sendMessage(promptCompleto);
        const response = await result.response;
        const textoResposta = response.text();

        // 3. Prepara o novo histórico
        const novoHistorico = [
            ...historico,
            { role: "user", parts: [{ text: mensagem }] },
            { role: "model", parts: [{ text: textoResposta }] },
        ];


        const novaConversa = {
            _id: 'chat' + Date.now(),
            title: mensagem.substring(0, 40) + (mensagem.length > 40 ? '...' : ''),
            createdAt: new Date(),
            messages: novoHistorico
        };
        fakeConversasDB.push(novaConversa);

        res.json({ resposta: textoResposta, historico: novoHistorico });

    } catch (error) {
        console.error("Erro no endpoint /api/chat:", error);
        res.status(500).json({ erro: "Erro interno no servidor." });
    }
});

app.get('/api/dica-do-dia', async (req, res) => {
    try {
        const prompt = "Aja como uma amiga querida e acolhedora. Crie uma dica de autocuidado original, curta, positiva e gentil, em português do Brasil. A dica deve ser algo prático e fácil de fazer no dia a dia para se sentir melhor.";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.status(200).json({ dica: response.text() });
    } catch (error) {
        console.error("Erro ao gerar a dica:", error);
        res.status(500).json({ error: "Desculpe, não consegui pensar em uma dica agora." });
    }
});



app.get('/api/admin/stats', adminAuth, async (req, res) => {
    try {
        const totalConversas = fakeConversasDB.length;
        // Ordena as conversas em memória para pegar as mais recentes
        const ultimasConversas = [...fakeConversasDB]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 5)
            .map(c => ({ title: c.title, createdAt: c.createdAt }));
        
        res.json({ totalConversas, ultimasConversas });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar estatísticas.' });
    }
});

// Endpoint para buscar a instrução do sistema (lê do banco de dados falso)
app.get('/api/admin/system-instruction', adminAuth, async (req, res) => {
    try {
        const instruction = fakeConfigDB.systemInstruction;
        res.json({ instruction });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar instrução.' });
    }
});


app.post('/api/admin/system-instruction', adminAuth, async (req, res) => {
    try {
        const { newInstruction } = req.body;
        if (!newInstruction) {
            return res.status(400).json({ message: 'Nenhuma instrução fornecida.' });
        }
     
        fakeConfigDB.systemInstruction = newInstruction;
        console.log("Nova instrução salva em memória:", newInstruction); // Log para vermos a mudança no servidor
        res.json({ message: 'Instrução do sistema atualizada com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao salvar instrução.' });
    }
});


// --- ROTA FINAL (FALLBACK) ---
app.get('*', (req, res) => {
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({ message: 'Endpoint não encontrado.' });
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(port, () => {
    console.log("--- SERVIDOR RODANDO EM MODO DE SIMULAÇÃo");
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`Acesse o chatbot em http://localhost:${port}` );
    console.log(`Acesse o painel de admin em http://localhost:${port}/admin.html` );
});
