import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

function Chat() {
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [username, setUsername] = useState('');
  const [currentRoom, setCurrentRoom] = useState('general');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [rooms] = useState(['general', 'tech', 'random']);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      setIsUsernameSet(true);
      socket.emit('join room', 'general');
    }

    const chatMessageHandler = (msg) => {
      setMessages((msgs) => [...msgs, msg]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    socket.on('chat message', chatMessageHandler);

    return () => {
      socket.off('chat message', chatMessageHandler);
    };
  }, []);

  useEffect(() => {
    if (currentRoom && isUsernameSet) {
      setMessages([]);
      socket.emit('join room', currentRoom);
    }
  }, [currentRoom, isUsernameSet]);

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    const enteredUsername = e.target.username.value;
    setUsername(enteredUsername);
    localStorage.setItem('username', enteredUsername);
    setIsUsernameSet(true);
    socket.emit('join room', 'general');
  };

  const handleRoomSelection = (e) => {
    const selectedRoom = e.target.value;
    if (currentRoom) {
      socket.emit('leave room', currentRoom);
    }
    setCurrentRoom(selectedRoom);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && isUsernameSet && currentRoom) {
      socket.emit('chat message', { content: message, username, roomName: currentRoom });
      setMessage('');
    }
  };

  if (!isUsernameSet) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-800">
        <form onSubmit={handleUsernameSubmit} className="bg-gray-900 p-6 rounded shadow-md">
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-800">
      <div className="mb-4">
        <label htmlFor="roomSelection" className="text-white mr-2">Selecciona una sala:</label>
        <select name="rooms" id="roomSelection" onChange={handleRoomSelection} value={currentRoom} className="bg-gray-900 text-white p-2 rounded">
          {rooms.map((room, index) => (
            <option key={index} value={room}>{room}</option>
          ))}
        </select>
      </div>
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-white mb-4">Sala: {currentRoom}</h1>
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
