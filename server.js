const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());

const origin = [process.env.ORIGIN_URL];

app.use(
  cors({
    origin: origin,
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(express.static("public"));

//LES ROUTES
const formationsRoutes = require("./Routes/formations");
const articlesRoutes = require("./Routes/article");
const categRoutes = require("./Routes/categorie");
const loginRoutes = require("./Routes/login");
const usersRoutes = require("./Routes/user");
const aboutRoutes = require("./Routes/about");
const messageRoutes = require("./Routes/message");

// LES APPELS DES ROUTES
app.use("/api/", formationsRoutes);
app.use("/api/", articlesRoutes);
app.use("/api/", categRoutes);
app.use("/api/", loginRoutes);
app.use("/api/", usersRoutes);
app.use("/api/", aboutRoutes);
app.use("/api/", messageRoutes);

const port = process.env.PORT || 8085;
app.listen(port, () => {
  console.log(`Le serveur est actif au port ${port}`);
});
