// clients.js
const chatOutput = document.getElementById('chat-output');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-btn');
const loadingIndicator = document.getElementById('loading-indicator');

let chatHistory = [];

// Captura a mensagem inicial do bot no HTML para adicionar ao histórico
const initialBotMessage = chatOutput.querySelector('.bot-message');
if (initialBotMessage) {
    chatHistory.push({ role: "model", parts: [{ text: initialBotMessage.textContent.trim() }] });
}

function addMessageToChat(sender, text, cssClass = '') {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    if (cssClass) {
        messageDiv.classList.add(cssClass);
    }
    messageDiv.textContent = text;
    chatOutput.appendChild(messageDiv);
    chatOutput.scrollTop = chatOutput.scrollHeight;
}

async function handleSendMessage() {
    const userMessage = messageInput.value.trim();
    if (!userMessage) return;

    addMessageToChat('user', userMessage);

    const historyToSend = [...chatHistory];

    messageInput.value = '';
    loadingIndicator.style.display = 'block';
    sendButton.disabled = true;
    messageInput.disabled = true;

    try {
        // Usa uma URL relativa '/chat'. Funciona localmente e no Render.
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mensagem: userMessage,
                historico: historyToSend
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.erro || `Erro HTTP: ${response.status}`);
        }

        // O servidor retorna o histórico completo e atualizado.
        chatHistory = data.historico;
        addMessageToChat('bot', data.resposta);

    } catch (error) {
        console.error("Erro ao conversar com o bot:", error);
        addMessageToChat('system', `⚠️ Erro: ${error.message}`, 'error-message');
    } finally {
        loadingIndicator.style.display = 'none';
        sendButton.disabled = false;
        messageInput.disabled = false;
        messageInput.focus();
    }
}

sendButton.addEventListener('click', handleSendMessage);
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Evita que a página recarregue
        handleSendMessage();
    }
});