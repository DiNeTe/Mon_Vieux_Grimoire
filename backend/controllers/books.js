const Book = require("../models/Book");
const fs = require("fs");

// Crud Create one book
exports.createBook = (req, res, next) => {
  console.log("req.file :", req.file);
  console.log("req.body :", req.body);

  const bookObject = JSON.parse(req.body.book);
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    // construction de URL de l'image
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  book
    .save()
    .then(() =>
      res.status(201).json({ message: "Livre enregistré !", bookId: book._id })
    )
    .catch((error) => res.status(400).json({ error }));
};

// Crud Create one grade
exports.ratingOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }

      const grade = req.body.rating;
      const userId = req.auth.userId;

      // Vérification si la note est entre 1 et 5
      if (grade < 1 || grade > 5) {
        return res.status(400).json({ message: "La note doit être entre 1 et 5" });
      }

      // Vérification si une note a déjà été attribuée par cet utilisateur
      const userRating = book.ratings.find(
        (rating) => rating.userId == req.auth.userId
      );

      if (!userRating) {
        book.ratings.push({ userId, grade });
      } else {
        return res.status(400).json({ message: "Vous avez déjà noté ce livre" });
      }

      // Recalcul de la note moyenne
      book.averageRating =
        book.ratings.reduce((total, rating) => total + rating.grade, 0) /
        book.ratings.length;

      // Sauvegarder le livre mis à jour et renvoyer le livre mis à jour avec un message
      return book.save()
        .then((updatedBook) => {
          res.status(200).json({ book: updatedBook, message: "Note ajoutée" });
        });
    })
    .catch((error) => {
      console.error("Erreur lors de la sauvegarde du livre", error);
      res.status(500).json({ error: "Erreur lors de la sauvegarde du livre" });
    });
};


// cRud Read all
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// cRud Read one
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(404).json({ error }));
};

// cRud Read best average rating
exports.bestRating = (req, res, next) => {
  Book.find()
    // tri des livres par note moyenne décroissante
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => {
      if (books.length) {
        res.status(200).json(books);
      } else {
        res.status(404).json({ message: "Aucun livre trouvé" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// crUd Update
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id }).then((book) => {
    if (book.userId != req.auth.userId) {
      res.status(403).json({ message: "unauthorized request" });
    } else {
      Book.updateOne(
        { _id: req.params.id },
        { ...bookObject, _id: req.params.id }
      )
        .then(() => res.status(200).json({ message: "Livre modifié" }))
        .catch((error) => res.status(401).json({ error }));
    }
  });
};

// cruD Delete
exports.deleteBook = (req, res, next) => {
  console.log("Requête reçue avec l'id:", req.params.id);
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      console.log("Livre trouvé:", book);
      console.log(
        "ID de l'utilisateur:",
        book.userId.toString(),
        "auth userid :",
        req.auth.userId
      );
      if (book.userId.toString() != req.auth.userId) {
        res.status(403).json({ message: "unauthorized request" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        // La méthode unlink() du package fs permet de supprimer un fichier du système de fichiers.
        fs.unlink(`images/${filename}`, () => {
          book
            .deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "livre supprimé" });
            })
            .catch((error) => {
              res.status(401).json({ error });
            });
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};
