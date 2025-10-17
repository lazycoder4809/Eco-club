
  const express = require('express');
  const mongoose = require('mongoose');
  const cors = require('cors');
  const CookieParser = require('cookie-parser');
  const crypto = require('crypto');
  const jwt = require('jsonwebtoken');
  const Security = require('./mid/JWT.js');

  const Event = require('./models/Events.js');
  const UserBasics = require('./models/userDeateilsShema.js');


  const Challengsrouter = require('./router/Challengs.js');
  const Authroutes = require('./router/authRouter.js');
  const Profile_router = require('./router/profile.js');

  // ===== MIDDLEWARE =====
  const { checkUser, requireAuth, Enter } = require('./mid/JWT.js');
  const { getEventsAPI, renderEventsPage } = require('./data/events.js');

  // ===== APP INIT =====
  const app = express();
  app.set('view engine', 'ejs');


  app.use("/uploads", express.static("public/uploads"));
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));
  app.use(express.static('public'));
  app.use(CookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use((req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      `default-src 'self'; ` +
      `connect-src 'self' http://localhost:3000; ` +
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; ` +
      `font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; ` +
      `img-src 'self' data: blob: http://localhost:3000 https://cdn-icons-png.flaticon.com https://images.unsplash.com; ` +
      `script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;`
    );
    next();
  });


  const getStats = async () => {
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const activeMembers = await UserBasics.countDocuments();
      const eventsThisMonth = await Event.countDocuments({
        date: { $gte: oneMonthAgo }
      });

      return { activeMembers, eventsThisMonth };
    } catch (err) {
      console.error("❌ Error fetching stats:", err);
      return { activeMembers: 0, eventsThisMonth: 0 };
    }
  };






  async function getTopUsersByScores(limit = 5) {
    try {
      const topUsers = await UserBasics.find({}, { fullname: 1, scores: 1, profileImage: 1 })
        .sort({ scores: -1 })  
        .limit(limit)
        .lean();

      return topUsers;
    } catch (error) {
      console.error("Ошибка при получении топ пользователей:", error);
      throw new Error("Не удалось получить топ пользователей");
    }
  }





  // ===== ROUTES =====
  app.get('/.well-known/*', (req, res) => res.status(200).end());
  app.use('/', Authroutes);
  app.use('/', Challengsrouter);
  app.use('/', Profile_router);

  app.get('/events', checkUser, requireAuth, renderEventsPage);
  app.get('/api/events', getEventsAPI);

  // ===== CREATE EVENT =====
  app.post('/events', async (req, res) => {
    try {
      const { title, date, startDate, endDate, location, description, link, tags } = req.body;
      const newEvent = new Event({
        title,
        date: date ? new Date(date) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        location,
        description,
        link: link || '',
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
        likes: 0
      });

      await newEvent.save();
      res.status(201).json({ success: true, event: newEvent });
    } catch (err) {
      console.error("❌ Error creating event:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ===== LIKE EVENT =====
  app.post('/events/:id/like', requireAuth, async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      const userId = req.user.id;
      const alreadyLiked = event.likedBy.includes(userId);

      if (req.body.unlike && alreadyLiked) {
        event.likes -= 1;
        event.likedBy.pull(userId);
      } else if (!alreadyLiked) {
        event.likes += 1;
        event.likedBy.push(userId);
      }

      await event.save();
      res.json({ success: true, likes: event.likes });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ===== ATTEND EVENT =====
  app.post("/api/events/attend", requireAuth, async (req, res) => {
    try {
      const { eventId } = req.body;
      const token = req.cookies.jwt;
      if (!token) return res.status(401).json({ success: false, error: "Not authenticated" });

      const decoded = jwt.verify(token, "w8ts54v7/2012/16/altay/sand");
      const user = await UserBasics.findById(decoded.id);
      if (!user) return res.status(404).json({ success: false, error: "User not found" });

      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ success: false, error: "Event not found" });

      if (!user.eventsAttended.includes(event._id)) {
        user.eventsAttended.push(event._id);
        user.eventsVisited += 1;
        await user.save();
      }

      res.json({
        success: true,
        message: "Event attended successfully",
        attendedCount: user.eventsVisited,
        events: user.eventsAttended
      });

    } catch (err) {
      console.error("❌ Attend event error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ===== ADMIN =====
  app.get('/admin', Security.adminCheck ,(req, res) => res.render('admin'));
  app.post('/admin', async (req, res) => {
    try {
      const { title, date, location, link, description, tags } = req.body;
      const newEvent = new Event({
        title,
        date: date ? new Date(date) : null,
        location,
        link: link || '',
        description,
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
        likes: 0
      });

      await newEvent.save();
      res.json({ success: true, message: 'Event added!', eventId: newEvent._id });
    } catch (err) {
      console.error('❌ Error saving event:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });



  

  
app.get("/home", checkUser, requireAuth, async (req, res) => {
  try {
    const token = req.cookies.jwt;
    let username = "Guest";
    let user = null;


    const eventstorender = await Event.find().sort({ date: -1 }).limit(5);


    if (token) {
      const decoded = jwt.verify(token, "w8ts54v7/2012/16/altay/sand");
      user = await UserBasics.findById(decoded.id);
      if (user) {
        username = user.fullName;
      }
    }


    const stats = await getStats();


    const topUsers = await getTopUsersByScores(5);


    res.render("homepage", {
      stats,
      username,
      events: eventstorender,
      topUsers, 
      user: user || {
        username: username,
        points: 0,
        level: "Eco Warrior",
        avatar: null,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching home page data:", err);
    res.status(500).send("Server Error");
  }
});






  app.get('/', (req, res) => res.render('welcome'));
  app.get('/smoothies', (req, res) => res.render('smoothies'));

  // ===== COOKIES =====
  app.get('/set-cookie', (req, res) => {
    res.cookie('newUser', true);
    res.cookie('newAdmin', false, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true
    });
    res.send('Cookie has been set!');
  });

  app.get('/read-cookie', (req, res) => {
    res.send(req.cookies);
  });

  // ===== DB CONNECTION =====
  const dbURI = 'mongodb+srv://Coder:w8ts54v7@cluster0.mjk1imq.mongodb.net/node-ussers?retryWrites=true&w=majority';

  mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('✅ MongoDB connected');
      app.listen(3000, () => {
        console.log('✅ Server running on http://localhost:3000');
      });
    })
    .catch(err => console.error('❌ MongoDB connection error:', err));

