/* eslint-disable */
/**
 * GlobeTrotter database seeder.
 *
 *   npm run seed
 *
 * Reads MONGODB_URI from .env.local (falls back to .env). Wipes the core
 * collections and inserts a rich, demo-ready dataset:
 *   • demo@globetrotter.app / demo123   (traveler with sample trips)
 *   • admin@globetrotter.app / admin123 (admin — can open /admin analytics)
 *   • a handful of community members + posts, cities, and activities.
 *
 * Safe to run repeatedly.
 */
require("dotenv").config({ path: ".env.local" });
require("dotenv").config(); // fallback to .env

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("\n✖ MONGODB_URI is not set. Add it to .env.local (see .env.example).\n");
  process.exit(1);
}

/* ------------------------------------------------------------------ *
 * Minimal schemas (mirror src/models) — kept inline so this script
 * runs standalone under plain Node (CommonJS), independent of the app.
 * ------------------------------------------------------------------ */
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: String,
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    passwordHash: String,
    photo: String,
    phone: String,
    city: String,
    country: String,
    additionalInfo: String,
    role: { type: String, default: "user" },
    language: { type: String, default: "English" },
    savedDestinations: [String],
  },
  { timestamps: true }
);

const ActivitySub = new Schema({
  name: String,
  description: String,
  category: String,
  date: Date,
  time: String,
  cost: Number,
  duration: String,
});

const StopSub = new Schema({
  cityName: String,
  country: String,
  image: String,
  startDate: Date,
  endDate: Date,
  order: Number,
  notes: String,
  activities: [ActivitySub],
});

const TripSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    name: String,
    description: String,
    coverPhoto: String,
    startDate: Date,
    endDate: Date,
    isPublic: Boolean,
    budgetBreakdown: {
      transport: Number,
      stay: Number,
      meals: Number,
      activities: Number,
    },
    stops: [StopSub],
  },
  { timestamps: true }
);

const CitySchema = new Schema({
  name: String,
  country: String,
  region: String,
  description: String,
  image: String,
  costIndex: Number,
  popularity: Number,
  currency: String,
  avgDailyCost: Number,
  tags: [String],
});

const ActivityDocSchema = new Schema({
  name: String,
  city: String,
  country: String,
  category: String,
  description: String,
  image: String,
  cost: Number,
  duration: String,
  rating: Number,
  popularity: Number,
});

const CommunityPostSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    authorName: String,
    authorPhoto: String,
    title: String,
    content: String,
    location: String,
    activity: String,
    image: String,
    trip: { type: Schema.Types.ObjectId, ref: "Trip" },
    likes: Number,
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    tags: [String],
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
const Trip = mongoose.model("Trip", TripSchema);
const City = mongoose.model("City", CitySchema);
const Activity = mongoose.model("Activity", ActivityDocSchema);
const CommunityPost = mongoose.model("CommunityPost", CommunityPostSchema);

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */
// Deterministic, keyword-relevant placeholder image (mirrors lib/utils.unsplash).
function img(keyword, w = 800, h = 600) {
  const kw = String(keyword || "travel").toLowerCase().trim();
  const tags = encodeURIComponent(
    [...kw.split(/[\s,]+/).filter(Boolean).slice(0, 2), "travel"].join(",")
  );
  let lock = 7;
  for (let i = 0; i < kw.length; i++) lock = (lock * 31 + kw.charCodeAt(i)) % 100000;
  return `https://loremflickr.com/${w}/${h}/${tags}?lock=${lock}`;
}
const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(9, 0, 0, 0);
  return d;
};

/* ------------------------------------------------------------------ *
 * Data
 * ------------------------------------------------------------------ */
const CITIES = [
  { name: "Tokyo", country: "Japan", region: "Asia", costIndex: 4, popularity: 96, currency: "JPY", avgDailyCost: 120, tags: ["food", "culture", "city", "shopping"], description: "A dazzling blend of ultramodern and traditional — neon streets, ancient temples, and the world's best food scene." },
  { name: "Kyoto", country: "Japan", region: "Asia", costIndex: 3, popularity: 88, currency: "JPY", avgDailyCost: 95, tags: ["culture", "temples", "nature"], description: "Japan's cultural heart: golden pavilions, geisha districts, and thousands of serene shrines." },
  { name: "Bangkok", country: "Thailand", region: "Asia", costIndex: 2, popularity: 90, currency: "THB", avgDailyCost: 45, tags: ["food", "nightlife", "budget", "temples"], description: "Chaotic, colorful, and endlessly fun — street food, grand palaces, and buzzing markets." },
  { name: "Bali", country: "Indonesia", region: "Asia", costIndex: 2, popularity: 92, currency: "IDR", avgDailyCost: 40, tags: ["beach", "nature", "relaxation", "budget"], description: "Island paradise of rice terraces, surf beaches, and spiritual retreats." },
  { name: "Singapore", country: "Singapore", region: "Asia", costIndex: 4, popularity: 85, currency: "SGD", avgDailyCost: 110, tags: ["city", "food", "family", "shopping"], description: "A futuristic garden-city where cultures and cuisines collide in spotless style." },
  { name: "Paris", country: "France", region: "Europe", costIndex: 4, popularity: 98, currency: "EUR", avgDailyCost: 130, tags: ["culture", "food", "romance", "city"], description: "The eternal city of light — art, avenues, cafés, and the incomparable Louvre." },
  { name: "Rome", country: "Italy", region: "Europe", costIndex: 3, popularity: 94, currency: "EUR", avgDailyCost: 100, tags: ["history", "food", "culture"], description: "An open-air museum where every cobblestone tells a 2,000-year-old story." },
  { name: "Barcelona", country: "Spain", region: "Europe", costIndex: 3, popularity: 91, currency: "EUR", avgDailyCost: 95, tags: ["beach", "architecture", "nightlife", "food"], description: "Gaudí's surreal masterpieces meet Mediterranean beaches and tapas-fueled nights." },
  { name: "Santorini", country: "Greece", region: "Europe", costIndex: 4, popularity: 89, currency: "EUR", avgDailyCost: 140, tags: ["beach", "romance", "relaxation"], description: "Whitewashed cliffs, blue domes, and the most famous sunsets in the world." },
  { name: "New York", country: "United States", region: "North America", costIndex: 5, popularity: 95, currency: "USD", avgDailyCost: 200, tags: ["city", "culture", "shopping", "nightlife"], description: "The city that never sleeps — skyscrapers, Broadway, and a neighborhood for every mood." },
  { name: "Vancouver", country: "Canada", region: "North America", costIndex: 4, popularity: 80, currency: "CAD", avgDailyCost: 130, tags: ["nature", "city", "outdoors"], description: "Glass towers framed by mountains and ocean — where urban life meets the wild." },
  { name: "Cancún", country: "Mexico", region: "North America", costIndex: 3, popularity: 83, currency: "MXN", avgDailyCost: 90, tags: ["beach", "party", "family", "relaxation"], description: "Turquoise Caribbean waters, ancient Mayan ruins, and resort-lined white sand." },
  { name: "Rio de Janeiro", country: "Brazil", region: "South America", costIndex: 2, popularity: 82, currency: "BRL", avgDailyCost: 60, tags: ["beach", "nightlife", "nature"], description: "Samba rhythms, Copacabana sands, and Christ the Redeemer watching over it all." },
  { name: "Cusco", country: "Peru", region: "South America", costIndex: 2, popularity: 78, currency: "PEN", avgDailyCost: 50, tags: ["history", "adventure", "nature"], description: "The gateway to Machu Picchu — Incan walls, Andean markets, and thin mountain air." },
  { name: "Cape Town", country: "South Africa", region: "Africa", costIndex: 2, popularity: 84, currency: "ZAR", avgDailyCost: 65, tags: ["nature", "beach", "adventure", "wine"], description: "Table Mountain, penguin beaches, and vineyards — a stunning meeting of land and sea." },
  { name: "Marrakech", country: "Morocco", region: "Africa", costIndex: 2, popularity: 79, currency: "MAD", avgDailyCost: 45, tags: ["culture", "markets", "history"], description: "A sensory maze of souks, spice markets, riads, and palm-fringed desert edges." },
  { name: "Sydney", country: "Australia", region: "Oceania", costIndex: 4, popularity: 87, currency: "AUD", avgDailyCost: 135, tags: ["beach", "city", "nature", "family"], description: "Iconic harbor, golden surf beaches, and a laid-back cosmopolitan buzz." },
  { name: "Dubai", country: "UAE", region: "Middle East", costIndex: 4, popularity: 86, currency: "AED", avgDailyCost: 150, tags: ["luxury", "shopping", "city", "family"], description: "Record-breaking skylines, desert safaris, and gold-plated luxury in the sand." },
];

const ACTIVITIES = [
  // Tokyo
  { name: "Shibuya Crossing & Nightlife Walk", city: "Tokyo", country: "Japan", category: "Sightseeing", cost: 0, duration: "2h", rating: 4.7, popularity: 95, description: "Experience the world's busiest crossing, then explore neon-lit backstreets and izakayas." },
  { name: "Tsukiji Outer Market Food Tour", city: "Tokyo", country: "Japan", category: "Food & Dining", cost: 65, duration: "3h", rating: 4.9, popularity: 93, description: "Taste fresh sushi, tamago, and street snacks with a local guide." },
  { name: "teamLab Digital Art Museum", city: "Tokyo", country: "Japan", category: "Culture & History", cost: 30, duration: "3h", rating: 4.8, popularity: 90, description: "Step into an immersive, interactive world of light and digital art." },
  // Kyoto
  { name: "Fushimi Inari Shrine Hike", city: "Kyoto", country: "Japan", category: "Culture & History", cost: 0, duration: "2.5h", rating: 4.9, popularity: 94, description: "Walk beneath thousands of vermilion torii gates up the sacred mountain." },
  { name: "Arashiyama Bamboo Grove", city: "Kyoto", country: "Japan", category: "Nature & Outdoors", cost: 0, duration: "1.5h", rating: 4.6, popularity: 88, description: "Wander the ethereal towering bamboo forest at the city's edge." },
  { name: "Traditional Tea Ceremony", city: "Kyoto", country: "Japan", category: "Culture & History", cost: 40, duration: "1h", rating: 4.7, popularity: 82, description: "Learn the art of matcha in an authentic machiya townhouse." },
  // Bangkok
  { name: "Grand Palace & Wat Pho", city: "Bangkok", country: "Thailand", category: "Culture & History", cost: 25, duration: "3h", rating: 4.6, popularity: 89, description: "Marvel at gilded temples and the reclining Buddha in the royal heart of the city." },
  { name: "Floating Market Long-tail Tour", city: "Bangkok", country: "Thailand", category: "Adventure", cost: 35, duration: "4h", rating: 4.5, popularity: 84, description: "Cruise the canals to a colorful floating market by traditional boat." },
  { name: "Street Food Crawl in Chinatown", city: "Bangkok", country: "Thailand", category: "Food & Dining", cost: 20, duration: "3h", rating: 4.8, popularity: 91, description: "Feast on pad thai, mango sticky rice, and grilled satay in Yaowarat." },
  // Bali
  { name: "Ubud Rice Terrace Sunrise", city: "Bali", country: "Indonesia", category: "Nature & Outdoors", cost: 15, duration: "3h", rating: 4.8, popularity: 90, description: "Watch dawn break over the emerald Tegallalang rice terraces." },
  { name: "Uluwatu Temple & Kecak Dance", city: "Bali", country: "Indonesia", category: "Culture & History", cost: 22, duration: "3h", rating: 4.7, popularity: 86, description: "Cliffside temple at sunset followed by a hypnotic fire dance." },
  { name: "Surf Lesson at Kuta Beach", city: "Bali", country: "Indonesia", category: "Water Sports", cost: 30, duration: "2h", rating: 4.6, popularity: 80, description: "Catch your first wave with friendly local instructors." },
  // Singapore
  { name: "Gardens by the Bay", city: "Singapore", country: "Singapore", category: "Sightseeing", cost: 20, duration: "3h", rating: 4.8, popularity: 92, description: "Explore the Supertree Grove and futuristic climate-controlled domes." },
  { name: "Hawker Center Food Safari", city: "Singapore", country: "Singapore", category: "Food & Dining", cost: 18, duration: "2.5h", rating: 4.9, popularity: 88, description: "Sample Michelin-recognized chicken rice, laksa, and chili crab." },
  // Paris
  { name: "Louvre Museum Skip-the-Line", city: "Paris", country: "France", category: "Culture & History", cost: 45, duration: "3h", rating: 4.7, popularity: 93, description: "See the Mona Lisa and millennia of masterpieces with priority entry." },
  { name: "Eiffel Tower Summit at Sunset", city: "Paris", country: "France", category: "Sightseeing", cost: 35, duration: "2h", rating: 4.8, popularity: 96, description: "Ride to the top for golden-hour views across the City of Light." },
  { name: "Seine River Dinner Cruise", city: "Paris", country: "France", category: "Food & Dining", cost: 90, duration: "2.5h", rating: 4.6, popularity: 85, description: "Glide past illuminated monuments over a French three-course dinner." },
  // Rome
  { name: "Colosseum & Roman Forum Tour", city: "Rome", country: "Italy", category: "Culture & History", cost: 50, duration: "3h", rating: 4.8, popularity: 94, description: "Walk the arena floor and ancient forum with an expert guide." },
  { name: "Vatican Museums & Sistine Chapel", city: "Rome", country: "Italy", category: "Culture & History", cost: 55, duration: "3.5h", rating: 4.7, popularity: 90, description: "Michelangelo's ceiling and the Vatican's priceless collection." },
  { name: "Trastevere Food & Wine Walk", city: "Rome", country: "Italy", category: "Food & Dining", cost: 70, duration: "3h", rating: 4.9, popularity: 87, description: "Cacio e pepe, supplì, and gelato through Rome's most charming quarter." },
  // Barcelona
  { name: "Sagrada Família Guided Visit", city: "Barcelona", country: "Spain", category: "Culture & History", cost: 40, duration: "2h", rating: 4.8, popularity: 92, description: "Gaudí's breathtaking, still-unfinished basilica of light and stone." },
  { name: "Park Güell & Gràcia Stroll", city: "Barcelona", country: "Spain", category: "Sightseeing", cost: 18, duration: "2.5h", rating: 4.6, popularity: 84, description: "Mosaic wonderland with panoramic views over the city." },
  { name: "Tapas & Vermouth Evening", city: "Barcelona", country: "Spain", category: "Nightlife", cost: 55, duration: "3h", rating: 4.7, popularity: 83, description: "Hop between historic bodegas sampling Catalan bites and drinks." },
  // Santorini
  { name: "Caldera Catamaran Cruise", city: "Santorini", country: "Greece", category: "Water Sports", cost: 120, duration: "5h", rating: 4.9, popularity: 89, description: "Sail to hot springs and red beaches with a sunset BBQ onboard." },
  { name: "Oia Sunset & Wine Tasting", city: "Santorini", country: "Greece", category: "Relaxation", cost: 60, duration: "3h", rating: 4.8, popularity: 91, description: "Sip volcanic-soil wines as the famous Oia sun dips into the sea." },
  // New York
  { name: "Statue of Liberty & Ellis Island", city: "New York", country: "United States", category: "Sightseeing", cost: 35, duration: "4h", rating: 4.6, popularity: 88, description: "Ferry to Lady Liberty and the moving immigration museum." },
  { name: "Broadway Show", city: "New York", country: "United States", category: "Nightlife", cost: 130, duration: "3h", rating: 4.9, popularity: 90, description: "Catch a world-class musical in the heart of the Theater District." },
  { name: "Central Park Bike Tour", city: "New York", country: "United States", category: "Nature & Outdoors", cost: 45, duration: "2h", rating: 4.5, popularity: 79, description: "Pedal past landmarks across 843 acres of urban green." },
  // Cape Town
  { name: "Table Mountain Cableway", city: "Cape Town", country: "South Africa", category: "Nature & Outdoors", cost: 30, duration: "3h", rating: 4.8, popularity: 88, description: "Ride to the flat-topped summit for jaw-dropping coastal views." },
  { name: "Cape Peninsula & Penguins", city: "Cape Town", country: "South Africa", category: "Adventure", cost: 75, duration: "6h", rating: 4.7, popularity: 82, description: "Cape of Good Hope, Chapman's Peak, and Boulders Beach penguins." },
  // Dubai
  { name: "Desert Safari & Dune Bashing", city: "Dubai", country: "UAE", category: "Adventure", cost: 65, duration: "6h", rating: 4.7, popularity: 90, description: "4x4 dunes, camel rides, and a Bedouin-style dinner under the stars." },
  { name: "Burj Khalifa At the Top", city: "Dubai", country: "UAE", category: "Sightseeing", cost: 45, duration: "1.5h", rating: 4.6, popularity: 87, description: "Ascend the world's tallest building for dizzying skyline views." },
];

async function run() {
  console.log("→ Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI, { dbName: "globetrotter" });
  console.log("✓ Connected.");

  console.log("→ Clearing existing data…");
  await Promise.all([
    User.deleteMany({}),
    Trip.deleteMany({}),
    City.deleteMany({}),
    Activity.deleteMany({}),
    CommunityPost.deleteMany({}),
  ]);

  console.log("→ Seeding cities & activities…");
  await City.insertMany(CITIES.map((c) => ({ ...c, image: img(c.name, 800, 600) })));
  await Activity.insertMany(ACTIVITIES.map((a) => ({ ...a, image: "" })));

  console.log("→ Creating users…");
  const pw = (p) => bcrypt.hashSync(p, 10);
  const [demo, admin, mia, arjun, sofia] = await User.create([
    {
      name: "Demo Traveler", firstName: "Demo", lastName: "Traveler",
      email: "demo@globetrotter.app", passwordHash: pw("demo123"),
      photo: "", city: "San Francisco", country: "United States", phone: "+1 415 555 0142",
      additionalInfo: "Weekend wanderer chasing food, mountains, and good coffee.",
      role: "user", language: "English", savedDestinations: ["Tokyo", "Santorini", "Bali"],
    },
    {
      name: "Admin User", firstName: "Admin", lastName: "User",
      email: "admin@globetrotter.app", passwordHash: pw("admin123"),
      photo: "", city: "Austin", country: "United States",
      additionalInfo: "Platform administrator.", role: "admin", language: "English",
    },
    {
      name: "Mia Chen", firstName: "Mia", lastName: "Chen",
      email: "mia@globetrotter.app", passwordHash: pw("password123"),
      city: "Vancouver", country: "Canada", role: "user",
      additionalInfo: "Solo traveler & photographer.", savedDestinations: ["Kyoto", "Cape Town"],
    },
    {
      name: "Arjun Patel", firstName: "Arjun", lastName: "Patel",
      email: "arjun@globetrotter.app", passwordHash: pw("password123"),
      city: "London", country: "United Kingdom", role: "user",
      additionalInfo: "Budget backpacker, 30 countries and counting.",
    },
    {
      name: "Sofia Rossi", firstName: "Sofia", lastName: "Rossi",
      email: "sofia@globetrotter.app", passwordHash: pw("password123"),
      city: "Rome", country: "Italy", role: "user",
      additionalInfo: "Food-first traveler. Will plan a trip around a single meal.",
    },
  ]);

  console.log("→ Building sample trips…");
  const trips = await Trip.create([
    {
      user: demo._id,
      name: "Southeast Asia Adventure",
      description: "Three weeks weaving through temples, beaches, and the best street food on earth.",
      coverPhoto: img("bali temple", 1600, 600),
      startDate: daysFromNow(35),
      endDate: daysFromNow(52),
      isPublic: true,
      budgetBreakdown: { transport: 1400, stay: 1100, meals: 600, activities: 0 },
      stops: [
        {
          cityName: "Bangkok", country: "Thailand", order: 0,
          startDate: daysFromNow(35), endDate: daysFromNow(40),
          notes: "Riverside hotel near the Grand Palace. Take the ferry everywhere.",
          activities: [
            { name: "Grand Palace & Wat Pho", category: "Culture & History", time: "09:00", cost: 25, duration: "3h" },
            { name: "Street Food Crawl in Chinatown", category: "Food & Dining", time: "18:30", cost: 20, duration: "3h" },
            { name: "Floating Market Long-tail Tour", category: "Adventure", time: "08:00", cost: 35, duration: "4h" },
          ],
        },
        {
          cityName: "Bali", country: "Indonesia", order: 1,
          startDate: daysFromNow(40), endDate: daysFromNow(47),
          notes: "Split between Ubud (culture) and Uluwatu (beaches).",
          activities: [
            { name: "Ubud Rice Terrace Sunrise", category: "Nature & Outdoors", time: "05:30", cost: 15, duration: "3h" },
            { name: "Uluwatu Temple & Kecak Dance", category: "Culture & History", time: "16:00", cost: 22, duration: "3h" },
            { name: "Surf Lesson at Kuta Beach", category: "Water Sports", time: "10:00", cost: 30, duration: "2h" },
          ],
        },
        {
          cityName: "Singapore", country: "Singapore", order: 2,
          startDate: daysFromNow(47), endDate: daysFromNow(52),
          notes: "Layover city — go big on food and gardens.",
          activities: [
            { name: "Gardens by the Bay", category: "Sightseeing", time: "17:00", cost: 20, duration: "3h" },
            { name: "Hawker Center Food Safari", category: "Food & Dining", time: "12:00", cost: 18, duration: "2.5h" },
          ],
        },
      ],
    },
    {
      user: demo._id,
      name: "European Highlights",
      description: "A classic first-timer's loop through three of Europe's greatest cities.",
      coverPhoto: img("paris eiffel", 1600, 600),
      startDate: daysFromNow(-120),
      endDate: daysFromNow(-108),
      isPublic: true,
      budgetBreakdown: { transport: 900, stay: 1300, meals: 700, activities: 0 },
      stops: [
        {
          cityName: "Paris", country: "France", order: 0,
          startDate: daysFromNow(-120), endDate: daysFromNow(-116),
          activities: [
            { name: "Louvre Museum Skip-the-Line", category: "Culture & History", time: "10:00", cost: 45, duration: "3h" },
            { name: "Eiffel Tower Summit at Sunset", category: "Sightseeing", time: "19:00", cost: 35, duration: "2h" },
            { name: "Seine River Dinner Cruise", category: "Food & Dining", time: "20:30", cost: 90, duration: "2.5h" },
          ],
        },
        {
          cityName: "Rome", country: "Italy", order: 1,
          startDate: daysFromNow(-116), endDate: daysFromNow(-112),
          activities: [
            { name: "Colosseum & Roman Forum Tour", category: "Culture & History", time: "09:30", cost: 50, duration: "3h" },
            { name: "Trastevere Food & Wine Walk", category: "Food & Dining", time: "19:00", cost: 70, duration: "3h" },
          ],
        },
        {
          cityName: "Barcelona", country: "Spain", order: 2,
          startDate: daysFromNow(-112), endDate: daysFromNow(-108),
          activities: [
            { name: "Sagrada Família Guided Visit", category: "Culture & History", time: "11:00", cost: 40, duration: "2h" },
            { name: "Tapas & Vermouth Evening", category: "Nightlife", time: "20:00", cost: 55, duration: "3h" },
          ],
        },
      ],
    },
    {
      user: demo._id,
      name: "Japan in Spring",
      description: "Cherry blossoms, temples, and bullet trains — a bucket-list two-city run.",
      coverPhoto: img("kyoto temple", 1600, 600),
      startDate: daysFromNow(80),
      endDate: daysFromNow(89),
      isPublic: false,
      budgetBreakdown: { transport: 1200, stay: 900, meals: 500, activities: 0 },
      stops: [
        {
          cityName: "Tokyo", country: "Japan", order: 0,
          startDate: daysFromNow(80), endDate: daysFromNow(85),
          notes: "Base in Shinjuku. Get a Suica card on arrival.",
          activities: [
            { name: "Shibuya Crossing & Nightlife Walk", category: "Sightseeing", time: "18:00", cost: 0, duration: "2h" },
            { name: "Tsukiji Outer Market Food Tour", category: "Food & Dining", time: "08:00", cost: 65, duration: "3h" },
            { name: "teamLab Digital Art Museum", category: "Culture & History", time: "13:00", cost: 30, duration: "3h" },
          ],
        },
        {
          cityName: "Kyoto", country: "Japan", order: 1,
          startDate: daysFromNow(85), endDate: daysFromNow(89),
          notes: "Shinkansen from Tokyo (~2h20). Rent a kimono for a day.",
          activities: [
            { name: "Fushimi Inari Shrine Hike", category: "Culture & History", time: "07:30", cost: 0, duration: "2.5h" },
            { name: "Arashiyama Bamboo Grove", category: "Nature & Outdoors", time: "10:30", cost: 0, duration: "1.5h" },
            { name: "Traditional Tea Ceremony", category: "Culture & History", time: "15:00", cost: 40, duration: "1h" },
          ],
        },
      ],
    },
  ]);

  // Sync each trip's activities budget from its stops.
  for (const t of trips) {
    const total = (t.stops || []).reduce(
      (s, stop) => s + (stop.activities || []).reduce((a, act) => a + (act.cost || 0), 0),
      0
    );
    t.budgetBreakdown.activities = total;
    await t.save();
  }

  console.log("→ Posting community stories…");
  await CommunityPost.create([
    {
      user: sofia._id, authorName: sofia.name, title: "Skip the queue at the Vatican — go at opening",
      content: "We arrived 30 minutes before opening on a weekday and practically had the Sistine Chapel to ourselves for 10 glorious minutes. Book the earliest slot you can and head straight there before the tour groups.",
      location: "Rome, Italy", activity: "Vatican Museums & Sistine Chapel",
      image: img("vatican rome", 900, 700), tags: ["Culture", "Tips"], likes: 3, likedBy: [demo._id, mia._id, arjun._id],
    },
    {
      user: arjun._id, authorName: arjun.name, title: "Bali on $40/day is absolutely doable",
      content: "Stayed in gorgeous guesthouses in Ubud for $18/night, ate at warungs for a couple of dollars, and rented a scooter for the week. The rice terraces at sunrise cost nothing and were the highlight of my year.",
      location: "Bali, Indonesia", activity: "Ubud Rice Terrace Sunrise",
      image: img("bali rice terrace", 900, 700), tags: ["Budget", "Nature", "Solo"], likes: 2, likedBy: [demo._id, sofia._id],
    },
    {
      user: mia._id, authorName: mia.name, title: "Table Mountain: take the first cable car up",
      content: "The clouds (locals call it the 'tablecloth') roll in fast. We went up at 8am with clear skies and hiked partway down. By noon the summit was totally socked in. Timing is everything here.",
      location: "Cape Town, South Africa", activity: "Table Mountain Cableway",
      image: img("cape town mountain", 900, 700), tags: ["Nature", "Adventure", "Tips"], likes: 4, likedBy: [demo._id, arjun._id, sofia._id, admin._id],
    },
    {
      user: demo._id, authorName: demo.name, title: "Tokyo food tour was worth every yen",
      content: "Did the Tsukiji morning food tour on day one and it completely recalibrated my expectations for the rest of the trip. The tamago stand alone is worth the trip. Come hungry.",
      location: "Tokyo, Japan", activity: "Tsukiji Outer Market Food Tour",
      image: img("tokyo sushi", 900, 700), tags: ["Food", "City"], likes: 2, likedBy: [mia._id, sofia._id],
    },
    {
      user: sofia._id, authorName: sofia.name, title: "Santorini sunset without the Oia crowds",
      content: "Everyone piles into Oia for sunset. Instead we watched from the ruins in Imerovigli with a bottle of Assyrtiko — same view, a fraction of the people. Bring a light jacket, it gets breezy.",
      location: "Santorini, Greece", activity: "Oia Sunset & Wine Tasting",
      image: img("santorini sunset", 900, 700), tags: ["Romance", "Tips"], likes: 5, likedBy: [demo._id, mia._id, arjun._id, admin._id],
    },
    {
      user: arjun._id, authorName: arjun.name, title: "Bangkok street food: start in Chinatown",
      content: "Yaowarat after dark is sensory overload in the best way. Grilled prawns, boat noodles, mango sticky rice — we ate our way down the whole street for under $15 each.",
      location: "Bangkok, Thailand", activity: "Street Food Crawl in Chinatown",
      image: img("bangkok street food", 900, 700), tags: ["Food", "Budget", "City"], likes: 3, likedBy: [demo._id, mia._id, sofia._id],
    },
  ]);

  const counts = {
    users: await User.countDocuments(),
    cities: await City.countDocuments(),
    activities: await Activity.countDocuments(),
    trips: await Trip.countDocuments(),
    posts: await CommunityPost.countDocuments(),
  };

  console.log("\n✓ Seed complete!");
  console.table(counts);
  console.log("\n  Demo login:  demo@globetrotter.app  /  demo123");
  console.log("  Admin login: admin@globetrotter.app /  admin123\n");

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("\n✖ Seed failed:", err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
