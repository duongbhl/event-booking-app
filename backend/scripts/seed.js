const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    avatar: String,
    country: String,
    interests: [{ type: String }],
    location: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    phone: String,
    description: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
    verified: { type: Boolean, default: false },
    notificationsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    category: { type: String, required: true },
    price: { type: Number, default: 0 },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    images: String,
    member: { type: Number, default: 0 },
    attendees: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "finished", "cancelled"],
      default: "upcoming",
    },
    approvalStatus: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ticketTiers: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quota: { type: Number, required: true },
        sold: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

const ticketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    price: { type: Number, required: true },
    ticketType: { type: String, required: true },
    tierName: String,
    seatInfo: String,
    qrCode: String,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    checked: { type: Boolean, default: false },
    checkedAt: Date,
    checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bookedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
  },
  { timestamps: true }
);

const bookmarkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);
const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
const Bookmark = mongoose.models.Bookmark || mongoose.model("Bookmark", bookmarkSchema);

const users = [
  {
    name: "System Admin",
    email: "admin@example.com",
    password: "Admin123!",
    role: "admin",
    verified: true,
    country: "Vietnam",
    location: "Ho Chi Minh City",
    interests: ["management", "music"],
    description: "Administrator account for the event booking app.",
  },
  {
    name: "Nguyen Van A",
    email: "user1@example.com",
    password: "User123!",
    role: "user",
    verified: true,
    country: "Vietnam",
    location: "Ha Noi",
    interests: ["technology", "workshop"],
    description: "Regular attendee who likes startup and tech events.",
  },
  {
    name: "Tran Thi B",
    email: "user2@example.com",
    password: "User123!",
    role: "user",
    verified: true,
    country: "Vietnam",
    location: "Da Nang",
    interests: ["music", "art"],
    description: "Regular attendee who enjoys concerts and exhibitions.",
  },
];

function buildEvents(organizerMap) {
  return [
    {
      title: "Tech Meetup 2026",
      description: "Community meetup for mobile and web developers.",
      category: "Technology",
      price: 0,
      date: new Date("2026-07-10T00:00:00.000Z"),
      time: "18:30",
      location: "Ho Chi Minh City",
      coordinates: { latitude: 10.7769, longitude: 106.7009 },
      member: 150,
      attendees: 85,
      rating: 4.6,
      status: "upcoming",
      approvalStatus: "ACCEPTED",
      organizer: organizerMap["admin@example.com"],
      ticketTiers: [
        { name: "Standard", price: 0, quota: 120, sold: 70 },
        { name: "VIP", price: 199000, quota: 30, sold: 15 },
      ],
    },
    {
      title: "Live Acoustic Night",
      description: "An intimate live music night with local artists.",
      category: "Music",
      price: 149000,
      date: new Date("2026-07-18T00:00:00.000Z"),
      time: "19:45",
      location: "Da Nang",
      coordinates: { latitude: 16.0544, longitude: 108.2022 },
      member: 200,
      attendees: 120,
      rating: 4.8,
      status: "upcoming",
      approvalStatus: "ACCEPTED",
      organizer: organizerMap["user2@example.com"],
      ticketTiers: [
        { name: "Economy", price: 149000, quota: 150, sold: 100 },
        { name: "Front Row", price: 299000, quota: 50, sold: 20 },
      ],
    },
    {
      title: "Startup Pitch Workshop",
      description: "Hands-on workshop for founders preparing investor pitches.",
      category: "Workshop",
      price: 99000,
      date: new Date("2026-08-02T00:00:00.000Z"),
      time: "08:30",
      location: "Ha Noi",
      coordinates: { latitude: 21.0278, longitude: 105.8342 },
      member: 80,
      attendees: 36,
      rating: 4.4,
      status: "upcoming",
      approvalStatus: "PENDING",
      organizer: organizerMap["user1@example.com"],
      ticketTiers: [
        { name: "General", price: 99000, quota: 60, sold: 25 },
        { name: "Mentoring", price: 249000, quota: 20, sold: 11 },
      ],
    },
  ];
}

async function seedUsers() {
  const organizerMap = {};

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const doc = await User.findOneAndUpdate(
      { email: user.email },
      { ...user, password: hashedPassword },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    organizerMap[user.email] = doc._id;
  }

  return organizerMap;
}

async function seedEvents(organizerMap) {
  const titles = ["Tech Meetup 2026", "Live Acoustic Night", "Startup Pitch Workshop"];
  await Event.deleteMany({ title: { $in: titles } });
  return Event.insertMany(buildEvents(organizerMap));
}

async function seedRelations() {
  const [admin, user1, user2] = await Promise.all([
    User.findOne({ email: "admin@example.com" }),
    User.findOne({ email: "user1@example.com" }),
    User.findOne({ email: "user2@example.com" }),
  ]);

  const [techMeetup, acousticNight, pitchWorkshop] = await Promise.all([
    Event.findOne({ title: "Tech Meetup 2026" }),
    Event.findOne({ title: "Live Acoustic Night" }),
    Event.findOne({ title: "Startup Pitch Workshop" }),
  ]);

  const trackedEventIds = [techMeetup, acousticNight, pitchWorkshop].filter(Boolean).map((event) => event._id);
  const trackedUserIds = [admin, user1, user2].filter(Boolean).map((user) => user._id);

  await Promise.all([
    Ticket.deleteMany({ event: { $in: trackedEventIds } }),
    Review.deleteMany({ event: { $in: trackedEventIds } }),
    Bookmark.deleteMany({ user: { $in: trackedUserIds } }),
  ]);

  await Ticket.insertMany([
    {
      user: user1._id,
      event: techMeetup._id,
      price: 0,
      ticketType: "Standard",
      tierName: "Standard",
      paymentStatus: "paid",
      checked: false,
      qrCode: "QR-TECH-USER1",
    },
    {
      user: user2._id,
      event: acousticNight._id,
      price: 149000,
      ticketType: "Economy",
      tierName: "Economy",
      paymentStatus: "paid",
      checked: false,
      qrCode: "QR-MUSIC-USER2",
    },
    {
      user: admin._id,
      event: pitchWorkshop._id,
      price: 249000,
      ticketType: "Mentoring",
      tierName: "Mentoring",
      paymentStatus: "pending",
      checked: false,
      qrCode: "QR-WORKSHOP-ADMIN",
    },
  ]);

  await Review.insertMany([
    {
      user: user1._id,
      event: techMeetup._id,
      rating: 5,
      comment: "Useful meetup with practical sharing.",
    },
    {
      user: user2._id,
      event: acousticNight._id,
      rating: 4,
      comment: "Great music and nice atmosphere.",
    },
  ]);

  await Bookmark.insertMany([
    {
      user: admin._id,
      event: acousticNight._id,
    },
    {
      user: user1._id,
      event: pitchWorkshop._id,
    },
    {
      user: user2._id,
      event: techMeetup._id,
    },
  ]);
}

async function main() {
  if (!process.env.DB_URI) {
    throw new Error("Missing DB_URI in backend/.env");
  }

  await mongoose.connect(process.env.DB_URI);

  const organizerMap = await seedUsers();
  await seedEvents(organizerMap);
  await seedRelations();

  console.log("Seed completed successfully.");
  console.log("Admin login: admin@example.com / Admin123!");
  console.log("User login: user1@example.com / User123!");
  console.log("User login: user2@example.com / User123!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
