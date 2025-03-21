const express = require("express");
const router = express.Router();
const Bdd = require("../bdd/bdd");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const MySQLStore = require("express-mysql-session")(session);
const sessionStore = new MySQLStore(Bdd);
const jwt = require("jsonwebtoken");

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
  const sql = "SELECT * FROM users WHERE email = ? AND mdp = ?";

  Bdd.query(sql, [email, password], (err, result) => {
    if (err) return res.json(err);

    if (result.length > 0) {
      const id = result[0].idUser;
      const token = jwt.sign({ id }, process.env.SECRET_KEY, {
        expiresIn: 300,
      });
      return res.json({ Login: true, token, result });
    } else {
      return res.json({ Login: false });
    }
  });
});

const verifJwt = (req, res, next) => {
  const token = req.headers["access-token"];

  if (!token) {
    return res.json({ Message: "Prière de vous authentifier" });
  } else {
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) return res.json({ Message: "Non connecté" });
      return (req.idUser = decoded.id);
      next();
    });
  }
};

// Récupération du nom de l'utilisateur connecté
router.get("/authentification", verifJwt, (req, res) => {
  return res.json({ valid: true });
});

// DECONNEXION
router.get("/logout", (req, res) => {
  req.session.destroy();
  return res.json("success");
});

module.exports = router;
