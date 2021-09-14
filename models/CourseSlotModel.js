const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CourseSlotSchema = new Schema(
  {
    user: { ref: "Users", type: Schema.Types.ObjectId },
    slots: [
      {
        subject: { type: String, required: true },
        day: { type: String, required: true },
        slot: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("slots", CourseSlotSchema);
