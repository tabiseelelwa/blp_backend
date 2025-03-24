const express = require("express");
const router = express.Router();
const bdd = require("../bdd/bdd");
const uuid = require("uuid").v4;

router.post("/ajoutApropos", (req, res) => {
  const id = "apropos" + uuid();

  const requete = "INSERT INTO about_fzt(idAbout, description) VALUES(?)";

  bdd.qyery(requete, [id, req.body.contenu], (err, resultats) => {
    if (err) return res.json(err);
    return res.json(resultats);
  });
});

router.get("/listApropos", (req, res) => {
  const requete = "SELECT * FROM about_fzt";
  bdd.query(requete, (err, resultats) => {
    if (err) return res.json(err);
    return res.json(resultats);
  });
});

router.put("/modifApropos/:id", (req, res) => {
  const id = req.params.id;
  const requete = "UPDATE about_fzt SET contenu = ? WHERE idAbout = ?";
  bdd.query(requete, [req.body.contenu, id], (err, resultats) => {
    if (err) return res.json(err);
    return res.json(resultats);
  });
});

module.exports = router;
