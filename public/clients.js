:root {
    --bg-main: #ffffff;
    --bg-sidebar: #f7f7f7;
    --text-primary: #1c1c1c;
    --text-secondary: #6b6b6b;
    --accent-primary: #ff69b4;
    --accent-secondary: #ff85c0;
    --border-color: #e0e0e0;
    --bot-message-bg: #f1f3f4;
    --user-message-bg: #ffe4e1;
    --user-message-text: #8B0000;
    --shadow-color: rgba(100, 100, 111, 0.1);
    --header-shadow: rgba(0, 0, 0, 0.05);
    --button-bg: #ffffff;
}
body.theme-dark {
    --bg-main: #1a1a2d;
    --bg-sidebar: #1e1e32;
    --text-primary: #f5f5f5;
    --text-secondary: #a0a0a0;
    --accent-primary: #f472b6;
    --accent-secondary: #ec4899;
    --border-color: #3a3a5a;
    --bot-message-bg: #2c2c4a;
    --user-message-bg: #3a2d4b;
    --user-message-text: #fbcfe8;
    --shadow-color: rgba(0, 0, 0, 0.2);
    --header-shadow: rgba(0, 0, 0, 0.2);
    --button-bg: #2c2c4a;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Manrope', sans-serif; background: var(--bg-main); color: var(--text-primary); display: flex; height: 100vh; overflow: hidden; }
#sidebar { width: 260px; background-color: var(--bg-sidebar); padding: 20px; border-right: 1px solid var(--border-color); flex-shrink: 0; display: flex; flex-direction: column; transition: transform 0.3s ease-in-out; }
#chat-area { flex-grow: 1; display: flex; flex-direction: column; height: 100vh; background: var(--bg-main); }
header { display: flex; align-items: center; padding: 12px 24px; border-bottom: 1px solid var(--border-color); box-shadow: 0 2px 5px var(--header-shadow); flex-shrink: 0; z-index: 10; background-color: var(--bg-sidebar); }
.header-title { flex-grow: 1; text-align: center; }
.header-title h1 { font-size: 18px; font-weight: 700; color: var(--accent-primary); }
.header-actions { display: flex; gap: 10px; }
.header-actions button { padding: 8px 14px; border-radius: 20px; border: 1px solid var(--border-color); background-color: var(--button-bg); cursor: pointer; font-weight: 600; }
#new-chat-btn { background-color: var(--accent-primary); color: white; border-color: var(--accent-primary); }
#chat-content { flex-grow: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; }
#welcome-screen { text-align: center; margin: auto; color: var(--text-secondary); }
.welcome-icon { font-size: 48px; }
#welcome-screen h2 { color: var(--accent-primary); margin: 16px 0; }
#welcome-screen p { max-width: 450px; line-height: 1.6; }
#suggestion-buttons { margin-top: 24px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.suggestion-btn { padding: 12px 20px; border-radius: 25px; border: 1px solid var(--accent-primary); background-color: transparent; color: var(--accent-primary); cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s ease-in-out; width: 80%; max-width: 350px; }
.suggestion-btn:hover { background-color: var(--accent-primary); color: white; }
#chat-output { display: flex; flex-direction: column; gap: 12px; }
.message { max-width: 75%; padding: 12px 18px; border-radius: 18px; line-height: 1.6; animation: fadeInUp 0.5s ease-out; }
.bot-message { background-color: var(--bot-message-bg); align-self: flex-start; border-bottom-left-radius: 4px; }
.user-message { background-color: var(--user-message-bg); color: var(--user-message-text); align-self: flex-end; border-bottom-right-radius: 4px; }
#typing-indicator { align-self: flex-start; margin-left: 10px; display: flex; padding: 10px 20px; }
#typing-indicator .dot { width: 8px; height: 8px; margin: 0 3px; background-color: #bdbdbd; border-radius: 50%; animation: blink 1.4s infinite both; }
#typing-indicator .dot:nth-child(2) { animation-delay: 0.2s; }
#typing-indicator .dot:nth-child(3) { animation-delay: 0.4s; }
#input-area { padding: 16px 24px; border-top: 1px solid var(--border-color); background-color: var(--bg-sidebar); display: flex; align-items: flex-start; gap: 12px; }
#message-input { flex-grow: 1; border: 1px solid var(--border-color); background-color: var(--bg-main); border-radius: 12px; padding: 12px 16px; font-size: 16px; resize: none; max-height: 150px; overflow-y: auto; }
#send-btn { width: 48px; height: 48px; border-radius: 12px; border: none; background-color: var(--accent-primary); cursor: pointer; display: flex; justify-content: center; align-items: center; flex-shrink: 0; }
#history-list { list-style: none; padding: 0; margin: 0; flex-grow: 1; overflow-y: auto; }
.history-item { padding: 12px; margin-bottom: 8px; background-color: var(--button-bg); border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; }
.history-item.active { background-color: var(--accent-primary); color: white; border-color: var(--accent-primary); }
.conversation-title { font-weight: 600; font-size: 14px; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.conversation-date { font-size: 12px; opacity: 0.8; }
.hidden { display: none !important; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes blink { 0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; } }
#menu-btn { display: none; font-size: 24px; background: transparent; border: none; color: var(--text-primary); cursor: pointer; margin-right: 16px; }
.sidebar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.sidebar-header h2 { margin: 0; }
#close-menu-btn { display: none; font-size: 28px; background: transparent; border: none; color: var(--text-primary); cursor: pointer; }
#overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 999; }

@media (max-width: 768px) {
    body { overflow: auto; }
    #sidebar { position: fixed; left: 0; top: 0; height: 100%; z-index: 1000; transform: translateX(-100%); }
    #sidebar.visible { transform: translateX(0); box-shadow: 4px 0px 15px rgba(0,0,0,0.2); }
    #chat-area { width: 100%; }
    #menu-btn, #close-menu-btn { display: block; }
}
/* Estilos para o Rodapé */
footer {
    text-align: center;
    padding: 10px;
    background-color: var(--bg-sidebar);
    border-top: 1px solid var(--border-color);
    font-size: 13px;
    color: var(--text-secondary);
    flex-shrink: 0;
}
