=const express = require('express');
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

const { checkUser, requireAuth, Enter } = require('./mid/JWT.js');
const { getEventsAPI, renderEventsPage } = require('./data/events.js');

const app = express();
app.set('view engine', 'ejs');

// =====================
// VERCEL SAFE UPLOAD FIX
// =====================
const path = require("path");
const fs = require("fs");

// ⚠️ Vercel serverless FIX: use /tmp instead of public/uploads
const uploadsDir =
  process.env.VERCEL === "1"
    ? "/tmp/uploads"
    : path.join(__dirname, "public/uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// serve static only in normal mode
if (!process.env.VERCEL) {
  app.use("/uploads", express.static("public/uploads"));
}

// =====================
// CORS FIX FOR VERCEL
// =====================
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));

app.use(express.static('public'));
app.use(CookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// =====================
// CSP FIX (no localhost in production)
// =====================
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    `default-src 'self'; ` +
    `connect-src 'self' https:; ` +
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; ` +
    `font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; ` +
    `img-src 'self' data: blob: https:; ` +
    `script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;`
  );
  next();
});

// =====================
// MONGODB CACHE (IMPORTANT FOR VERCEL)
// =====================
const dbURI = process.env.MONGODB_URI || 'mongodb+srv://Coder:w8ts54v7@ac-ut0glrz.mjk1imq.mongodb.net/node-users?retryWrites=true&w=majority';

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// =====================
// ROUTES (UNCHANGED)
// =====================
app.get('/.well-known/*', (req, res) => res.status(200).end());
app.use('/', Authroutes);
app.use('/', Challengsrouter);
app.use('/', Profile_router);

app.get('/events', checkUser, requireAuth, renderEventsPage);
app.get('/api/events', getEventsAPI);

// =====================
// ROOT ROUTE (REQUIRED FOR VERCEL)
// =====================
app.get("/", (req, res) => {
  res.send("🚀 API is running on Vercel");
});

// =====================
// HOME ROUTE FIX (safer jwt check)
// =====================
app.get("/home", checkUser, requireAuth, async (req, res) => {
  try {
    await connectDB();

    const token = req.cookies.jwt;
    let username = "Guest";
    let user = null;

    const eventstorender = await Event.find().sort({ date: -1 }).limit(5);

    if (token) {
      const decoded = jwt.verify(token, "w8ts54v7/2012/16/altay/sand");
      user = await UserBasics.findById(decoded.id);
      if (user) username = user.fullName;
    }

    const stats = await (async () => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const activeMembers = await UserBasics.countDocuments();
      const eventsThisMonth = await Event.countDocuments({
        date: { $gte: oneMonthAgo }
      });

      return { activeMembers, eventsThisMonth };
    })();

    res.render("homepage", {
      stats,
      username,
      events: eventstorender,
      topUsers: [],
      user: user || {
        username,
        points: 0,
        level: "Eco Warrior",
        avatar: null,
      },
    });

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send("Server Error");
  }
});

// =====================
// VERCEL EXPORT (CRITICAL)
// =====================
module.exports = app;
