const chatOutput = document.getElementById('chat-output');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-btn');
const loadingIndicator = document.getElementById('loading-indicator');

let chatHistory = [];

// Pega a mensagem inicial do bot, se existir, e adiciona ao histórico
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
        const response = await fetch("https://chatbot-de-autocuidado.onrender.com/chat", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mensagem: userMessage,
                historico: historyToSend
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`O servidor respondeu com um erro: ${response.status}. Resposta: ${errorText}`);
        }

        const data = await response.json();
        chatHistory = data.historico; // atualiza o histórico com o que o servidor retornou
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
        event.preventDefault();
        handleSendMessage();
    }
});
