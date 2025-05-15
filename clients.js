// client.js
const chatOutput = document.getElementById('chat-output');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-btn');
const loadingIndicator = document.getElementById('loading-indicator');

// Histórico da conversa para enviar ao backend
let chatHistory = []; // Começa vazio

// // Comentado ou removido: Não adiciona a mensagem inicial do bot ao histórico programático
// const initialBotMessageElement = chatOutput.querySelector('.bot-message');
// if (initialBotMessageElement) {
//     chatHistory.push({ role: "model", parts: [{ text: initialBotMessageElement.textContent }] });
// }


// --- Adiciona mensagens na interface ---
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

// --- Envia mensagem ao backend e trata resposta ---
async function handleSendMessage() {
    const userMessage = messageInput.value.trim();
    if (!userMessage) return;

    addMessageToChat('user', userMessage);
    // O histórico enviado (historyToSend) NÃO deve incluir a mensagem atual do usuário,
    // ela é enviada separadamente no campo 'mensagem'.
    // O chatHistory aqui contém os turnos anteriores.
    const historyToSend = [...chatHistory];

    messageInput.value = '';
    loadingIndicator.style.display = 'block';
    sendButton.disabled = true;
    messageInput.disabled = true;

    try {
        console.log("Enviando para /chat:", { mensagem: userMessage, historico: historyToSend }); // Log para depuração
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mensagem: userMessage,    // Mensagem atual do usuário
                historico: historyToSend  // Histórico de conversas anteriores
            })
        });

        const data = await response.json();
        console.log("Recebido de /chat:", data); // Log para depuração

        if (!response.ok) {
            throw new Error(data.erro || `Erro HTTP: ${response.status}`);
        }

        // Atualiza o histórico local com o histórico completo retornado pelo servidor.
        // O histórico retornado pelo servidor já inclui a mensagem do usuário e a resposta do bot.
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
        chatOutput.scrollTop = chatOutput.scrollHeight;
    }
}

// --- Atalhos de envio ---
sendButton.addEventListener('click', handleSendMessage);
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleSendMessage();
    }
});

console.log("Client de autocuidado carregado com sucesso. Histórico inicial:", chatHistory);