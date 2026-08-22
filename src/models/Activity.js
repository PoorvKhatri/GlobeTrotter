import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    city: { type: String, required: true, trim: true },
    country: { type: String, default: "" },
    category: { type: String, default: "Sightseeing", index: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    cost: { type: Number, default: 0 },
    duration: { type: String, default: "2h" },
    rating: { type: Number, min: 0, max: 5, default: 4.5 },
    popularity: { type: Number, default: 50 },
  },
  { timestamps: true }
);

ActivitySchema.index({ name: "text", city: "text", description: "text", category: "text" });

export default mongoose.models.Activity || mongoose.model("Activity", ActivitySchema);
