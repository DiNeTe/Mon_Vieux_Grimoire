const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assure-toi que le chemin est correct

// Fonction pour créer un nouvel utilisateur
exports.signup = (req, res, next) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Vérification de l'email
    if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({ message: "Email invalide" });
    }

    // Vérifie si l'utilisateur existe déjà dans la base de données
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                return res.status(401).json({ message: "Compte utilisateur déjà existant" });
            }
            // Si l'utilisateur n'existe pas, hache le mot de passe
            return bcrypt.hash(req.body.password, 10);
        })
        .then(hash => {
            if (!hash) {
                // Si hash est null, cela signifie qu'une erreur s'est produite avant
                return;
            }
            const user = new User({
                email: req.body.email,
                password: hash
            });
            return user.save();
        })
        .then(() => {
            res.status(201).json({ message: 'Utilisateur créé !' });
        })
        .catch(error => {
            if (!res.headersSent) {
                console.error('Erreur lors de la création de l\'utilisateur:', error);
                res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
            }
        });
};

// Fonction pour connecter un utilisateur existant
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Paire identifiant/mot de passe incorrect' });
            }

            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire identifiant/mot de passe incorrect' });
                    }

                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => {
                    if (!res.headersSent) {
                        console.error('Erreur lors de la comparaison des mots de passe:', error);
                        res.status(500).json({ error: 'Erreur lors de la comparaison des mots de passe' });
                    }
                });
        })
        .catch(error => {
            if (!res.headersSent) {
                console.error('Erreur lors de la recherche de l\'utilisateur:', error);
                res.status(500).json({ error: 'Erreur lors de la recherche de l\'utilisateur' });
            }
        });
};
