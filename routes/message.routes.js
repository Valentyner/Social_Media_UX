import express from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { messageController } from "../controllers/index.js";

const router = express.Router();

router.get("/conversations", protectRoute, messageController.getConversations);
router.get("/:otherUserId", protectRoute, messageController.getMessages);
router.post("/", protectRoute, messageController.sendMessage);

export default router;
