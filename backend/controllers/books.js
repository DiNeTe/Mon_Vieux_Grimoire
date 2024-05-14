const Book = require("../models/Book");
const fs = require("fs");

// Crud Create one book
exports.createBook = (req, res, next) => {
  console.log("req.file :", req.file); // Vérifie que le fichier est bien attaché
  console.log("req.body :", req.body); // Vérifie le corps de la requête

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

      // verification si une note à déjà été attribuée par cet utilisateur
      const userRating = book.ratings.find(
        (rating) => rating.userId == req.auth.userId
      );
      if (!userRating) {
        book.ratings.push({ userId, grade });
      } else {
        res.status(404).json({ error });
      }

      console
        .log("Livre trouvé:", book)
        .log("Corps de la requête:", req.body)
        .log("Note de l'utilisateur:", userRating)
        .log("Note moyenne avant:", book.averageRating)
        .log("nombre de note avant:", book.ratings.length);

      // Recalcul de la note moyenne
      book.averageRating =
        book.ratings.reduce((acc, curr) => acc + curr.grade, 0) /
        book.ratings.length;
      console.log("Note moyenne après:", book.averageRating);
      console.log("nombre de note après:", book.ratings.length);

      book
        .save()
        .then(() => {
          console.log("Nouvelle note enregistrée");
          res.status(200).json({ message: "Note ajoutée" });
        })
        .catch(() => {
          console.error("Erreur lors de la sauvegarde du livre:");
          res.status(500).json({ error });
        });
    })
    .catch(() => {
      console.error("Erreur lors de la recherche du livre:");
      res.status(500).json({ error });
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
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => {
      if (books.length) {
        res.status(200).json(books);
      } else {
        res.status(404).json({ error });
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
