export const defaultEventImage = require("../assets/app_slide_5.jpg");

export const initialEvents = [
  {
    id: "tech-summit",
    title: "Tech Innovators Summit",
    category: "Conference",
    date: "18 Oct 2026",
    time: "10:00 AM",
    venue: "Kohima Convention Hall",
    city: "Kohima",
    organizer: "Naga Tech Collective",
    capacity: 120,
    registered: 86,
    checkedIn: 43,
    price: "Free",
    image: require("../assets/app_slide_5.jpg"),
    description:
      "A full-day meetup for students, developers, and startup builders with talks, workshops, and project showcases.",
    locationUrl: "https://maps.google.com/?q=Kohima%20Convention%20Hall",
  },
  {
    id: "music-night",
    title: "Autumn Music Night",
    category: "Music",
    date: "22 Oct 2026",
    time: "6:30 PM",
    venue: "DDSC Stadium",
    city: "Dimapur",
    organizer: "Echo Events",
    capacity: 250,
    registered: 211,
    checkedIn: 118,
    price: "Rs. 499",
    image: require("../assets/app_slide_4.jpg"),
    description:
      "An evening concert featuring local bands, food stalls, and digital ticket verification at the gate.",
    locationUrl: "https://maps.google.com/?q=DDSC%20Stadium%20Dimapur",
  },
  {
    id: "food-fair",
    title: "Local Food Fair",
    category: "Community",
    date: "25 Oct 2026",
    time: "12:00 PM",
    venue: "Town Square",
    city: "Mokokchung",
    organizer: "Community Circle",
    capacity: 180,
    registered: 94,
    checkedIn: 32,
    price: "Rs. 150",
    image: require("../assets/app_slide_3.jpg"),
    description:
      "A community event for food entrepreneurs with booth registration, attendee booking, and capacity tracking.",
    locationUrl: "https://maps.google.com/?q=Mokokchung%20Town%20Square",
  },
];

export const initialBookings = [
  {
    id: "BK-5336-01",
    eventId: "tech-summit",
    username: "guest",
    status: "Registered",
  },
  {
    id: "BK-5336-02",
    eventId: "food-fair",
    username: "guest",
    status: "Attended",
  },
];
