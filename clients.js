document.addEventListener('DOMContentLoaded', () => {
    // Referências a todos os elementos da interface
    const chatOutput = document.getElementById('chat-output');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-btn');
    const newChatButton = document.getElementById('new-chat-btn');
    const welcomeScreen = document.getElementById('welcome-screen');
    const dicaButton = document.getElementById('dica-btn');
    const aboutButton = document.getElementById('about-btn');
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const typingIndicator = document.getElementById('typing-indicator');

    let chatHistory = [];

    // --- FUNÇÕES DE INTERFACE ---
    const showChatInterface = () => {
        welcomeScreen.classList.add('hidden');
        chatOutput.classList.remove('hidden');
    };

    const addMessageToChat = (sender, text) => {
        showChatInterface();
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = text;
        chatOutput.appendChild(messageDiv);
        chatOutput.scrollTop = chatOutput.scrollHeight;
    };

    const toggleLoading = (isLoading) => {
        const buttons = [sendButton, dicaButton, aboutButton, newChatButton];
        buttons.forEach(button => button.disabled = isLoading);
        messageInput.disabled = isLoading;
        if (isLoading) {
            typingIndicator.classList.remove('hidden');
        } else {
            typingIndicator.classList.add('hidden');
            messageInput.focus();
        }
    };

    const autoResizeTextarea = () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = `${messageInput.scrollHeight}px`;
    };

    // --- FUNÇÕES DE AÇÃO ---
    const handleSendMessage = async () => {
        const userMessage = messageInput.value.trim();
        if (!userMessage) return;
        
        addMessageToChat('user', userMessage);
        messageInput.value = '';
        autoResizeTextarea();
        toggleLoading(true);

        chatHistory.push({ role: "user", parts: [{ text: userMessage }] });

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensagem: userMessage, historico: chatHistory.slice(0, -1) })
            });
            if (!response.ok) throw new Error('Falha na resposta do servidor');
            
            const data = await response.json();
            chatHistory.push({ role: "model", parts: [{ text: data.resposta }] });
            addMessageToChat('bot', data.resposta);
        } catch (error) {
            console.error("Erro ao conversar:", error);
            addMessageToChat('bot', 'Desculpe, ocorreu um erro na comunicação.');
            chatHistory.pop(); // Remove a mensagem do usuário do histórico se falhar
        } finally {
            toggleLoading(false);
        }
    };

    const handleDicaDoDia = async () => {
        toggleLoading(true);
        try {
            const response = await fetch('/api/dica-do-dia');
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            addMessageToChat('bot', `💡 ${data.dica}`);
        } catch (error) {
            console.error("Erro ao buscar dica:", error);
            addMessageToChat('bot', 'Ops, não consegui buscar sua dica agora.');
        } finally {
            toggleLoading(false);
        }
    };
    
    const showAboutInfo = () => {
        const aboutText = "Sou o Chatbot de Autocuidado 💖, seu assistente pessoal para o bem-estar. Fui criado com a tecnologia de IA do Google para te oferecer um espaço seguro para conversar, relaxar e encontrar dicas que tornem seu dia mais leve.";
        addMessageToChat('bot', aboutText);
    };

    const startNewChat = () => {
        chatHistory = [];
        chatOutput.innerHTML = '';
        chatOutput.classList.add('hidden');
        welcomeScreen.classList.remove('hidden');
        messageInput.focus();
    };

    const toggleTheme = () => {
        const body = document.body;
        body.classList.toggle('theme-dark');
        const isDarkMode = body.classList.contains('theme-dark');
        themeToggleButton.textContent = isDarkMode ? '☀️' : '🌙';
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    };

    // --- INICIALIZAÇÃO E OUVINTES DE EVENTOS ---
    if (localStorage.getItem('theme') === 'dark') {
        toggleTheme();
    }
    
    sendButton.addEventListener('click', handleSendMessage);
    newChatButton.addEventListener('click', startNewChat);
    dicaButton.addEventListener('click', handleDicaDoDia);
    aboutButton.addEventListener('click', showAboutInfo);
    themeToggleButton.addEventListener('click', toggleTheme);
    messageInput.addEventListener('input', autoResizeTextarea);
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    });
});