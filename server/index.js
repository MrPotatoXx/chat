import express from 'express';
import dotenv from 'dotenv';
import logger from 'morgan';
import mysql from 'mysql2/promise';
import { Server } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';

dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  }
});

app.use(cors());
app.use(logger('dev'));

let db;

async function connectDB() {
  db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  await db.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      content TEXT,
      username TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  );
}

connectDB().catch(err => {
  console.error('Error connecting to the database', err);
  process.exit(1);
});

io.on('connection', (socket) => {
  console.log('a user connected');

  db.execute('SELECT id, content, username, timestamp FROM messages ORDER BY id DESC LIMIT 50')
    .then(([rows]) => {
      rows.reverse().forEach((message) => {
        socket.emit('chat message', { content: message.content, id: message.id.toString(), username: message.username, timestamp: message.timestamp });
      });
    })
    .catch(e => console.error('Error retrieving messages from database', e));

  socket.on('chat message', async ({ content, username }) => {
    try {
      const [result] = await db.execute('INSERT INTO messages (content, username) VALUES (?, ?)', [content, username]);
      const messageId = result.insertId;
      console.log('Message inserted with ID:', messageId);
      io.emit('chat message', { content, id: messageId.toString(), username, timestamp: new Date().toISOString() });
    } catch (e) {
      console.error('Error inserting message into database', e);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.get('/', (req, res) => {
  res.send('Chat Server is running');
});

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
