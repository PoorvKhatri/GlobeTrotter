import mongoose from "mongoose";

/** A single activity assigned to a day within a stop. */
const ActivitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, default: "Sightseeing" },
    date: { type: Date },
    time: { type: String, default: "" }, // e.g. "09:00"
    cost: { type: Number, default: 0 },
    duration: { type: String, default: "" }, // e.g. "2h"
  },
  { _id: true }
);

/** A city stop within a trip, holding its own activities. */
const StopSchema = new mongoose.Schema(
  {
    cityName: { type: String, required: true },
    country: { type: String, default: "" },
    image: { type: String, default: "" },
    startDate: { type: Date },
    endDate: { type: Date },
    order: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    activities: [ActivitySchema],
  },
  { _id: true }
);

const TripSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    coverPhoto: { type: String, default: "" },
    startDate: { type: Date },
    endDate: { type: Date },
    isPublic: { type: Boolean, default: false },
    budgetBreakdown: {
      transport: { type: Number, default: 0 },
      stay: { type: Number, default: 0 },
      meals: { type: Number, default: 0 },
      activities: { type: Number, default: 0 }, // 0 => derive from stop activities
    },
    stops: [StopSchema],
  },
  { timestamps: true }
);

TripSchema.index({ isPublic: 1, updatedAt: -1 });

export default mongoose.models.Trip || mongoose.model("Trip", TripSchema);
