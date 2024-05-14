const mongoose = require('mongoose');
const Book = require('../models/Book');

mongoose
  .connect(
    "mongodb+srv://dinete:FAGZFlj6HHgi0hoR@cluster0.8rqtcdi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    { useNewUrlParser: true, useUnifiedTopology: true 
}).then(() => {
    console.log("Connexion à MongoDB réussie !");
    const book = new Book({
      userId: '66421e5ce8c5005b7c53f555',  // Remplacer par un ObjectId valide
      title: 'Exemple de Titre',
      author: 'Auteur Exemple',
      year: 2021,
      genre: 'Fiction',
      imageUrl: 'http://example.com/image.jpg'
    });
  
    book.save().then(doc => {
      console.log('Livre sauvegardé avec succès:', doc);
      mongoose.disconnect();
    }).catch(err => {
      console.error('Erreur lors de la sauvegarde du livre:', err);
      mongoose.disconnect();
    });
  }).catch(err => {
    console.error('Connexion à MongoDB échouée:', err);
  });