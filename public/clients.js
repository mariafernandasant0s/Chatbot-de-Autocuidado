const backendURL = "https://chatbot-de-autocuidado.onrender.com/chat";

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
