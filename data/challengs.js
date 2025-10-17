const Challenge = require('../models/Challengs');
const  jwt = require('jsonwebtoken');
const UserBasics = require('../models/userDeateilsShema');




const Get_challenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({}).sort({ createdAt: -1 });
    const token = req.cookies.jwt;

    if (!token) {
      return res.render('challenges', {
        challenges, 
        completedChallenges: 0,
        currentRating: 100,
        userRank: 'Новичок',
        totalPoints: 0
      });
    }

    const decoded = jwt.verify(token, "w8ts54v7/2012/16/altay/sand");
    const user = await UserBasics.findById(decoded.id);


    const filteredChallenges = challenges.filter(ch => 
      !user.completedChallenges.includes(ch._id.toString())
    );

    res.render('challenges', {
      challenges: filteredChallenges,
      completedChallenges: user.completedChallenges.length,
      currentRating: user.currentRating || 100,
      userRank: user.rank || 'Новичок',
      totalPoints: user.totalPoints || 0
    });
  } catch (err) {
    console.error('Error fetching challenges:', err);
    res.status(500).send('Internal server error');
  }
};




const Create_Challeng = async (req, res) => {
  try {
    const { title, description, image, duration, difficulty, tags, points } = req.body;

    const newChallenge = new Challenge({
      title,
      description,
      image: image || undefined, 
      duration: duration || 'Не указано',
      difficulty: difficulty || 'medium',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      points: points ? parseInt(points, 10) : undefined
    });

    await newChallenge.save();

    res.json({ success: true, message: "Челлендж создан!", challenge: newChallenge });
  } catch (err) {
    console.error('Error creating challenge:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { Get_challenges, Create_Challeng };
