const express = require("express");
const router = express.Router();
const bdd = require("../bdd/bdd");
const uuid = require("uuid").v4;
const bcrypt = require("bcrypt");

// CREATION D'UN UTILISATEUR

router.post("/createUser", async (req, res) => {
  const idUser = "user_" + uuid();
  const motdepasse = "12345";
  try {
    // Verification de l'existence de l'utilisateur
    const requete = "SELECT * FROM users WHERE email = ?";
    const { nom, postnom, prenom, email } = req.body;

    bdd.query(requete, [email], async (err, result) => {
      if (err)
        return res.json({ err, Message: "Erreur lors de l'enregistrement" });
      if (result.length > 0) {
        return res.json({ Message: `${email} existe déjà` });
      }

      // Enregistrement de l'utilisateur s'il n'existe pas
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(motdepasse, salt);
      const sql =
        "INSERT INTO users (idUser, nomUser, postnomUser, prenomUser, email, mdp) VALUES (?, ?, ?, ?, ?, ?)";

      bdd.query(
        sql,
        [idUser, nom, postnom, prenom, email, hashedPassword],
        (err, resultat) => {
          if (err) {
            res
              .status(400)
              .json({ err, Message: "Erreur lors de l'enregistrement" });
          } else {
            res.status(200).json({
              resultat,
              Message: `Utilisateur ${prenom} ${nom} créé avec succès`,
            });
          }
        }
      );
    });
  } catch (err) {
    console.log(err);
  }
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
router.get("/detailsUser/:idUser", (req, res) => {
  const idUser = req.params.idUser;
  const sql = "SELECT * FROM users WHERE idUser = ?";

  bdd.query(sql, [idUser], (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

// MODIFICATION D'UN UTILISATEUR
router.put("/modifUser/:idUser", (req, res) => {
  const idUser = req.params.idUser;

  const sql =
    "UPDATE users SET nomUser = ?, postnomUser = ?, prenomUser = ?, email = ? WHERE idUser = ?";

  bdd.query(
    sql,
    [req.body.nom, req.body.postnom, req.body.prenom, req.body.email, idUser],
    (err, resultat) => {
      if (err) return res.json(err);
      return res.json(resultat);
    }
  );
});

// SUPPRESSION D'UN UTILISATEUR
router.delete("/supprimUser/:idUser", (req, res) => {
  const idUser = req.params.idUser;
  const sql = "DELETE FROM users WHERE idUser = ?";
  bdd.query(sql, idUser, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

module.exports = router;
