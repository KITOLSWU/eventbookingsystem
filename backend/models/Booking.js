const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    eventId: { type: String, required: true, index: true },
    username: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["Registered", "Attended", "Cancelled"],
      default: "Registered",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

bookingSchema.index({ eventId: 1, username: 1 }, { unique: true });

module.exports = mongoose.model("Booking", bookingSchema);
