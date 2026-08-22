import mongoose from "mongoose";

const CitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    country: { type: String, required: true, trim: true },
    region: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    costIndex: { type: Number, min: 1, max: 5, default: 3 }, // 1 cheap … 5 luxury
    popularity: { type: Number, default: 50 }, // 0-100
    currency: { type: String, default: "USD" },
    avgDailyCost: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

CitySchema.index({ name: "text", country: "text", description: "text" });

export default mongoose.models.City || mongoose.model("City", CitySchema);
