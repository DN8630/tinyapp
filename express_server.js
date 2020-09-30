const express = require('express');
const app = express();
const PORT = 8080; //Default port
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// Method to generate 6 digit alphanumeric random shortURL
const generateRandomString = function() {
  const randomURLStr = Math.random().toString(36).substring(2,8);
  return randomURLStr;
};

app.get("/", (req,res) => {
  res.send('Hello!');
});


//Add router
app.get("/urls.json", (req,res) => {
  res.json(urlDatabase);
});
// Send HTML
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Add route for /urls to display page with all URL's
app.get("/urls", (req,res) => {
  const templateVars = { urls: urlDatabase,
  username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req,res) => {
  const templateVars = { username: req.cookies["username"]};
  res.render("urls_new",templateVars);
});

// Post method for form submission and redirect to shortURL
app.post("/urls", (req,res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
  // res.send("OK");
});
//Add new route to render information about single url
app.get("/urls/:shortURL", (req,res) => {
  const shortURLParameter = req.params.shortURL;
  const templateVars = { shortURL: shortURLParameter,
     longURL: urlDatabase[shortURLParameter], 
     username: req.cookies["username"],
     };
  res.render("urls_show", templateVars);
  
});
//Add route to update URL
app.post("/urls/:id", (req,res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.newlongURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
});
app.get("/u/:shortURL", (req,res) => {

  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.statusCode = 300;
    res.redirect(longURL);
    return;
  }
  res.status = 404;
  res.send(`Requested Url : ${longURL} not found`);
});

// Adding POST route to handle delete URL
app.post("/urls/:shortURL/delete", (req,res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// Adding Post route for login
app.post("/login", (req,res) => {
  const username = req.body.username;
  res.cookie('username',username);
  res.redirect("/urls");
});

//Adding Post route for logout
app.post("/logout", (req,res) => {
  res.clearCookie('username');
  res.redirect("/urls");
})
// Server Listens
app.listen(PORT, () => {
  console.log(`Example app is listening on the port ${PORT}!`);
});
