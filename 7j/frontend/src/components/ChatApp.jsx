import React, { useState, useRef } from "react";
import axios from "axios";
import "./ChatApp.css";

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const stopTypingRef = useRef(false); // Use ref to handle immediate checks
  const typingTimeoutRef = useRef(null); // Store timeout reference

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { text: userInput, sender: "user" };
    setMessages([...messages, userMessage]);

    setIsTyping(true);
    stopTypingRef.current = false;

    try {
      const response = await axios.post("http://localhost:5000/chat", {
        question: userInput,
      });

      const botReply = response.data.reply;
      typeBotMessage(botReply);
    } catch (error) {
      console.error("Error connecting to the Flask backend:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Error communicating with the server.", sender: "bot" },
      ]);
      setIsTyping(false);
    }

    setUserInput("");
  };

  const typeBotMessage = (message) => {
    let currentText = "";
    const interval = 15;
    let index = 0;

    const typeCharacter = () => {
      if (stopTypingRef.current) {
        // Stop typing immediately
        clearTimeout(typingTimeoutRef.current);
        setIsTyping(false);
        return;
      }

      if (index < message.length) {
        currentText += message[index];
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1),
          { text: currentText, sender: "bot" },
        ]);
        index++;
        typingTimeoutRef.current = setTimeout(typeCharacter, interval);
      } else {
        setIsTyping(false); // Finish typing
      }
    };

    typeCharacter();
  };

  const handleStopTyping = () => {
    stopTypingRef.current = true; // Set the ref to stop typing
    clearTimeout(typingTimeoutRef.current); // Clear the timeout immediately
    setIsTyping(false); // Update UI state
  };

  return (
      <body>
  <header className="app-header">
      <button className="btheader"> 7 JUNE</button>
      
  </header>
    
    <div className="app-container">
     
      <div className="video-background">
        <video autoPlay muted loop>
          <source src="" type="video/mp4" />
        </video>
      </div>

      <div className="chat-container">
        <div id="chat-box">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={msg.sender === "user" ? "user-message" : "bot-message"}
            >
              {msg.text}
            </div>
          ))}
          {isTyping && <div className="typing-indicator">Typing...</div>}
        </div>
        <div className="x">
          <input
            type="text"
            id="user-input"
            placeholder="Ask something..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          {!isTyping ? (
            <img
              src="/send.png"
              alt="Send"
              className="send-button"
              onClick={sendMessage}
            />
          ) : (
            <img
              src="/stopsend.png"
              alt="Stop Typing"
              className="stop-button"
              onClick={handleStopTyping}
            />
          )}
        </div>
      </div>
    </div>
    <footer className="app-footer">
    <p>&copy; 2025 seven june. All rights reserved.</p>
    <p>
      Follow us on 
      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"> Facebook</a>, 
      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"> Twitter</a>, 
      and <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>.
    </p>
  </footer>
    </body>
  );
};

export default ChatApp;
