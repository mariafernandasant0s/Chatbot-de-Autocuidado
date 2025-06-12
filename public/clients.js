const backendURL = "https://chatbot-de-autocuidado.onrender.com/chat";

const chatOutput = document.getElementById('chat-output');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-btn');
const loadingIndicator = document.getElementById('loading-indicator');

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

  messageInput.value = '';
  loadingIndicator.style.display = 'block';
  sendButton.disabled = true;
  messageInput.disabled = true;

  try {
    const response = await fetch(backendURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagem: userMessage })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`O servidor respondeu com um erro: ${response.status}. Resposta: ${errorText}`);
    }

    const data = await response.json();
    addMessageToChat('bot', data.resposta);

  } catch (error) {
    addMessageToChat('system', `⚠️ Erro: ${error.message}`, 'error-message');
  } finally {
    loadingIndicator.style.display = 'none';
    sendButton.disabled = false;
    messageInput.disabled = false;
    messageInput.focus();
  }
}

// Evento do botão enviar
sendButton.addEventListener('click', handleSendMessage);

// Enviar mensagem com tecla Enter
messageInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleSendMessage();
  }
});
