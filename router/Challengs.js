const router = require('express').Router();
const challengeController = require('../data/challengs');
const Mid = require('../mid/JWT.js');
const Challenge = require('../models/Challengs');
const UserBasics = require('../models/userDeateilsShema');
const jwt = require('jsonwebtoken');
const sec = require('../mid/JWT.js');


router.get('/challenges',Mid.requireAuth, challengeController.Get_challenges);



router.get('/admincha', sec.adminCheck,(req,res) =>{
  res.render('admincha');
})
router.post('/admincha', challengeController.Create_Challeng);



router.post('/challenges/:id/like', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    const userId = req.body.id; 


    if (challenge.likedBy.includes(userId)) {
      return res.status(400).json({ success: false, message: 'You have already liked this challenge' });
    }

    challenge.likedBy.push(userId);
    challenge.likes = challenge.likedBy.length; 
    await challenge.save();
    
    res.json({ success: true, likes: challenge.likes });
  } catch (err) {
    console.error('Error liking challenge:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});


router.post('/challenges/:id/submit', async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ success: false, error: "Not authenticated" });

    const decoded = jwt.verify(token, "w8ts54v7/2012/16/altay/sand");
    const userId = decoded.id;

    const user = await UserBasics.findById(userId);
    const challenge = await Challenge.findById(req.params.id);

    if (!user || !challenge) {
      return res.status(404).json({ success: false, error: "User or challenge not found" });
    }


    if (!user.completedChallenges.includes(challenge._id.toString())) {
      user.completedChallenges.push(challenge._id.toString());
      user.scores += challenge.points; 
      await user.save();
    }

    res.json({ success: true, scores: user.scores, completedChallenges: user.completedChallenges });
  } catch (err) {
    console.error("Error submitting challenge:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
 


module.exports = router;
