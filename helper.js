const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

// Method to generate 6 digit alphanumeric random shortURL
const generateRandomString = function() {
  const randomURLStr = Math.random().toString(36).substring(2,8);
  return randomURLStr;
};

const getUserByEmail = function(email,users) {
  for (const id in users) {
    const currentUser = users[id];
    if (currentUser.email === email) {
      return currentUser;
    }
  }
  return undefined;
};

const validateUser = function(users,email,password) {
  if (email === "" || password === "") {
    return null;
  }
  for (const id in users) {
    const currentUser = users[id];
    if (currentUser.email === email) {
      if (bcrypt.compareSync(password, currentUser.password)) {
        return currentUser;
      }
    }
  }
  return null;
};
 
const urlsForUser = function(urlDatabase,user_id) {
  let userUrl = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === user_id) {
      userUrl[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return userUrl;

};

const createNewUser = function(email, originalPwd) {
  const id = generateRandomString();
  const password = bcrypt.hashSync(originalPwd,salt);
  return { id, email, password};
};

module.exports = { validateUser, getUserByEmail, urlsForUser, generateRandomString, createNewUser };