const express = require("express");
const router = express.Router();
const bdd = require("../bdd/bdd");
const multer = require("multer");
const path = require("path");
const moment = require("moment");

// CREATION D'UNE FORMATION
// Stockage des fichiers (IMAGES) des formations
const stockageImageFormation = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images-formation");
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

router.post(
  "/ajoutFormation",
  uploadImageFormation.single("image"),
  (req, res) => {
    const { id, image, intitule, description, categ } = req.body;
    const idForm = "formation_" + id;
    const sql =
      "INSERT INTO formation (idFormation, imageFormation, intituleFormation, descriFormation, categorie) VALUES (?)";
    bdd.query(
      sql,
      [idForm, image, intitule, description, categorie],
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

// RECUPERATION DE TOUTES LES FORMATIONS
router.get("/listFormations", (req, res) => {
  const sql = "SELECT * FROM formation";
  bdd.query(sql, (err, resultat) => {
    if (err) {
      res.status(400).json(err);
    } else {
      res.status(200).json(resultat);
    }
  });
});

// RECUPERATION D'UNE FORMATION
router.get("/detailsFormation/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM formation WHERE idFormation = ?";
  bdd.query(sql, [id], (err, resultat) => {
    if (err) {
      res.status(400).json(err);
    } else {
      res.status(200).json(resultat);
    }
  });
});

// MODIFICATION D'UNE FORMATION
router.put(
  "/modifFormation/:id",
  uploadImageFormation.single("image"),
  (req, res) => {
    const id = req.params.id;
    const { image, intitule, description, categorie } = req.body;
    const sql =
      "UPDATE formation SET imageFormation = ?, intituleFormation = ?, descriFormation = ?, categorie = ? WHERE idFormation = ?";
    bdd.query(
      sql,
      [image, intitule, description, categorie, id],
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

// SUPPRESSION D'UNE FORMATION
router.delete("/suppFormation/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM formation WHERE idFormation = ?";
  bdd.query(sql, [id], (err, resultat) => {
    if (err) {
      res.status(400).json(err);
    } else {
      res.status(200).json(resultat);
    }
  });
});

module.exports = router;
