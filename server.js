const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const moment = require("moment");
const MySQLStore = require("express-mysql-session")(session);

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.static("public"));

const options = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "fizitech",
};

const sessionStore = new MySQLStore(options);

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

// CONNEXION A LA BASE DE DONNEES
const Bdd = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "fizitech",
});

// STOCKAGE DES FICHIERS (IMAGES) des articles
const stockageImageArticle = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images-article");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const uploadImageArticle = multer({
  storage: stockageImageArticle,
});

// STOCKAGE DES IMAGES de profils des utilisateurs
const stockageImageUser = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/profil-users");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const uploadImageUser = multer({
  storage: stockageImageUser,
});

const stockageImageFormation = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images-formations");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const uploadImageFormation = multer({
  storage: stockageImageFormation,
});

// CREATION ARTICLE
app.post("/create-article", uploadImageArticle.single("image"), (req, res) => {
  const date = moment(Date.now()).format("DD-MM-YYYY HH:mm:ss");
  const user = req.session.nomUser;
  //
  const sql =
    "INSERT INTO articles (`imageArticle`, `titreArticle`, `Categorie`, `contenu`, `User`, `dateCreation`) VALUES (?)";

  const values = [
    req.file.filename,
    req.body.titre,
    req.body.categorie,
    req.body.contenu,
    user,
    date,
  ];

  Bdd.query(sql, [values], (err, resultat) => {
    if (err) return res.json(err);
    return res.json(resultat);
  });
});

// Récupération du nom de l'utilisateur connecté
app.get("/connexion", (req, res) => {
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

// CHARGEMENT D'UN ARTICLE PAR L'UTILISATEUR
app.get("/post/:idArticle", (req, res) => {
  const sql = "SELECT * FROM articles WHERE idArticle = ?";
  const idArticle = req.params.idArticle;

  Bdd.query(sql, [idArticle], (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

// MODIFICATION DE L'ARTICLE
app.put("/modifArticle/:idArticle", (req, res) => {
  const idArticle = req.params.idArticle;
  const sql =
    "UPDATE articles SET titreArticle = ?, Categorie = ? WHERE idArticle = ?";

  Bdd.query(
    sql,
    [req.body.titre, req.body.categorie, idArticle],
    (err, result) => {
      if (err) return res.json(err);
      return res.json(result);
    }
  );
});

app.put(
  "/photo-article/:idArticle",
  uploadImageArticle.single("image"),
  (req, res) => {
    const idArticle = req.params.idArticle;
    const sql = "UPDATE articles SET imageArticle = ? WHERE idArticle = ?";

    Bdd.query(sql, [req.file.filename, idArticle], (err, result) => {
      if (err) return res.json(err);
      return res.json(result);
    });
  }
);

app.put("/photo-user/:idUser", uploadImageUser.single("photo"), (req, res) => {
  const idUser = req.params.idUser;
  const sql = "UPDATE users SET imageUser = ? WHERE idUser = ?";

  Bdd.query(sql, [req.file.filename, idUser], (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

// LECTURE ARTICLES PAR L'ADMINISTRATEUR
app.get("/listArticles", (req, res) => {
  const sql = "SELECT * FROM articles ORDER BY idArticle DESC";

  Bdd.query(sql, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

// LECTURE ARTICLES PAR LE VISITEUR
app.get("/articles", (req, res) => {
  const sql = "SELECT * FROM articles ORDER BY idArticle DESC LIMIT 6";

  Bdd.query(sql, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

// COMPTAGE D'ARTICLES

app.get("/nombre_articles", (req, res) => {
  const sql = "SELECT COUNT(*) AS count FROM articles";

  Bdd.query(sql, (err, result) => {
    if (err) return res.json(err);
    return res.json(result[0].count);
  });
});

// SUPPRESSION DE L'ARTICLE
app.delete("/supprArticle/:idArticle", (req, res) => {
  const sql = "DELETE FROM articles WHERE idArticle = ?";

  const idArticle = req.params.idArticle;

  Bdd.query(sql, idArticle, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

// Création d'un nouvel utilisateur
app.post("/enregUser", (req, res) => {
  const sql =
    "INSERT INTO users (`nomUser`, `postnomUser`, `prenomUser`, `email`) VALUES (?)";
  const values = [
    req.body.nom,
    req.body.postnom,
    req.body.prenom,
    req.body.email,
  ];

  Bdd.query(sql, [values], (err, resultat) => {
    if (err) return res.json(err);
    return res.json(resultat);
  });
});

// Modification d'un utilisateur
app.put("/modifUser/:idUser", (req, res) => {
  const idUser = req.params.idUser;

  const sql =
    "UPDATE users SET nomUser = ?, postnomUser = ?, prenomUser = ?, email = ? WHERE idUser = ?";

  Bdd.query(
    sql,
    [req.body.nom, req.body.postnom, req.body.prenom, req.body.email, idUser],
    (err, resultat) => {
      if (err) return res.json(err);
      return res.json(resultat);
    }
  );
});

// Récupération d'un utilisateur pour modification ou suppression
app.get("/user/:idUser", (req, res) => {
  const sql = "SELECT * FROM users WHERE idUser = ?";

  const idUser = req.params.idUser;

  Bdd.query(sql, idUser, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

// Récupération pour affichage de tous les utilisateurs
app.get("/categories", (req, res) => {
  const sql = "SELECT * FROM categories";
  Bdd.query(sql, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

// CHARGEMENT POUR AFFICHAGE DE TOUS LES UTILISATEURS
app.get("/listUsers", (req, res) => {
  const sql = "SELECT * FROM users ORDER BY idUser DESC";
  Bdd.query(sql, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

// Suppression de l'utilisateur
app.delete("/supprUser/:idUser", (req, res) => {
  const sql = "DELETE FROM users WHERE idUser = ?";
  const idUser = req.params.idUser;

  Bdd.query(sql, [idUser], (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

// FORMATIONS

// Création de la formation
app.post(
  "/enregFormation",
  uploadImageFormation.single("image"),
  (req, res) => {
    const id = "FORMATION_" + Date.now();
    const sql =
      "INSERT INTO formation (`idFormation`, `imageFormation`, `intituleFormation`, `descriptFormation`) VALUES (?)";

    const values = [
      id,
      req.file.filename,
      req.body.intitule,
      req.body.description,
    ];

    Bdd.query(sql, [values], (err, resultat) => {
      if (err) return res.json(err);
      return res.json(resultat);
    });
  }
);

// Récupération de toutes les formations
app.get("/formations", (req, res) => {
  const sql = "SELECT * FROM formation";
  Bdd.query(sql, (err, resultat) => {
    if (err) return res.json(err);
    return res.json(resultat);
  });
});

// Récupération d'une formation
app.get("/formation/:idFormation", (req, res) => {
  const sql = "SELECT * FROM formation WHERE idFormation = ?";
  const id = req.params.idFormation;
  Bdd.query(sql, [id], (err, resultat) => {
    if (err) return res.json(err);
    return res.json(resultat);
  });
});

// Modification de la formation
app.put("/modifFormation", (req, res) => {
  const sql =
    "UPDATE formation SET intituleFormation = ?, descriptFormation = ? WHERE idFormation = ?";

  Bdd.query(sql, [req.body.intitule, req.body.description], (err, resultat) => {
    if (err) return res.json(err);
    return res.json(resultat);
  });
});

// Suppression de la formation
app.delete("/supprFormation/:idFormation", (req, res) => {
  const sql = "DELETE FROM formation WHERE idFormation = ?";
  Bdd.query(sql, [req.params.idFormation], (err, resultat) => {
    if (err) return res.json(err);
    return res.json(resultat);
  });
});

// CREATION : A propos de FiziTech
app.post("/about-creat", (req, res) => {
  const sql = "INSERT INTO about_fzt(`idAbout`, `description`) VALUES (?)";
  const idAbout = Date.now();
  const values = [idAbout, req.body.descr];

  Bdd.query(sql, [values], (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });

  console.log(req.body.descr);
});

// MODIFICATION : A propos de FiziTech
app.put("/about/:idAbout", (req, res) => {
  const sql = "UPDATE about_fzt set description = ? WHERE idAbout = ?";

  Bdd.query(sql, [req.body.description, req.params.idAbout], (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

app.listen(8085, () => {
  console.log("Le serveur est actif");
});
