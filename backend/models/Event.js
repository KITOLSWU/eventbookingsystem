const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, default: "General" },
    date: { type: String, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    city: { type: String, required: true },
    organizer: { type: String, default: "Admin" },
    capacity: { type: Number, required: true, default: 50 },
    registered: { type: Number, default: 0 },
    checkedIn: { type: Number, default: 0 },
    price: { type: String, default: "Free" },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    locationUrl: { type: String, default: "" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model("Event", eventSchema);
