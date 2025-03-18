const mysql = require("mysql2");
const Bdd = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "fizitech",
});

module.exports = Bdd;
