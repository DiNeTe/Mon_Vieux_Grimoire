const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        console.log("Reception d'un fichier : ", file.originalname);
        callback(null, 'images')
    },
    filename: (req, file,callback)=>{
        const name = file.originalname.split('.')[0].replace(/\s+/g, '_');
        const extension = MIME_TYPES[file.mimetype];
        const generatedName = `${name}_${Date.now()}.${extension}`;
        console.log("Génération du nom du fichier : ", generatedName);
        callback(null, name + Date.now() + '.'+ extension)
    }
});

module.exports = multer({storage}).single('image');