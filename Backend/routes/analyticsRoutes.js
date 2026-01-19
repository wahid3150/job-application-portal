const express = require("express");
const { getMyAnalytics } = require("../controllers/analyticsController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get("/me", protect, authorizeRoles("employer"), getMyAnalytics);

module.exports = router;
