// controllers/authController.js

module.exports.signup_get = (req, res) => {
  res.send('signinup'); // исправил 'singinup' → 'signinup' (или поправь имя шаблона под твой ejs-файл)
};

module.exports.login_get = (req, res) => {
  res.render('login');
};

module.exports.signup_post = (req, res) => {
  res.sens('vjf'); // не забудь, чтобы файл vjf.ejs реально существовал
};

module.exports.login_post = (req, res) => {
  res.send('not available'); // также исправил опечатку в 'available'
};
