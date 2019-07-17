const Cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(Cors());

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());
app.use(express.static("app/public"));
app.get("/", (req, res) => {
  res.json("Hello World");
});
require("./app/cfStandings")(app);
require("./app/cfSubmissions")(app);
app.listen();
