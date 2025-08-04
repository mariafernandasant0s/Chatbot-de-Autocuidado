const chatOutput = document.getElementById('chat-output');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-btn');
const loadingIndicator = document.getElementById('loading-indicator');

let chatHistory = []; // O histórico agora começa vazio, que é o correto.

// O bloco que adicionava a mensagem inicial foi removido.

function addMessageToChat(sender, text, cssClass = '') {
    // ... o resto do código continua igual
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    if (cssClass) messageDiv.classList.add(cssClass);
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
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mensagem: userMessage,
                historico: historyToSend
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`O servidor respondeu com erro ${response.status}: ${errorText}`);
        }

        const data = await response.json();
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
        event.preventDefault();
        handleSendMessage();
    }
});
