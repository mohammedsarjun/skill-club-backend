import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ["client", "freelancer"],
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  message: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    enum: ["job", "payment", "report", "system", "admin","meeting"],
    default: "system",
    index: true,
  },

  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },

  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },

  actionUrl: {
    type: String,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

export default mongoose.model("Notification", notificationSchema);
