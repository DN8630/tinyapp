const express = require('express');
const app = express();
const PORT = 8080; //Default port

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req,res) => {
  res.send('Hello!');
});
app.listen(PORT, () => {
  console.log(`Example app is listening on the port ${PORT}!`);
});

//Add router
app.get("/urls.json", (req,res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Add route for /urls
app.get("/urls", (req,res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req,res) => {
  res.render("urls_new");
});
app.post("/urls", (req,res) => {
  console.log(req.body);
  res.send("OK");
});
//Add new route to render information about single url
app.get("/urls/:shortURL", (req,res) => {
  const shortURLParameter = req.params.shortURL;
  const templateVars = { shortURL: shortURLParameter, longURL: urlDatabase[shortURLParameter]};

 res.render("urls_show", templateVars);
});



