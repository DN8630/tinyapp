

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



module.exports = { validateUser, checkEmail };