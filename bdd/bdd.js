const mysql = require("mysql2");
require("dotenv").config();
const Bdd = mysql.createConnection({
  host: process.env.HOST || "localhost",
  user: process.env.USER || "root",
  password: process.env.PASSWORD || "",
  database: process.env.DATABASE || "fizitech",
});

module.exports = Bdd;
