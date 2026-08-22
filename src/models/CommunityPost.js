import mongoose from "mongoose";

const CommunityPostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    authorName: { type: String, required: true },
    authorPhoto: { type: String, default: "" },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    location: { type: String, default: "" },
    activity: { type: String, default: "" },
    image: { type: String, default: "" },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

CommunityPostSchema.index({ title: "text", content: "text", location: "text", activity: "text" });

export default mongoose.models.CommunityPost ||
  mongoose.model("CommunityPost", CommunityPostSchema);
