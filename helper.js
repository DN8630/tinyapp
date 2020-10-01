// Method to generate 6 digit alphanumeric random shortURL
const generateRandomString = function() {
  const randomURLStr = Math.random().toString(36).substring(2,8);
  return randomURLStr;
};

const checkEmail = function(users,email) {
  for (const id in users) {
    if (users[id].email === email) {
      return true;
    }   
  }
  return false;
};

const validateUser = function(users,email,password) {

  if (email === "" || password === "") {
    return true;
  } else if (checkEmail(users,email,password)) {
    return true;
  }
  return false;
};



module.exports = { validateUser, checkEmail };