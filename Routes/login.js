const express = require("express");
const router = express.Router();
const Bdd = require("../bdd/bdd");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const MySQLStore = require("express-mysql-session")(session);
const sessionStore = new MySQLStore(Bdd);
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

router.use(bodyParser.json());
router.use(cookieParser());

router.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// Connexion de l'utilisateur au système
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";

  Bdd.query(sql, [email], (err, result) => {
    if (err) return res.json(err);

    // Vérification d'un champ vide
    if (email === "") {
      return res.json({
        Login: false,
        Message: "Veuillez saisir votre email",
      });
    } else if (password === "") {
      return res.json({
        Login: false,
        Message: "Veuillez saisir le mot de passe",
      });
    }

    // Vérification de l'existence d'un utilisateur selon l'email
    if (result.length > 0) {
      bcrypt.compare(password, result[0].mdp, (err, response) => {
        if (err)
          return res.json({
            err,
            Message: "Erreur de comparaison de mot de passe",
          });
        if (response) {
          const id = result[0].idUser;
          const nom = result[0].nomUser;
          const role = result[0].role;
          const token = jwt.sign({ id, nom, role }, process.env.SECRET_KEY, {
            expiresIn: "1h",
          });
          res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
          });
          return res.json({ Login: true });
        } else {
          return res.json({
            Login: false,
            Message: "Mot de passe incorrect",
          });
        }
      });
    } else {
      return res.json({
        Login: false,
        Message: `L'email ${email} n'existe pas`,
      });
    }
  });
});

const verifJwt = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json({ Message: "Prière de vous authentifier" });
  } else {
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.json({ Message: "Jeton d'autentification invalide" });
      } else {
        req.nom = decoded.nom;
        req.role = decoded.role;
      }
      next();
    });
  }
};

// Récupération du nom et du role de l'utilisateur connecté
router.get("/authentification", verifJwt, (req, res) => {
  return res.json({ Login: true, nom: req.nom, role: req.role });
});

// DECONNEXION
router.get("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  return res.json("success");
});

module.exports = router;
