const express = require("express");
const router = express.Router();
const bdd = require("../bdd/bdd");
const multer = require("multer");
const path = require("path");
const moment = require("moment");

// CREATION D'UN UTILISATEUR

router.post("/ajoutUser", (req, res) => {
  const { id, nom, prenom, email, password, role } = req.body;
  const idUser = "user_" + id;
  const sql =
    "INSERT INTO users (idUser, nomUser, prenomUser, email, password, role) VALUES (?)";
  bdd.query(
    sql,
    [idUser, nom, prenom, email, password, role],
    (err, resultat) => {
      if (err) {
        res.status(400).json(err);
      } else {
        res.status(200).json(resultat);
      }
    }
  );
});

// RECUPERATION DE TOUS LES UTILISATEURS

router.get("/listUsers", (req, res) => {
  const sql = "SELECT * FROM users";
  bdd.query(sql, (err, resultat) => {
    if (err) {
      res.status(400).json(err);
    } else {
      res.status(200).json(resultat);
    }
  });
});

// RECUPERATION D'UN UTILISATEUR
router.get("/user/:idUser", (req, res) => {
  const sql = "SELECT * FROM users WHERE idUser = ?";

  const idUser = req.params.idUser;

  bdd.query(sql, idUser, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

// MODIFICATION D'UN UTILISATEUR
router.put("/modifUser/:idUser", (req, res) => {
  const idUser = req.params.idUser;

  const sql =
    "UPDATE users SET nomUser = ?, prenomUser = ?, email = ?, password = ?, role = ? WHERE idUser = ?";

  bdd.query(
    sql,
    [
      req.body.nom,
      req.body.prenom,
      req.body.email,
      req.body.password,
      req.body.role,
      idUser,
    ],
    (err, resultat) => {
      if (err) return res.json(err);
      return res.json(resultat);
    }
  );
});

// SUPPRESSION D'UN UTILISATEUR
router.delete("/supprUser/:idUser", (req, res) => {
  const idUser = req.params.idUser;
  const sql = "DELETE FROM users WHERE idUser = ?";
  bdd.query(sql, idUser, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

module.exports = router;
