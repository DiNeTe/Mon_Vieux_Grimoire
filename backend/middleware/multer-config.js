const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// types MIME autorisés
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, callback) => {
    const isValid = !!MIME_TYPES[file.mimetype];
    let error = isValid ? null : new Error("Type de fichier non autorisé");
    callback(error, isValid);
  },
}).single("image");

module.exports = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return next();
    }
    // construction du nom du fichier
    const name = req.file.originalname.split(".")[0].replace(/\s+/g, "_");
    const filename = `${name}_${Date.now()}.webp`;
    const outputPath = path.join(__dirname, "../images", filename);

    sharp(req.file.buffer)
      .webp({ quality: 80 }) // WebP avec une qualité de 80%
      .toBuffer((err, buffer, info) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (info.size > 512 * 512) {
          // Si l'image est plus grande que 512x512
          sharp(buffer)
            .resize({ width: 512, withoutEnlargement: true }) // Redimensionne seulement si plus large que 1920px
            .webp({ quality: 70 })
            .toFile(outputPath, (err, info) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }

              req.file.filename = filename;
              next();
            });
        } else {
          sharp(buffer)
            .webp({ quality: 80 })
            .toFile(outputPath, (err, info) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }

              req.file.filename = filename;
              next();
            });
        }
      });
  });
};
