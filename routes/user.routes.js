import express from "express";
import { userController } from "../controllers/index.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();

router.post("/signup", userController.signupUser);
router.post("/login", userController.loginUser);
router.post("/logout", userController.logoutUser);
router.post("/follow/:id", protectRoute, userController.followUnfollowUser);
router.put("/update/:id", protectRoute, userController.updateUser);
router.get("/profile/:query", userController.getProfile);

export default router;
