const Book = require("../models/Book");
const { fakeBooks } = require("../fakeDb/fakeBooks");

exports.createBook = (req, res, next) => {
  console.log("req.file :", req.file); // Vérifie que le fichier est bien attaché
  console.log("req.body :", req.body); // Vérifie le corps de la requête

  if (!req.file) {
    console.log("Aucun fichier détecté dans la requête");
    return res.status(400).json({ message: "Aucune image fournie" });
  }

  try {
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
        res
          .status(201)
          .json({ message: "Livre enregistré !", bookId: book._id })
      )
      .catch((error) => res.status(400).json({ error }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
  // res.send(fakeBooks);
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(404).json({ error }));
};

exports.updateBook = (req, res, next) => {
  Book.updateOne({ _id: req.params.id }, { ...req.body, id: req.params.id })
    .then(() => res.status(200).json({ message: "Livre modifié" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteBook = (req, res, next) => {
  Book.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: "Livre supprimé" }))
    .catch((error) => res.status(400).json({ error }));
};
