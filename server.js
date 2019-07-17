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
const PORT = process.env.port || 5000;
app.get("/", (req, res) => {
  res.json("Hello World");
});
require("./app/cfStandings")(app);
require("./app/cfSubmissions")(app);
app.listen(PORT, () => console.log("App listening on port", PORT));
