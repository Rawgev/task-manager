require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const rateLimit = require('express-rate-limit');

const app = express();
const allowedOrigins = process.env.CLIENT_ORIGIN
  ?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const corsOptions = {
  origin: allowedOrigins?.length ? allowedOrigins : '*',
};
const server = http.createServer(app);
const io = new Server(server, {
  cors: { ...corsOptions, methods: ['GET', 'POST'] }
});

// Connect DB
connectDB();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Attach io to request
app.use((req, _res, next) => { req.io = io; next(); });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/users', require('./routes/users'));
app.use('/api/logs', require('./routes/logs'));

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join', (userId) => socket.join(userId));
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Health check
app.get('/', (_req, res) => res.json({ status: 'Task Manager API running' }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
