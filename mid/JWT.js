const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const Event = require('../models/Events'); 


const requireAuth = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    try {
      const decodedToken = jwt.verify(token, 'w8ts54v7/2012/16/altay/sand');
      console.log('✅ Token verified successfully:', decodedToken);

      const user = await User.findById(decodedToken.id);
      if (!user) {
        console.log('⚠️ User not found in DB');
        return res.redirect('/login');
      }

      req.user = user;
      next(); //
    } catch (err) {
      console.log('❌ Token verification failed:', err.message);
      return res.redirect('/login'); 
    }
  } else {
    console.log('⚠️ No token found, redirecting to login');
    return res.redirect('/login');
  }
};




const checkUser = (req, res, next) => {
  const tokenU = req.cookies.jwt;

  if (tokenU) {
    jwt.verify(tokenU, 'w8ts54v7/2012/16/altay/sand', async (err, decodedToken) => {
      if (err) {
        console.log('❌ User token verification failed:', err.message);
        res.locals.user = null;
        next(); 
      } else {
        try {
          let user = await User.findById(decodedToken.id);
          res.locals.user = user;
          next();
        } catch (e) {
          console.log('❌ Error  user:', e.message);
          res.locals.user = null;
          next();
        }
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

const Enter = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, 'w8ts54v7/2012/16/altay/sand', (err, decodedToken) => {
      if (err) {
        console.log('❌ Token verification failed:', err.message);
        return res.redirect('/login'); 
      } else {
        console.log('✅ Token verified successfully:', decodedToken);
        return res.redirect('/home'); 
      }
    }); 
  } else {
    console.log('⚠️ No token found, redirecting to login');
    return next(); 
  }
}




const getStats = async () => {
  try {
    const activeMembers = await User.countDocuments();
    const eventsThisMonth = await Event.countDocuments({
      date: { $gte: oneMonthAgo }
    });

    return { activeMembers, eventsThisMonth };
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};


const adminCheck = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    console.log('⚠️ No token found, redirecting to login');
    return res.redirect('/login');
  }

  try {
    const decodedToken = jwt.verify(token, 'w8ts54v7/2012/16/altay/sand');
    const user = await User.findById(decodedToken.id);

    if (!user) {
      console.log('⚠️ User not found in DB');
      return res.redirect('/login');
    }


    const ADMIN_ID = '68f23df897b7313517bcc083';

    if (user._id.toString() !== ADMIN_ID) {
      console.log('🚫 Access denied — user is not admin');
      return res.status(403).render('noAccess');
    }

    console.log('✅ Admin verified:', user.email);
    req.user = user;
    next();
  } catch (err) {
    console.log('❌ Admin token verification failed:', err.message);
    return res.redirect('/login');
  }
};




module.exports = {requireAuth, checkUser,Enter,getStats,adminCheck};
