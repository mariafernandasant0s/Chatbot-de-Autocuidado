document.getElementById("send-btn").addEventListener("click", enviarMensagem);

async function enviarMensagem() {
  const userInput = document.getElementById("user-input").value;
  const outputDiv = document.getElementById("chat-log");

  if (!userInput.trim()) {
    outputDiv.innerHTML += `<div class="message bot-message">⚠️ Por favor, escreva algo!</div>`;
    return;
  }

  outputDiv.innerHTML += `<div class="message user-message">${userInput}</div>`;
  document.getElementById("user-input").value = ""; // Limpa o campo de input
  outputDiv.scrollTop = outputDiv.scrollHeight; // Faz o scroll para a última mensagem

  // Exibindo "Aguardando..." antes de chamar a API
  outputDiv.innerHTML += `<div class="message bot-message"> Preparando sua resposta... .˚◦○🫧 🛁˚○•</div>`;
  outputDiv.scrollTop = outputDiv.scrollHeight; // Faz o scroll para a última mensagem

  // Enviando a mensagem para o servidor
  try {
    const response = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: userInput }),
    });

    const data = await response.json();

    // Remover a mensagem "Aguardando..."
    const aguardandoMsg = outputDiv.querySelector(".bot-message");
    if (aguardandoMsg) aguardandoMsg.remove();

    if (data.result) {
      outputDiv.innerHTML += `<div class="message bot-message">${data.result}</div>`;
    } else {
      outputDiv.innerHTML += `<div class="message bot-message">⚠️ Não consegui entender, tente novamente!</div>`;
    }
  } catch (error) {
    outputDiv.innerHTML += `<div class="message bot-message">❌ Erro ao conectar com o servidor.</div>`;
    console.error("Erro ao enviar mensagem:", error);
  }

  outputDiv.scrollTop = outputDiv.scrollHeight; // Faz o scroll para a última mensagem
}
