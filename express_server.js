const express = require('express');
const app = express();
const PORT = 8080; //Default port
const { checkEmail, validateUser, urlsForUser, generateRandomString, createNewUser } = require('./helper');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set("view engine", "ejs");

/* const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}; */
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
// User object for registered objects
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }

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
  if (user) {
    const urlForUser = urlsForUser(urlDatabase,user.id);
    const templateVars = { user, urls: urlForUser};
    res.render("urls_index", templateVars);
  } else {
    res.render("urls_index", {urls : null , user})
  }
});


// Post method for form submission and redirect to shortURL
app.post("/urls", (req,res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  const userID = req.cookies['user_id'];
  urlDatabase[shortURL] = { longURL,userID};
  res.redirect(`/urls/${shortURL}`);
  // res.send("OK");
});

// Add route to create new URL
app.get("/urls/new", (req,res) => {
  // Update to use cookie user_id and send user object to template
  // const templateVars = { username: req.cookies["username"]};
  const user = users[req.cookies['user_id']];
  // Check if current user is logged in a
  if (user) {
    const templateVars = { user };
    res.render("urls_new",templateVars);
  } else {
    res.redirect("/login");
    return;
  }

});


//Add new route to render information about single url
app.get("/urls/:shortURL", (req,res) => {
  
  // Update to use cookie user_id and send user object to template
  // const templateVars = { shortURL: shortURLParameter,
  //    longURL: urlDatabase[shortURLParameter],
  //    username: req.cookies["username"],
  //    };
  const user = users[req.cookies['user_id']];
  const shortURLParameter = req.params.shortURL;
  if (user) {
    const urlForUser = urlsForUser(urlDatabase,user.id);
    if (urlForUser[shortURLParameter]) {
      const templateVars = {
        user,
        shortURL: shortURLParameter,
        longURL: urlDatabase[shortURLParameter].longURL
      };
      // console.log(templateVars);
      res.render("urls_show", templateVars);
      return;
    } else {
      res.send("Url does not belogn to the user");
    }
  } else {
    res.render("error", { errorstatus: "404", message: "Please login to see your URL's"});
  }
});
//Add route to update URL
app.post("/urls/:id", (req,res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.newlongURL;
  const user = users[req.cookies['user_id']];
  if (user) {
    const urlForUser = urlsForUser(urlDatabase,user.id);
    if (urlForUser[shortURL]) {
      urlDatabase[shortURL] = {
        longURL:newLongURL,
        userID: req.cookies['user_id']
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
  const user = users[req.cookies['user_id']];
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

//-----Login route begins
// Adding GET route to login page
app.get("/login", (req,res) => {
  const templateVars = { user: users[req.cookies['user_id']]};
  res.render("login", templateVars);
});

// Adding Post route for login
app.post("/login", (req,res) => {
  // const username = req.body.username;
  // res.cookie('username',username);
  const email = req.body.email;
  const password = req.body.password;
  const currentUser = validateUser(users,email,password);
  if (currentUser) {
    const userId = currentUser.id;
    res.cookie('user_id',userId);
    res.redirect("/urls");
  } else {
    res.statusCode = 403;
    res.send("Login Failed");
  }
});
//-----Login route ends

//Adding Post route for logout
app.post("/logout", (req,res) => {
  //Clear cookie on logout
  res.clearCookie('user_id');
  res.redirect("/urls");
});

// Adding get route to register new account
app.get("/register", (req,res) => {
  const templateVars = { user: users[req.cookies['user_id']]};
  res.render("tinyapp_register",templateVars);
});

// Adding post route to register new user
app.post("/register", (req,res) => {
  //Check registration errors
  const email = req.body.email;
  const pwdText= req.body.password;
  if (!checkEmail(users,email,pwdText)) {
    const newUser = createNewUser(email,pwdText);
    const id = newUser.id;
    users[id] = newUser;
    res.cookie('user_id',id);
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
