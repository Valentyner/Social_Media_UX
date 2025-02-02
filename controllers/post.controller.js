import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { postedBy, text } = req.body;
    let { img } = req.body;

    if (!postedBy || !text) {
      return res
        .status(400)
        .json({ error: "Postedby and text fields are required" });
    }

    const user = await User.findById(postedBy);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized to create post" });
    }
    const maxLength = 500;
    if (text.length > maxLength) {
      return res
        .status(400)
        .json({ error: `Text must be less than ${maxLength} characters` });
    }
    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({ postedBy, text, img });
    await newPost.save();
    res.status(200).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in CreatePost: ", error.message);
  }
};
export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(400).json({ error: "Post not found" });

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getPost: ", error.message);
  }
};
export const updatePost = async (req, res) => {
  const { text, img } = req.body;
  const { id: postId } = req.params;
  const userId = req.user._id;
  try {
    let post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (!userId) {
      return res.status(404).json({ error: "Unauthorized to update post" });
    }

    if (userId.toString() !== post.postedBy.toString()) {
      return res.status(400).json({ error: "You cannot change other`s post" });
    }

    post.text = text || post.text;
    post.img = img || post.img;

    post = await post.save();

    res.status(200).json({ message: "Post updated successfully", post });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in updatePost: ", error.message);
  }
};
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.postedBy.toString() !== req.user._id.toString())
      return res.status(401).json({ error: "Unauthorized to delete post" });

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in deletePost: ", error.message);
  }
};
export const likeUnlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(400).json({ error: "Post not found" });
    if (!userId)
      return res
        .status(400)
        .json({ error: "Unauthorized to like/unlike post" });

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      res.status(200).json({ message: "Unliked" });
    } else {
      post.likes.push(userId);
      await post.save();
      res.status(200).json({ message: "Liked" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in likeUnlikePost", error.message);
  }
};
export const replyToPost = async (req, res) => {
  try {
    const { comment } = req.body;
    const { id: postId } = req.params;
    const userId = req.user._id;
    const userProfilePic = req.user.profilePic;
    const username = req.user.username;

    if (!comment) {
      return res.status(400).json({ error: "Text field is required" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(400).json({ error: "Post not found" });
    }

    if (!userId) {
      return res.status(400).json({ error: "Unauthorized" });
    }
    const reply = { username, comment, userId, userProfilePic };

    post.replies.push(reply);
    await post.save();
    res.status(200).json(reply);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("replyToPost: ", error.message);
  }
};
export const getFeedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "Use not found" });
    }

    const following = user.following;

    const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({
      createdAt: -1,
    });

    res.status(200).json(feedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("getFeedPosts: ", error.message);
  }
};
export const getUserPosts = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Post.find({ postedBy: user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
