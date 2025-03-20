const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { console } = require("inspector");
const MySQLStore = require("express-mysql-session")(session);

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

const origin = ["http://localhost:3000"];
// const origin = ["https://www.fizitech.org"];

app.use(
  cors({
    origin: origin,
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.static("public"));

// const connexion = {
//   host: "localhost",
//   user: "c2413927c_empereur",
//   password: "Le@12101995#",
//   database: "c2413927c_fizitech",
// };

const connexion = {
  host: "localhost",
  user: "root",
  password: "",
  database: "fizitech",
};

const sessionStore = new MySQLStore(connexion);

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

const Bdd = mysql.createConnection(connexion);

// Récupération du nom de l'utilisateur connecté
app.get("/authentification", (req, res) => {
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

// Connexion de l'utilisateur au système
app.post("/login", (req, res) => {
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
});

// DECONNEXION
app.get("/logout", (req, res) => {
  req.session.destroy();
  return res.json("success");
});

//LES ROUTES

const formationsRoutes = require("./Routes/formations");
const articlesRoutes = require("./Routes/article");
const categRoutes = require("./Routes/categorie");

app.use("/api/", formationsRoutes);
app.use("/api/", articlesRoutes);
app.use("/api/", categRoutes);

const port = 8085;
app.listen(port, () => {
  console.log(`Le serveur est actif au port ${port}`);
});
