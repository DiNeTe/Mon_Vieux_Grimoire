const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const bookCtrl = require("../controllers/books");

router.get("/bestrating", bookCtrl.bestRating);
router.post("/:id/rating",auth, bookCtrl.ratingOneBook);

router.get("/", bookCtrl.getAllBooks);
router.post("/", auth, multer, bookCtrl.createBook);
router.get("/:id", bookCtrl.getOneBook);
router.put("/:id", auth, multer, bookCtrl.modifyBook);
router.delete("/:id", auth, multer, bookCtrl.deleteBook);

module.exports = router;
