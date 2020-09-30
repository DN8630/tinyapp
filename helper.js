// Method to generate 6 digit alphanumeric random shortURL
const generateRandomString = function() {
  const randomURLStr = Math.random().toString(36).substring(2,8);
  return randomURLStr;
};

const createNewUser = function(email, password) {
const id = generateRandomString();
return { id, email, password };

}

module.exports = { generateRandomString, createNewUser };