const mongoose = require("mongoose");
const { Schema } = mongoose;

const requestSchema = new Schema(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected","ignored"],
      default: "pending",
      required: true,
    },
  },
  { timestamps: true }
);

const requestModel = mongoose.model("request", requestSchema);

module.exports = requestModel;