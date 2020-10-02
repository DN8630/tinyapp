const express = require('express');
const app = express();
const PORT = 8080; //Default port
const { getUserByEmail, validateUser, urlsForUser, generateRandomString, createNewUser } = require('./helper');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['WinterIsComing', 'DCH']
}));

app.set("view engine", "ejs");
// Databse of URLs
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// User object for registered users
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }

};

app.get("/", (req,res) => {
  const user = users[req.session['user_id']];
  if (user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
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
  const user = users[req.session['user_id']];
  if (user) {
    const urlForUser = urlsForUser(urlDatabase,user.id);
    const templateVars = { user, urls: urlForUser};
    res.render("urls_index", templateVars);
  } else {
    res.render("urls_index", {urls : null , user});
  }
});


// Post method for form submission and redirect to shortURL
app.post("/urls", (req,res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  const userID = req.session['user_id'];
  urlDatabase[shortURL] = { longURL, userID};
  res.redirect(`/urls/${shortURL}`);
});

// Add route to create new URL
app.get("/urls/new", (req,res) => {
  const user = users[req.session['user_id']];
  //Allow only logged in users to create a new URL
  if (user) {
    const templateVars = { user };
    res.render("urls_new",templateVars);
  } else {
    res.redirect("/login");
    return;
  }
});


//Add new route to display specified URL
app.get("/urls/:shortURL", (req,res) => {
  const user = users[req.session['user_id']];
  const shortURLParameter = req.params.shortURL;
  if (!urlDatabase[shortURLParameter]) {
    res.statusCode = 404;
    res.send("URL does not exist");
  }
  if (user) {
    const urlForUser = urlsForUser(urlDatabase,user.id);
    if (urlForUser[shortURLParameter]) {
      const templateVars = {
        user,
        shortURL: shortURLParameter,
        longURL: urlDatabase[shortURLParameter].longURL
      };
      res.render("urls_show", templateVars);
      return;
    } else {
      res.send("Access to the URL denied");
    }
  } else {
    res.render("error", { errorstatus: "404", message: "Please login to see your URL's"});
  }
});
//Add route to update URL
app.post("/urls/:id", (req,res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.newlongURL;
  const user = users[req.session['user_id']];
  if (user) {
    const urlForUser = urlsForUser(urlDatabase,user.id);
    if (urlForUser[shortURL]) {
      urlDatabase[shortURL] = {
        longURL: newLongURL,
        userID: req.session['user_id']
      };
      res.redirect("/urls");
      return;
    } else {
      res.status(401).send("No authorization to edit URLS");
    }
  } else {
    res.send("Please login to edit URL");
  }
});

//Display page to edit URL
app.get("/u/:shortURL", (req,res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL) {
      res.statusCode = 300;
      res.redirect(longURL);
      return;
    }
  }
  res.status = 404;
  res.send(`Requested Url not found`);
});

// Adding POST route to handle delete URL
app.post("/urls/:shortURL/delete", (req,res) => {
  const user = users[req.session['user_id']];
  if (user) {
    const urlForUser = urlsForUser(urlDatabase,user.id);
    const shortURL = req.params.shortURL;
    if (urlForUser[shortURL]) {
      delete urlDatabase[shortURL];
      res.redirect("/urls");
      return;
    } else {
      res.status(401).send("No authorization to delete URL");
    }
  } else {
    res.send("Please login to delete URL");
  }
});

// Display login page
app.get("/login", (req,res) => {
  const userID = req.session['user_id'];
  if (userID) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[req.session['user_id']]};
    res.render("login", templateVars);
  }
});

// Adding Post route for login
app.post("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const currentUser = validateUser(users,email,password);
  if (currentUser) {
    const userId = currentUser.id;
    req.session['user_id'] = userId;
    res.redirect("/urls");
  } else {
    res.statusCode = 403;
    res.send("Login Failed");
  }
});


//Adding Post route for logout
app.post("/logout", (req,res) => {
  //Clear cookie on logout
  req.session['user_id'] = null;
  res.redirect("/urls");
});

// Adding get route to register new account
app.get("/register", (req,res) => {
  const userID = req.session['user_id'];
  if (userID) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[req.session['user_id']]};
    res.render("tinyapp_register",templateVars);
  }
});

// Adding post route to register new user
app.post("/register", (req,res) => {
  //Check registration errors
  const email = req.body.email;
  const pwdText = req.body.password;
  if (email === "" || pwdText === "") {
    res.send("Please enter valid data");
  } else if (!getUserByEmail(email,users)) {
    const newUser = createNewUser(email,pwdText);
    const id = newUser.id;
    users[id] = newUser;
    req.session['user_id'] = id;
    res.redirect("/urls");
  } else {
    res.statusCode = 400;
    res.send("Registration Failed");
  }
});

// Server Listens
app.listen(PORT, () => {
  console.log(`Example app is listening on the port ${PORT}!`);
});
