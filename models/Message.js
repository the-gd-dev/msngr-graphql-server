const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
    },
    text: String,
    image:String,
    reaction: String,
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    deletedBy: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    unsendMessage: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    replyToMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);
