const Event = require('../models/Events');
const User = require('../models/User');
const UserBasics = require('../models/userDeateilsShema');
const jwt = require('jsonwebtoken');


const cleanOldEvents = async () => {
  try {
    const now = new Date();
    const result = await Event.deleteMany({
      $or: [
        { date: { $lt: now } },
        { endDate: { $lt: now } }
      ]
    });
    console.log(`Cleaned up ${result.deletedCount} old events`);
  } catch (err) {
    console.error('Error cleaning old events:', err);
  }
};

// --- API ---
const getEventsAPI = async (req, res) => {
  try {
    await cleanOldEvents();
    const events = await Event.find({}).sort({ date: 1, startDate: 1 });

    const formattedEvents = events.map(event => ({
      id: event._id,
      title: event.title,
      dateISO: event.date || event.startDate,
      location: event.location,
      tag: event.tags.length > 0 ? event.tags[0] : 'other',
      description: event.description,
      spotsTotal: 1000,
      spotsTaken: Math.floor(Math.random() * 500),
      rsvped: false
    }));

    res.json(formattedEvents);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, date, location, link, description, tags } = req.body;
    const newEvent = new Event({
      title,
      date: new Date(date),
      location,
      link: link || '',
      description,
      tags: tags || []
    });

    await newEvent.save();
    res.json({ success: true, message: 'Event added!', eventId: newEvent._id });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
};












const filterAttendedEvents = async (req) => {
 try{
  const token = req.cookies.jwt;
  if (!token) return [];

  const decoded = jwt.verify(token, "w8ts54v7/2012/16/altay/sand");
  const user = await UserBasics.findById(decoded.id);
  if (!user) return [];

  return user.eventsAttended || [];
 } catch (err) {
  console.error("Error filtering attended events:", err);
 }

};




const renderEventsPage = async (req, res) => {
  try {
    await cleanOldEvents();


    const attended = await filterAttendedEvents(req);


    const events = await Event.find({
      _id: { $nin: attended }
    }).sort({ date: 1, startDate: 1 });

    res.render('events', { events });
  } catch (err) {
    console.error('Error loading events page:', err);
    res.status(500).send("Error loading events");
  }
};


module.exports = { getEventsAPI, createEvent, renderEventsPage,};
