import { MessageCircle, X, Send } from "lucide-react";
import { useState } from "react";

export function ChatButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-all z-40 hover:scale-110"
      title="Chat với AI"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}

export function ChatBox({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Tôi là trợ lý AI của TechShop. Tôi có thể giúp gì cho bạn?",
      isBot: true,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  if (!isOpen) return null;

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
    };
    setMessages([...messages, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        text: "Cảm ơn bạn đã liên hệ! Đây là phiên bản demo. Trong thực tế, chatbot sẽ được tích hợp với AI để trả lời câu hỏi về sản phẩm, đơn hàng, và hỗ trợ khách hàng.",
        isBot: true,
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);

    setInputMessage("");
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold">TechShop AI</h3>
            <p className="text-xs opacity-90">Trợ lý ảo</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.isBot
                  ? "bg-gray-100 text-gray-900"
                  : "bg-red-600 text-white"
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
          />
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
