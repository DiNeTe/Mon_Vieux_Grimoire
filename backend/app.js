const express = require("express");
const cors = require('cors');
const mongoose = require("mongoose");
const path = require('path');

const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

// Connection mongoDB
mongoose
  .connect(
    "mongodb+srv://dinete:FAGZFlj6HHgi0hoR@cluster0.8rqtcdi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

  // configuration Cross-Origin Resource Sharing
  const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Permet les cookies CORS
    optionsSuccessStatus: 200 // Pour IE11
  };

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
