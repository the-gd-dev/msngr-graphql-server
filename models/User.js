const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    conversations: [{ type: Schema.Types.ObjectId, ref: "Conversation" }],
    groups: [{ type: Schema.Types.ObjectId, ref: "Groups" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
