document.addEventListener('DOMContentLoaded', () => {
    const chatOutput = document.getElementById('chat-output');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-btn');
    const newChatButton = document.getElementById('new-chat-btn');
    const welcomeScreen = document.getElementById('welcome-screen');
    const dicaButton = document.getElementById('dica-btn');
    const aboutButton = document.getElementById('about-btn');
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const typingIndicator = document.getElementById('typing-indicator');
    const historyList = document.getElementById('history-list');
    const suggestionButtons = document.querySelectorAll('.suggestion-btn');
    const sidebar = document.getElementById('sidebar');
    const menuButton = document.getElementById('menu-btn');
    const closeMenuButton = document.getElementById('close-menu-btn');
    const overlay = document.getElementById('overlay');

    let chatHistory = [];
    let conversationHistory = [];
    let currentConversationId = null;

    const loadConversationHistory = () => {
        const saved = localStorage.getItem('chatbot-conversations');
        if (saved) {
            conversationHistory = JSON.parse(saved);
            updateHistoryList();
        }
    };

    const saveConversationHistory = () => {
        localStorage.setItem('chatbot-conversations', JSON.stringify(conversationHistory));
    };

    const generateConversationId = () => 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    const createNewConversation = () => {
        currentConversationId = generateConversationId();
        const firstMessage = chatHistory[0]?.parts[0]?.text || 'Nova conversa';
        const conversation = {
            id: currentConversationId,
            title: firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : ''),
            messages: [...chatHistory],
            timestamp: new Date().toISOString()
        };
        conversationHistory.unshift(conversation);
        saveConversationHistory();
        updateHistoryList();
    };

    const updateCurrentConversation = () => {
        if (!currentConversationId) return;
        const conversationIndex = conversationHistory.findIndex(conv => conv.id === currentConversationId);
        if (conversationIndex !== -1) {
            conversationHistory[conversationIndex].messages = [...chatHistory];
            conversationHistory[conversationIndex].timestamp = new Date().toISOString();
            saveConversationHistory();
        }
    };

    const loadConversation = (conversationId) => {
        const conversation = conversationHistory.find(conv => conv.id === conversationId);
        if (!conversation) return;
        currentConversationId = conversationId;
        chatHistory = [...conversation.messages];
        chatOutput.innerHTML = '';
        if (chatHistory.length > 0) {
            showChatInterface();
            chatHistory.forEach(message => {
                const sender = message.role === 'user' ? 'user' : 'bot';
                addMessageToChat(sender, message.parts[0].text, false);
            });
        } else {
            showWelcomeScreen();
        }
        updateHistoryList();
    };

    const updateHistoryList = () => {
        historyList.innerHTML = '';
        conversationHistory.forEach(conversation => {
            const listItem = document.createElement('li');
            listItem.className = 'history-item';
            if (conversation.id === currentConversationId) {
                listItem.classList.add('active');
            }
            const date = new Date(conversation.timestamp).toLocaleDateString('pt-BR');
            listItem.innerHTML = `<div class="conversation-title">${conversation.title}</div><div class="conversation-date">${date}</div>`;
            listItem.addEventListener('click', () => {
                loadConversation(conversation.id);
                closeSidebar();
            });
            historyList.appendChild(listItem);
        });
    };
    
    const showWelcomeScreen = () => {
        chatOutput.classList.add('hidden');
        welcomeScreen.classList.remove('hidden');
    };

    const showChatInterface = () => {
        welcomeScreen.classList.add('hidden');
        chatOutput.classList.remove('hidden');
    };

    const addMessageToChat = (sender, text, shouldSave = true) => {
        showChatInterface();
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = text;
        chatOutput.appendChild(messageDiv);
        chatOutput.scrollTop = chatOutput.scrollHeight;
        if (shouldSave) {
            updateCurrentConversation();
        }
    };

    const toggleLoading = (isLoading) => {
        [sendButton, dicaButton, aboutButton, newChatButton, ...suggestionButtons].forEach(button => button.disabled = isLoading);
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

    const handleSendMessage = async () => {
        const userMessage = messageInput.value.trim();
        if (!userMessage) return;
        if (!currentConversationId) {
            chatHistory.push({ role: "user", parts: [{ text: userMessage }] });
            createNewConversation();
        } else {
            chatHistory.push({ role: "user", parts: [{ text: userMessage }] });
        }
        addMessageToChat('user', userMessage);
        messageInput.value = '';
        autoResizeTextarea();
        toggleLoading(true);
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
            if(chatHistory.length > 0) chatHistory.pop();
        } finally {
            toggleLoading(false);
        }
    };

    const handleDicaDoDia = async () => {
        addMessageToChat('bot', `💡 Gerando uma nova dica para você...`);
        toggleLoading(true);
        try {
            const response = await fetch('/api/dica-do-dia');
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            chatOutput.lastChild.textContent = `💡 ${data.dica}`;
        } catch (error) {
            chatOutput.lastChild.textContent = 'Ops, não consegui buscar sua dica agora.';
        } finally {
            toggleLoading(false);
        }
    };

    const showAboutInfo = () => {
        addMessageToChat('bot', "Sou o Chatbot de Autocuidado 💖, seu assistente pessoal para o bem-estar. Fui criado para te oferecer um espaço seguro para conversar, relaxar e encontrar dicas que tornem seu dia mais leve.");
    };

    const startNewChat = () => {
        chatHistory = [];
        currentConversationId = null;
        chatOutput.innerHTML = '';
        showWelcomeScreen();
        messageInput.focus();
        updateHistoryList();
        closeSidebar();
    };

    const toggleTheme = () => {
        const body = document.body;
        body.classList.toggle('theme-dark');
        const isDarkMode = body.classList.contains('theme-dark');
        themeToggleButton.textContent = isDarkMode ? '☀️' : '🌙';
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    };

    const handleSuggestionClick = (event) => {
        messageInput.value = event.target.textContent;
        handleSendMessage();
    };

    const openSidebar = () => {
        sidebar.classList.add('visible');
        overlay.classList.remove('hidden');
    };

    const closeSidebar = () => {
        sidebar.classList.remove('visible');
        overlay.classList.add('hidden');
    };

    // --- INICIALIZAÇÃO E OUVINTES DE EVENTOS ---
    loadConversationHistory();
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('theme-dark');
        themeToggleButton.textContent = '☀️';
    } else {
        themeToggleButton.textContent = '🌙';
    }

    sendButton.addEventListener('click', handleSendMessage);
    newChatButton.addEventListener('click', startNewChat);

    // --- OUVINTES ATUALIZADOS ---
    dicaButton.addEventListener('click', () => {
        handleDicaDoDia();
        closeSidebar(); // Fecha o menu
    });
    aboutButton.addEventListener('click', () => {
        showAboutInfo();
        closeSidebar(); // Fecha o menu
    });

    themeToggleButton.addEventListener('click', toggleTheme);
    messageInput.addEventListener('input', autoResizeTextarea);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    suggestionButtons.forEach(button => button.addEventListener('click', handleSuggestionClick));
    menuButton.addEventListener('click', openSidebar);
    closeMenuButton.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);
});
