import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    photo: { type: String, default: "" },
    phone: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    additionalInfo: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    language: { type: String, default: "English" },
    savedDestinations: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
