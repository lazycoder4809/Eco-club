// seedChallenges.js
const mongoose = require('mongoose');
const Challenge = require('./models/Challengs');


const MONGO_URI = 'mongodb+srv://Coder:w8ts54v7@cluster0.mjk1imq.mongodb.net/node-ussers?retryWrites=true&w=majority';

const challenges = [
  {
    title: 'Eco-Friendly Week',
    description: 'Сделай свою неделю более экологичной: используй меньше пластика, сортируй мусор.',
    image: 'https://images.unsplash.com/photo-1503264116251-35a269479413?q=80&w=1200&auto=format&fit=crop',
    duration: '7 дней',
    difficulty: 'easy',
    tags: ['eco', 'plastic-free', 'recycle'],
    points: 10
  },
  {
    title: 'Fitness Sprint',
    description: 'Тренируйся каждый день по 30 минут — бег, йога или кардио.',
    image: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=1200&auto=format&fit=crop',
    duration: '14 дней',
    difficulty: 'medium',
    tags: ['fitness', 'health', 'challenge'],
    points: 20
  },
  {
    title: 'Digital Detox',
    description: 'Отключи социальные сети и используй телефон максимум 1 час в день.',
    image: 'https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=1200&auto=format&fit=crop',
    duration: '3 дня',
    difficulty: 'hard',
    tags: ['focus', 'detox', 'mindfulness'],
    points: 50
  }
];


const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('🚀 Connected to MongoDB');


    await Challenge.deleteMany({});
    console.log('🧹 Challenges cleared');


    await Challenge.insertMany(challenges);
    console.log('🌱 Challenges seeded successfully!');

    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error seeding challenges:', err);
    mongoose.connection.close();
  }
};

seed();
