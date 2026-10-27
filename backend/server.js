const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const cors = require("cors");
require("dotenv").config();

const Event = require("./models/Event");
const Booking = require("./models/Booking");
const User = require("./models/User");

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// Test whether the backend is running
app.get("/", (req, res) => {
  res.send("Event Booking Backend is running!");
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

// ---------- Auth ----------
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ ok: false, message: "Username and password are required." });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res
        .status(409)
        .json({ ok: false, message: "Username already exists." });
    }

    const user = await User.create({ username, password, role: "customer" });
    res.status(201).json({
      ok: true,
      role: "customer",
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ ok: false, message: "Username and password are required." });
    }

    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ ok: false, message: "Invalid credentials." });
    }

    res.json({
      ok: true,
      role: user.role,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

// ---------- Events ----------
app.get("/api/events", async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { title: regex },
        { category: regex },
        { city: regex },
        { venue: regex },
      ];
    }
    const events = await Event.find(filter).sort({ createdAt: -1 });
    res.json({ ok: true, events });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.get("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findOne({ id: req.params.id });
    if (!event) {
      return res.status(404).json({ ok: false, message: "Event not found." });
    }
    res.json({ ok: true, event });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.post("/api/events", async (req, res) => {
  try {
    const {
      title,
      category,
      date,
      time,
      venue,
      city,
      organizer,
      capacity,
      price,
      description,
    } = req.body;

    if (!title || !date || !time || !venue || !city || !capacity) {
      return res.status(400).json({
        ok: false,
        message: "Title, date, time, venue, city, and capacity are required.",
      });
    }

    const slug = `${title}-${Date.now()}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const event = await Event.create({
      id: slug,
      title,
      category: category || "General",
      date,
      time,
      venue,
      city,
      organizer: organizer || "Admin",
      capacity: Number(capacity),
      price: price || "Free",
      description: description || "",
      image: req.body.image || "",
      locationUrl: `https://maps.google.com/?q=${encodeURIComponent(
        `${venue} ${city}`
      )}`,
    });

    res.status(201).json({ ok: true, event });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

// ---------- Users ----------
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    res.json({ ok: true, users });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

// ---------- Bookings ----------
app.post("/api/bookings", async (req, res) => {
  try {
    const { eventId, username } = req.body;
    if (!eventId || !username) {
      return res
        .status(400)
        .json({ ok: false, message: "eventId and username are required." });
    }

    const event = await Event.findOne({ id: eventId });
    if (!event) {
      return res.status(404).json({ ok: false, message: "Event not found." });
    }

    const existingBooking = await Booking.findOne({ eventId, username });
    if (existingBooking) {
      return res.json({ ok: true, booking: existingBooking });
    }

    if (event.registered >= event.capacity) {
      return res
        .status(409)
        .json({ ok: false, message: "Event is fully booked." });
    }

    const bookingId = `BK-${eventId
      .toUpperCase()
      .slice(0, 4)}-${Date.now().toString().slice(-5)}`;

    const booking = await Booking.create({
      id: bookingId,
      eventId,
      username,
      status: "Registered",
    });

    event.registered = Math.min(event.registered + 1, event.capacity);
    await event.save();

    res.status(201).json({ ok: true, booking });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ ok: false, message: "You already booked this event." });
    }
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.get("/api/bookings/user/:username", async (req, res) => {
  try {
    const bookings = await Booking.find({ username: req.params.username }).sort({
      createdAt: -1,
    });
    res.json({ ok: true, bookings });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.patch("/api/bookings/:id/checkin", async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { id: req.params.id, status: { $ne: "Attended" } },
      { $set: { status: "Attended" } },
      { new: true }
    );
    if (!booking) {
      const existingBooking = await Booking.findOne({ id: req.params.id });
      if (!existingBooking) {
        return res.status(404).json({ ok: false, message: "Booking not found." });
      }
      return res.json({
        ok: true,
        already: true,
        booking: existingBooking,
      });
    }

    await Event.updateOne(
      {
        id: booking.eventId,
        $expr: {
          $lt: [
            { $ifNull: ["$checkedIn", 0] },
            { $ifNull: ["$registered", 0] },
          ],
        },
      },
      { $inc: { checkedIn: 1 } }
    );
    const event = await Event.findOne({ id: booking.eventId });

    res.json({ ok: true, booking, event });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
