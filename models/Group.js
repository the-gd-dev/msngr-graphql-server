const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const groupSchema = new Schema(
  {
    topic: {
      type: String,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);
