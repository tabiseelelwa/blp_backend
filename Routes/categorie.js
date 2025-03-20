const express = require("express");
const router = express.Router();
const bdd = require("../bdd/bdd");

// RECUPERATION DE TOUTES LES CATEGORIES
router.get("/listCategories", (req, res) => {
  const sql = "SELECT * FROM categories";
  bdd.query(sql, (err, resultat) => {
    if (err) {
      res.status(400).json(err);
    } else {
      res.status(200).json(resultat);
    }
  });
});

// RECUPERATION D'UNE CATEGORIE
router.get("/detailsCategorie/:idCategorie", (req, res) => {
  const id = req.params.idCategorie;
  const sql = "SELECT * FROM categories WHERE idCategorie = ?";
  bdd.query(sql, [id], (err, resultat) => {
    if (err) {
      res.status(400).json(err);
    } else {
      res.status(200).json(resultat);
    }
  });
});

// MODIFICATION D'UNE CATEGORIE
router.put("/modifCategorie/:idCategorie", (req, res) => {
  const id = req.params.idCategorie;
  const { nomCategorie } = req.body;
  const sql = "UPDATE categories SET nomCategorie = ? WHERE idCategorie = ?";
  bdd.query(sql, [nomCategorie, id], (err, resultat) => {
    if (err) {
      res.status(400).json(err);
    } else {
      res.status(200).json(resultat);
    }
  });
});

// SUPPRESSION D'UNE CATEGORIE
router.delete("/supprCategorie/:idCategorie", (req, res) => {
  const id = req.params.idCategorie;
  const sql = "DELETE FROM categories WHERE idCategorie = ?";
  bdd.query(sql, [id], (err, resultat) => {
    if (err) {
      res.status(400).json(err);
    } else {
      res.status(200).json(resultat);
    }
  });
});

module.exports = router;
