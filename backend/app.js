const express = require("express");
const cors = require('cors');
const mongoose = require("mongoose");
const path = require('path');

const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

mongoose
  .connect(
    "mongodb+srv://dinete:FAGZFlj6HHgi0hoR@cluster0.8rqtcdi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

  
  const app = express();

  const corsOptions = {
    origin: 'http://localhost:3000', // ou '*' pour permettre toutes les origines
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Permet les cookies CORS
    optionsSuccessStatus: 200 // Certains navigateurs (IE11, divers SmartTVs) chokent sur 204
  };

// Middleware
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, DELETE, PATCH, OPTIONS"
//   );
//   next();
// });

// Middleware CORS
// app.use(cors());
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
