const express = require("express");
const router = express.Router();
const bdd = require("../bdd/bdd");
const moment = require("moment");
const uuid = require("uuid").v4;

router.post("/postMessage", (req, res) => {
  const id = uuid();
  const date = moment().format("DD-MM-YYYY HH:mm:ss");
  const { nom, email, message } = req.body;
  const requete =
    "INSERT INTO message(idMessage, nomExpediteur, email, contenuMessage, dateCreation) VALUES(?, ?, ?, ?, ?)";
  bdd.query(requete, [id, nom, email, message, date], (err, resultat) => {
    if (err) return res.json(err);
    return res.json(resultat);
  });
});

router.get("/getMessages", (req, res) => {
  const requete = "SELECT * FROM message";
  bdd.query(requete, (err, resultat) => {
    if (err) return res.json(err);
    return res.json(resultat);
  });
});

router.get("/getMessage/:idMessage", (req, res) => {
  const id = req.params.idMessage;
  const requete = "SELECT * FROM message WHERE idMessage = ?";
  bdd.query(requete, [id], (err, resultat) => {
    if (err) return res.json(err);
    return res.json(resultat);
  });
});

router.get("/getNonReadMessages", (req, res) => {
  const statut = "non lu";
  const requete = "SELECT COUNT(*) AS messages FROM message WHERE statut= ?";
  bdd.query(requete, [statut], (err, resultat) => {
    if (err) return res.json(err);
    return res.json({ readMessages: resultat[0].messages });
  });
});

router.get("/getTotalMessages", (req, res) => {
  const requete = "SELECT COUNT(*) AS totalMessages FROM message ";
  bdd.query(requete, (err, resultat) => {
    if (err) return res.json(err);
    return res.json({ totalMessages: resultat[0].totalMessages });
  });
});

router.put("/lireMessage/:idMessage", (req, res) => {
  const id = req.params.idMessage;
  const statut = "Lu";
  const requete = "UPDATE message SET statut = ? WHERE idMessage = ?";
  bdd.query(requete, [statut, id], (err, resultat) => {
    if (err) return res.json(err);
    return res.json(resultat);
  });

  console.log(req.params.idMessage);
});

router.delete("/suppMessage/:idMessage", (req, res) => {
  const id = req.params.idMessage;
  const requete = "DELETE FROM message WHERE idMessage = ?";
  bdd.query(requete, [id], (err, resultat) => {
    if (err) return res.json(err);
    return res.json(resultat);
  });
});

module.exports = router;
