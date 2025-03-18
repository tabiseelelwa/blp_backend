const express = require("express");
const router = express.Router();
const bdd = require("../bdd/bdd");
const multer = require("multer");
const path = require("path");
const moment = require("moment");
const uuid = require("uuid").v4;

// CREATION D'UN ARTICLE
// Stockage des fichiers (IMAGES) des articles
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

router.post("/ajoutArticle", uploadImageArticle.single("image"), (req, res) => {
  const { titre, contenu, categorie } = req.body;
  const fichier = req.file.filename;
  const idArt = "article_" + uuid();
  const dateCreation = moment().format("DD-MM-YYYY HH:mm:ss");
  const dateModif = moment().format("DD-MM-YYYY HH:mm:ss");
  const user = "EMPEREUR";
  const sql =
    "INSERT INTO articles (idArticle, imageArticle, titreArticle, contenu, Categorie, User, dateCreation, dateModif) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  bdd.query(
    sql,
    [idArt, fichier, titre, contenu, categorie, user, dateCreation, dateModif],
    (err, resultat) => {
      if (err) {
        res.status(400).json(err);
      } else {
        res.status(200).json(resultat);
      }
    }
  );
});

// RECUPERATION DE TOUS LES ARTICLES
router.get("/listArticles", (req, res) => {
  const sql = "SELECT * FROM articles";
  bdd.query(sql, (err, resultat) => {
    if (err) {
      res.status(400).json(err);
    } else {
      res.status(200).json(resultat);
    }
  });
});

// RECUPERATION D'UN ARTICLE
router.get("/detailsArticle/:idArticle", (req, res) => {
  const id = req.params.idArticle;
  const sql = "SELECT * FROM articles WHERE idArticle = ?";
  bdd.query(sql, [id], (err, resultat) => {
    if (err) {
      res.status(400).json(err);
    } else {
      res.status(200).json(resultat);
    }
  });
});

// MODIFICATION D'UN ARTICLE
router.put(
  "/modifArticle/:idArticle",
  uploadImageArticle.single("image"),
  (req, res) => {
    const id = req.params.idArticle;
    const { titre, contenu, categorie } = req.body;
    const dateModif = moment().format("YYYY-MM-DD HH:mm:ss");
    const sql =
      "UPDATE articles SET titreArticle = ?, contenu = ?, Categorie = ?, dateModif = ? WHERE idArticle = ?";
    bdd.query(
      sql,
      [titre, contenu, categorie, dateModif, id],
      (err, resultat) => {
        if (err) {
          res.status(400).json(err);
        } else {
          res.status(200).json(resultat);
        }
      }
    );
  }
);

// NOMBRE D'ARTICLES
router.get("/nombre_articles", (req, res) => {
  const sql = "SELECT COUNT(*) AS count FROM articles";

  Bdd.query(sql, (err, result) => {
    if (err) return res.json(err);
    return res.json(result[0].count);
  });
});

// SUPPRESSION D'UN ARTICLE
router.delete("/supprArticle/:idArticle", (req, res) => {
  const id = req.params.idArticle;
  const sql = "DELETE FROM articles WHERE idArticle = ?";
  bdd.query(sql, [id], (err, resultat) => {
    if (err) {
      res.status(400).json(err);
    } else {
      res.status(200).json(resultat);
    }
  });
});

module.exports = router;
