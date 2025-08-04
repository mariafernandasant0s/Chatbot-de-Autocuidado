// server.js
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MongoClient } from 'mongodb'; // Pacote para conectar ao MongoDB
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// =================================================================
// SEÇÃO DE CONEXÃO COM O MONGODB (DA ATIVIDADE B2.P1.A7)
// =================================================================
let db; // Variável para guardar a conexão com o banco

// Função para conectar ao banco de dados de logs
async function connectToDatabase() {
    // Pega a string de conexão do arquivo .env ou das variáveis do Render
    const mongoUri = process.env.MONGO_URI_LOGS; 
    if (!mongoUri) {
        console.error("ERRO: Variável MONGO_URI_LOGS não encontrada!");
        return;
    }
    const client = new MongoClient(mongoUri);
    try {
        await client.connect();
        // O nome do banco de dados (IIW2023A_Logs) é definido na própria string de conexão
        const dbName = mongoUri.substring(mongoUri.lastIndexOf("/") + 1, mongoUri.indexOf("?"));
        db = client.db(dbName);
        console.log(`Conectado ao banco de dados de logs: ${dbName}`);
    } catch (err) {
        console.error("Falha ao conectar ao MongoDB:", err);
    }
}

connectToDatabase(); // Conecta ao banco assim que o servidor inicia
// =================================================================

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Endpoint principal do Chat (que você já tinha)
app.post('/chat', async (req, res) => {
    try {
        const { mensagem, historico } = req.body;
        const chat = model.startChat({ history: historico });
        const result = await chat.sendMessage(mensagem);
        const response = result.response;
        const textoResposta = response.text();

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

// =================================================================
// NOVO ENDPOINT DE LOG (DA ATIVIDADE B2.P1.A7)
// =================================================================
app.post('/api/log-acesso', async (req, res) => {
    if (!db) {
        return res.status(500).json({ error: "Servidor não conectado ao banco de dados." });
    }
    try {
        const { ip, nome_bot } = req.body;
        const agora = new Date();

        // Estrutura do log definida na Atividade B2.P1.A7
        const logEntry = {
            col_data: agora.toISOString().split('T')[0],
            col_hora: agora.toTimeString().split(' ')[0],
            col_IP: ip,
            col_nome_bot: nome_bot,
            col_acao: "acesso_inicial_chatbot"
        };
        
        // Nome da coleção definido na Atividade B2.P1.A7
        const collection = db.collection("tb_cl_user_log_acess");
        await collection.insertOne(logEntry);
        res.status(201).json({ message: "Log registrado com sucesso." });

    } catch (error) {
        console.error("Erro ao salvar log de acesso:", error);
        res.status(500).json({ error: "Erro interno ao salvar log de acesso." });
    }
});
// =================================================================


app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
