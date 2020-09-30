const express = require('express');
const app = express();
const PORT = 8080; //Default port
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const { validateUser } = require('./helper');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// User object for registered objects
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }

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
  // Update to use cookie user_id and send user object to template
  // const templateVars = { urls: urlDatabase,
  // username: req.cookies["username"]};
  const user = users[req.cookies['user_id']];
  const templateVars = { user, urls: urlDatabase};
  res.render("urls_index", templateVars);
});

// Add route to create new URL
app.get("/urls/new", (req,res) => {
  // Update to use cookie user_id and send user object to template
  // const templateVars = { username: req.cookies["username"]};
  const user = users[req.cookies['user_id']];
  const templateVars = { user };
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
  // Update to use cookie user_id and send user object to template
  // const templateVars = { shortURL: shortURLParameter,
  //    longURL: urlDatabase[shortURLParameter],
  //    username: req.cookies["username"],
  //    };
  const user = users[req.cookies['user_id']];
  const templateVars = {
    user,
    shortURL: shortURLParameter,
    longURL: urlDatabase[shortURLParameter]
  };
  console.log(templateVars);
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
  // res.clearCookie('username');
  // Update to use cookie user_id
  res.clearCookie('user_id');
  res.redirect("/urls");
});

// Adding get route to register new account
app.get("/register", (req,res) => {
  res.render("tinyapp_register");
});
// Adding post route to register new user
app.post("/register", (req,res) => {
  //Check registration errors
  console.log(users);
  const email = req.body.email;
  const password = req.body.password;
  if (validateUser(users,email,password)) {
    res.sendStatus(400);
  } else {
    const id = generateRandomString();
    const newUser = {
      id,
     email,
     password
    };
    users[id] = newUser;
    res.cookie('user_id',id);
    res.redirect("/urls");
  }

});

// Server Listens
app.listen(PORT, () => {
  console.log(`Example app is listening on the port ${PORT}!`);
});
