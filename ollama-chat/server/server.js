require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const chatRoutes = require('./routes/chat.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api', chatRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const ollamaService = require('./services/ollama.service');

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Preload the default model into memory for faster initial response
  ollamaService.preloadModel('llama3.2:latest');
});
