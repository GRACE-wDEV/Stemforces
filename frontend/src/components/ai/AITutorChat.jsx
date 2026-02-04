import { useState, useRef, useEffect } from "react";
import { chatWithTutor, breakdownConcept } from "../../api/ai";
import LaTeXRenderer from "../common/LaTeXRenderer";
import { useAuthStore } from "../../stores/authStore";

export default function AITutorChat() {
  const { isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey! 👋 I'm your AI tutor. Ask me anything about Math, Physics, Chemistry, or Biology. I can explain concepts, help you solve problems, or break down tough topics!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState({ subject: null, topic: null });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: input.trim() },
        { role: "assistant", content: "Please log in to chat with me! 🔐 I'll be here waiting to help you study.", isError: true },
      ]);
      setInput("");
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Check if it's a concept breakdown request
      const breakdownMatch = userMessage
        .toLowerCase()
        .match(/explain|what is|how does|break down|breakdown/);
      const subjectMatch = userMessage
        .toLowerCase()
        .match(/math|physics|chemistry|biology/);

      let response;

      if (breakdownMatch && subjectMatch) {
        response = await breakdownConcept(
          userMessage,
          subjectMatch[0],
          "intermediate"
        );
      } else {
        response = await chatWithTutor(userMessage, context);
      }

      if (response.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response.data.message },
        ]);

        // Update context if AI detected subject/topic
        if (response.data.detectedSubject) {
          setContext((prev) => ({
            ...prev,
            subject: response.data.detectedSubject,
          }));
        }
      } else {
        throw new Error(response.data?.message || response.message || "Failed to get response");
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: error.message || "Oops! I had a hiccup. Could you try asking again? 🤔",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "Explain quadratic equations",
    "What is Newton's 2nd law?",
    "How do chemical bonds form?",
    "Explain DNA replication",
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ai-tutor-button"
        aria-label="AI Tutor"
      >
        {isOpen ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
            <path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
            <path d="M19 11h2m-1 -1v2" />
          </svg>
        )}
        {!isOpen && <span className="ai-tutor-pulse" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="ai-tutor-window">
          <div className="ai-tutor-header">
            <div className="ai-tutor-header-info">
              <div className="ai-tutor-avatar">🤖</div>
              <div>
                <h3>AI Tutor</h3>
                <span className="ai-tutor-status">
                  <span className="status-dot" />
                  Always here to help
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="ai-tutor-close"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="ai-tutor-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`ai-message ${msg.role} ${
                  msg.isError ? "error" : ""
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="ai-message-avatar">🤖</div>
                )}
                <div className="ai-message-content">
                  <LaTeXRenderer text={msg.content} />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="ai-message assistant">
                <div className="ai-message-avatar">🤖</div>
                <div className="ai-message-content">
                  <div className="typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div className="ai-quick-prompts">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(prompt);
                  }}
                  className="quick-prompt-btn"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div className="ai-tutor-input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="send-btn"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22,2 15,22 11,13 2,9" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        .ai-tutor-button {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
          transition: all 0.3s ease;
          z-index: 1000;
        }

        .ai-tutor-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 25px rgba(99, 102, 241, 0.5);
        }

        .ai-tutor-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: var(--primary);
          animation: pulse 2s infinite;
          opacity: 0.4;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.2);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }

        .ai-tutor-window {
          position: fixed;
          bottom: 90px;
          right: 24px;
          width: 380px;
          max-height: 600px;
          background: var(--bg-primary);
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 1000;
          border: 1px solid var(--border-color);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .ai-tutor-header {
          padding: 16px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ai-tutor-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ai-tutor-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .ai-tutor-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .ai-tutor-status {
          font-size: 12px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          animation: blink 2s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .ai-tutor-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .ai-tutor-close:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .ai-tutor-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 350px;
        }

        .ai-message {
          display: flex;
          gap: 10px;
          max-width: 90%;
        }

        .ai-message.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .ai-message-avatar {
          width: 28px;
          height: 28px;
          background: var(--bg-secondary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }

        .ai-message-content {
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.5;
        }

        .ai-message.assistant .ai-message-content {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border-bottom-left-radius: 4px;
        }

        .ai-message.user .ai-message-content {
          background: var(--primary);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .ai-message.error .ai-message-content {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 4px 0;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: var(--text-secondary);
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .ai-quick-prompts {
          padding: 8px 16px 16px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .quick-prompt-btn {
          padding: 6px 12px;
          font-size: 11px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .quick-prompt-btn:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border-color: var(--primary);
        }

        .ai-tutor-input {
          padding: 12px 16px;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          display: flex;
          gap: 10px;
          align-items: flex-end;
        }

        .ai-tutor-input textarea {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 13px;
          resize: none;
          min-height: 40px;
          max-height: 100px;
          font-family: inherit;
        }

        .ai-tutor-input textarea:focus {
          outline: none;
          border-color: var(--primary);
        }

        .send-btn {
          width: 40px;
          height: 40px;
          background: var(--primary);
          border: none;
          border-radius: 10px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .send-btn:hover:not(:disabled) {
          background: var(--primary-hover);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .ai-tutor-window {
            width: calc(100vw - 32px);
            right: 16px;
            bottom: 80px;
            max-height: 70vh;
          }

          .ai-tutor-button {
            bottom: 16px;
            right: 16px;
          }
        }
      `}</style>
    </>
  );
}
