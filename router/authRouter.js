const User = require('../models/User');
const { Router } = require('express');
const router = Router();
const jwt = require('jsonwebtoken');
const UserBasic = require('../models/userDeateilsShema');
const crypto = require('crypto'); 

const maxAge = 3 * 24 * 60 * 60; 
const CreateToken = (id) => {
  return jwt.sign({ id }, 'w8ts54v7/2012/16/altay/sand', {
    expiresIn: maxAge
  });
};

const handleError = (error) => {
  console.log('❌ Error caught:', error.message, error.code);

  let errors = { email: '', password: '' };

  if (error.message === 'Incorrect email') {
    errors.email = 'This email is not registered';
    return errors;
  }

  if (error.message === 'Incorrect password') {
    errors.password = 'The password is incorrect';
    return errors;
  }

  if (error.code === 11000) {
    errors.email = 'This email is already registered';
    return errors;
  }

  if (error.name === 'ValidationError') {
    Object.values(error.errors).forEach(err => {
      errors[err.properties.path] = err.properties.message;
    });
    return errors;
  }

  return { general: 'Something went wrong. Please try again later.' };
};




router.get('/sign-up', (req, res) => {
  const nonce = crypto.randomBytes(16).toString('base64'); 
  res.render('sign-up', { nonce });
});



router.post('/sign-up', async (req, res) => {
  console.log('📩 Incoming body:', req.body);


  let { email, password, fullName, fullname } = req.body;
  fullName = fullName || fullname; 

  if (!email || !password || !fullName) {
    return res.status(400).json({
      errors: {
        email: !email ? "Email is required" : "",
        password: !password ? "Password is required" : "",
        fullName: !fullName ? "Full name is required" : ""
      }
    });
  }

  try {

    const user = await User.create({ email, password, fullName });


    await UserBasic.create({
      _id: user._id,
      fullname: fullName, 
      aboutMe: "",
      scores: 0,
      eventsVisited: [],
      eventsAttended: [],
      likes: 0,
      profileImage: "default-profile.png",
      isTopLiked: false
    });

    // Создание токена
    const token = CreateToken(user._id);
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    res.status(201).json({ user: user._id });

  } catch (error) {
    console.error('Registration error:', error);
    const errors = handleError(error);
    res.status(400).json({ errors });
  }
});


router.get('/login', (req, res) => {
  const nonce = crypto.randomBytes(16).toString('base64'); 
  res.render('login', { nonce });
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password); 
    const token = CreateToken(user._id);
    
    res.cookie('jwt', token, { 
      httpOnly: true, 
      maxAge: maxAge * 1000, 
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    
    res.status(200).json({
      success: true,
      redirect: '/home'
    });
  } catch (err) {
    const errors = handleError(err);
    console.log('Login errors:', errors);
    
    if (errors.general) {
      res.status(500).json({ message: errors.general });
    } else {
      res.status(401).json({ errors });
    }
  }
});


router.get('/logout', (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 }); 
  res.redirect('/');
});

module.exports = router;
