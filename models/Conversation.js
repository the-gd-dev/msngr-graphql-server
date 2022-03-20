const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const conversationSchema = new Schema(
  {
    participents: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    unread: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Conversation", conversationSchema);
