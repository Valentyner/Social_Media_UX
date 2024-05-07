import express from "express"
import { postController } from "../controllers/index.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/feed", protectRoute, postController.getFeedPosts)
router.post("/create", protectRoute, postController.createPost);
router.get("/:id", postController.getPost);
router.get("/user/:username", postController.getUserPosts);
router.patch("/update/:id", protectRoute, postController.updatePost);
router.delete("/delete/:id", protectRoute, postController.deletePost);
router.put("/like/:id", protectRoute, postController.likeUnlikePost)
router.put("/reply/:id", protectRoute, postController.replyToPost)

export default router
