// src/components/ChatApp.jsx
import React, { useState } from "react";
import axios from "axios"; // Import axios for HTTP requests
import "./ChatApp.css"; // Import your CSS file

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    // Add user's message to the chat
    const userMessage = { text: userInput, sender: "user" };
    setMessages([...messages, userMessage]);

    try {
      // Send request to Flask API
      const response = await axios.post("http://localhost:5000/chat", {
        question: userInput, // This matches Flask's expected key
      });
      

      // Add bot's reply
      const botMessage = { text: response.data.reply, sender: "bot" };

      // Add bot's reply after 1 second delay
      setTimeout(() => {
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      }, 1000);
    } catch (error) {
      console.error("Error connecting to the Flask backend:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Error communicating with the server.", sender: "bot" },
      ]);
    }

    setUserInput(""); // Clear input field after message is sent
  };

  return (
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
      </div>
      <input
        type="text"
        id="user-input"
        placeholder="Ask something..."
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
      <br />
      <br />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatApp;
