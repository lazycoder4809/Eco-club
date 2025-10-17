const mongoose = require('mongoose');
const Event = require('./models/Events');

async function seedDatabase() {
  try {
    await mongoose.connect('mongodb+srv://Coder:w8ts54v7@cluster0.mjk1imq.mongodb.net/node-ussers?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log("Connected to DB");

    const events = [
      {
        title: "Earth Hour 2026",
        date: new Date("2026-03-28T20:30:00"),
        location: "Worldwide",
        description: "Час для Земли: выключаем свет и посвящаем час планете.",
        link: "https://www.earthhour.org/",
        tags: ["climate", "awareness"],
        likes: 0
      },
      {
        title: "UN Biodiversity Conference (CBD COP17)",
        startDate: new Date("2026-10-19"),
        endDate: new Date("2026-10-24"),
        location: "Yerevan, Armenia",
        description: "Ключевой саммит по биоразнообразию...",
        link: "https://www.cbd.int/cop/",
        tags: ["UN", "biodiversity", "summit"],
        likes: 0
      }
    ];

    await Event.deleteMany({});
    await Event.insertMany(events);
    console.log("✅ Events inserted!");
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await mongoose.connection.close();
    console.log("DB connection closed");
  }
}

seedDatabase();
