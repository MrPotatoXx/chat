import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000'); // Asegúrate de ajustar la URL según tu configuración

function Chat() {
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      setIsUsernameSet(true);
    }

    socket.on('chat message', (msg) => {
      setMessages((msgs) => [...msgs, msg]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    return () => socket.off('chat message');
  }, []);

  const handleUsernameSubmit = (e, enteredUsername) => {
    e.preventDefault();
    setUsername(enteredUsername);
    localStorage.setItem('username', enteredUsername);
    setIsUsernameSet(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && isUsernameSet) {
      socket.emit('chat message', { content: message, username });
      setMessage('');
    }
  };

  if (!isUsernameSet) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-800">
        <form onSubmit={(e) => handleUsernameSubmit(e, e.target.username.value)} className="bg-gray-900 p-6 rounded shadow-md">
          <label htmlFor="username" className="text-white block mb-2">Introduce tu nombre de usuario:</label>
          <input
            id="username"
            name="username"
            type="text"
            className="text-black mb-4 p-2 w-full"
            required
          />
          <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full">
            Ingresar al Chat
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 min-h-screen flex items-center justify-center p-6">
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-white mb-4">Chat</h1>
        <ul className="overflow-auto h-96 bg-gray-800 p-4 rounded-lg mb-4">
          {messages.map((msg, index) => (
            <li key={index} className={`mb-2 flex ${msg.username === username ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-2 rounded-lg ${msg.username === username ? 'bg-blue-500' : 'bg-gray-700'}`}>
                <p className="text-sm text-gray-300">{msg.username}</p>
                <p className="text-white">{msg.content}</p>
              </div>
            </li>
          ))}
          <div ref={messagesEndRef} />
        </ul>
        <form className="flex gap-2" onSubmit={handleSubmit}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe tu mensaje aquí"
            autoComplete="off"
            className="flex-1 p-2 rounded outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
