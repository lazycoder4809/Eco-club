const mongoose = require('mongoose');
const User = require('./models/userDeateilsShema');

mongoose.connect(
  'mongodb+srv://Coder:w8ts54v7@cluster0.mjk1imq.mongodb.net/node-ussers?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
  .then(() => console.log("✅ MongoDB connected for seeding"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const seedUsers = [
  {
    fullname: "Alice Johnson",
    aboutMe: "Люблю природу и волонтёрство 🌿",
    scores: 120,
    eventsVisited: ["Eco Summit 2025", "Green Hackathon"],
    eventsAttended: [], // пока пусто
    likes: 15,
    profileImage: "alice.jpg",
    isTopLiked: false,
    completedChallenges: ["Challenge 1", "Challenge 2"],
  },
  {
    fullname: "Bob Smith",
    aboutMe: "Фотографирую диких животных 🦁",
    scores: 200,
    eventsVisited: ["Wildlife Expo", "Forest Cleanup"],
    eventsAttended: [], // потом заполнишь через attend API
    likes: 25,
    profileImage: "bob.png",
    isTopLiked: true,
    completedChallenges: ["Challenge A", "Challenge B", "Challenge C"], 
  },
  {
    fullname: "Clara Green",
    aboutMe: "Стараюсь жить без пластика 🌍",
    scores: 90,
    eventsVisited: ["Plastic-Free Conference"],
    eventsAttended: [],
    likes: 10,
    profileImage: "clara.jpg",
    isTopLiked: false,
    completedChallenges: [],
  }
];


const seedDB = async () => {
  try {
    await User.deleteMany({});
    console.log("🗑️ Users collection cleared");

    await User.insertMany(seedUsers);
    console.log("🌱 Users seeded successfully");

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error seeding DB:", err);
    mongoose.connection.close();
  }
};

seedDB();