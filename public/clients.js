// client.js
const chatOutput = document.getElementById('chat-output');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-btn');
const loadingIndicator = document.getElementById('loading-indicator');

let chatHistory = [];

// =================================================================
// NOVA FUNÇÃO E LÓGICA DE LOG (DA ATIVIDADE B2.P1.A7)
// =================================================================

// Função para registrar o acesso do usuário no backend
async function registrarAcesso() {
    try {
        // Usamos um serviço gratuito para descobrir o IP do usuário
        const userInfoResponse = await fetch('https://ipapi.co/json/');
        const userInfo = await userInfoResponse.json();
        
        const logData = {
            ip: userInfo.ip,
            nome_bot: "MeuChatbotDeAutocuidado" // <-- MUDE AQUI PARA O NOME DO SEU BOT
        };

        // Envia os dados para o novo endpoint de log no backend
        await fetch('/api/log-acesso', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData)
        });
        console.log("Log de acesso enviado.");
    } catch (error) {
        console.error("Erro ao registrar acesso:", error);
    }
}

// Roda a função de log assim que a página é carregada
window.addEventListener('load', registrarAcesso);
// =================================================================


// Função para adicionar mensagem na tela (que você já tinha)
function addMessageToChat(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    messageDiv.textContent = text;
    chatOutput.appendChild(messageDiv);
    chatOutput.scrollTop = chatOutput.scrollHeight;
}

// Função principal que envia a mensagem para o bot (que você já tinha)
async function handleSendMessage() {
    const userMessage = messageInput.value.trim();
    if (!userMessage) return;

    addMessageToChat('user', userMessage);
    messageInput.value = '';
    loadingIndicator.style.display = 'block';
    sendButton.disabled = true;

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mensagem: userMessage,
                historico: chatHistory
            })
        });

        if (!response.ok) {
            throw new Error('A resposta do servidor não foi OK');
        }

        const data = await response.json();
        chatHistory = data.historico; // Atualiza o histórico local
        addMessageToChat('bot', data.resposta);

    } catch (error) {
        console.error("Erro ao conversar com o bot:", error);
        addMessageToChat('bot', 'Desculpe, ocorreu um erro. Tente novamente.');
    } finally {
        loadingIndicator.style.display = 'none';
        sendButton.disabled = false;
        messageInput.focus();
    }
}

sendButton.addEventListener('click', handleSendMessage);
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleSendMessage();
    }
});
