const express = require("express");
const cors = require('cors');
const mongoose = require("mongoose");
const path = require('path');

const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

const Book = require('./models/Book')

mongoose
  .connect(
    "mongodb+srv://dinete:FAGZFlj6HHgi0hoR@cluster0.8rqtcdi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

  const app = express();

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
app.use(cors());

app.use(express.json());

app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
