const express = require("express");
const router = express.Router();
const Bdd = require("../bdd/bdd");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const MySQLStore = require("express-mysql-session")(session);
const sessionStore = new MySQLStore(Bdd);

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
  const sql = "SELECT * FROM users WHERE email = ? AND mdp = ?";
  Bdd.query(sql, [req.body.email, req.body.password], (err, result) => {
    if (err) return res.json(err);
    if (result.length > 0) {
      req.session.role = result[0].role;
      req.session.nomUser = result[0].nomUser;
      return res.json({ Login: true });
    } else {
      return res.json({ Login: false });
    }
  });

  console.log("session", req.session);
});

// Récupération du nom de l'utilisateur connecté
router.get("/authentification", (req, res) => {
  if (req.session.nomUser) {
    return res.json({
      valid: true,
      nomUser: req.session.nomUser,
      role: req.session.role,
    });
  } else {
    return res.json({ valid: false });
  }
});

// DECONNEXION
router.get("/logout", (req, res) => {
  req.session.destroy();
  return res.json("success");
});

module.exports = router;
