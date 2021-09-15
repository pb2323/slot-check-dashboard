const express = require("express");
const router = express.Router();
const UserModel = require("../models/UserModel");
const CourseSlotModel = require("../models/CourseSlotModel");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  const { userId } = req;
  try {
    const isUser = await UserModel.findById(userId);
    if (isUser.role === "student") {
      const users = await CourseSlotModel.find({}).populate("user");
      const slots = users.reduce((acc, user) => {
        user.slots = user.slots.filter((slot) => slot.day === "Monday");
        console.log(user.slots, "user Slo");
        const temp = user.slots.map((slot) => {
          return {
            name: user.user.name,
            subject: slot.subject,
            day: "Monday",
            slot: slot.slot,
          };
        });
        acc = [...acc, ...temp];
        return acc;
      }, []);
      return res.json({ slots: slots });
    }
    const user = await CourseSlotModel.findOne({ user: userId });
    return res.json({ slots: user.slots || [] });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
});

router.post("/create", authMiddleware, async (req, res) => {
  const { userId } = req;
  try {
    const user = await CourseSlotModel.findOne({ user: userId });
    user.slots = [...req.body.slots, ...user.slots];
    user.save();
    return res.json({ slots: user.slots });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
});

router.post("/remove", authMiddleware, async (req, res) => {
  const { userId } = req;
  try {
    const { idToBeDeleted } = req.body;
    const user = await CourseSlotModel.findOne({ user: userId });
    const indexArray = user.slots.reduce((acc, ele, index) => {
      if (idToBeDeleted.includes(ele._id.toString())) acc.push(index);
      return acc;
    }, []);
    user.slots = user.slots.filter((ele, index) => !indexArray.includes(index));
    await user.save();
    return res.json({ slots: user.slots });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
});

router.post("/list", authMiddleware, async (req, res) => {
  try {
    const { subjects, days, selectedSlots } = req.body;
    const users = await CourseSlotModel.find({}).populate("user");
    const slots = users.reduce((acc, user) => {
      user.slots = user.slots.filter(
        (slot) =>
          days.includes(slot.day) &&
          subjects.includes(slot.subject) &&
          selectedSlots.includes(slot.slot)
      );
      const temp = user.slots.map((slot) => {
        return {
          name: user.user.name,
          subject: slot.subject,
          day: slot.day,
          slot: slot.slot,
        };
      });
      acc = [...acc, ...temp];
      return acc;
    }, []);
    return res.json({ slots: slots });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
