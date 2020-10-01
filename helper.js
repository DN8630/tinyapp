// Method to generate 6 digit alphanumeric random shortURL
const generateRandomString = function() {
  const randomURLStr = Math.random().toString(36).substring(2,8);
  return randomURLStr;
};

const checkEmail = function(users,email,password) {
  if (email === "" || password === "") {
    return true;
  }
  for (const id in users) {
    if (users[id].email === email) {
      return true;
    }
  }
  return false;
};

const validateUser = function(users,email,password) {
  if (email === "" || password === "") {
    return null;
  }
  for (const id in users) {
    const currentUser = users[id];
    if (currentUser.email === email && currentUser.password === password) {
      return currentUser;
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

const createNewUser = function(email, password) {
  const id = generateRandomString();

  return { id, email, password};
}

module.exports = { validateUser, checkEmail, urlsForUser, generateRandomString, createNewUser };