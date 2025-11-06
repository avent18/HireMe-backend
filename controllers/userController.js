/** @format */

import { User } from "../models/usermodel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import  getDataUri  from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";


// Register a new user
export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;
    if (!fullname || !email || !phoneNumber || !password || !role) {
      return res
        .status(400)
        .json({ message: "some fields are required", success: false });
    }

    const file = req.file;
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      profile:{
                profilePhoto:cloudResponse.secure_url,
            }
    });
    return res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: {
        fullname,
        email,
        phoneNumber,
        role,
      },
    });
  } catch (error) {
    console.error(error);
  }
};

// Login a user
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "some fields are required", success: false });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    if (role !== user.role) {
      return res.status(403).json({
        message: "You are not authorized to perform this action",
        success: false,
      });
    }

    // const tokenDatat = {
    //   id: user._id,
    //   email: user.email,
    //   role: user.role,
    // };
    // const token = jwt.sign(tokenDatat, process.env.JWT_SECRET, {
    //   expiresIn: "1d",
    // });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .json({
        message: `Welcome back ${user.fullname}`,
        success: true,
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          profile: user.profile,
        },
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Logout a user
export const logout = async (req, res) => {
  try {
    res
      .clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .status(200)
      .json({ message: "Logged out successfully", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

//update user profile
// export const updateProfile = async (req, res) => {
//   try {
//     const { fullname, email, phoneNumber, bio, skills, resume } = req.body;
//     // const { file } = req.file;
    
//     let skillsArray = [];
//     if(skills){
//        skillsArray = skills.split(",");
//     }
    
//     const userId = req.id;
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         message: "User not found",
//         success: false,
//       });
//     }

//     //updating data
//     if (fullname) user.fullname = fullname;
//     if (email) user.email = email;
//     if (phoneNumber) user.phoneNumber = phoneNumber;
//     if (bio) user.profile.bio = bio;
//     if (skills) user.profile.skills = skillsArray;
//     await user.save();

//     user = {
//       id: user._id,
//       fullname: user.fullname,
//       email: user.email,
//       phoneNumber: user.phoneNumber,
//       role: user.role,
//       profile: user.profile,
//     };
//     return res.status(200).json({
//       message: "Profile updated successfully",
//       success: true,
//       user,
//     });
//   } catch (error) {
//     console.error("Update Profile Error:", error);
//     res.status(500).json({ message: "Internal server error", success: false });
//   }
// };



// export const updateProfile = async (req, res) => {
//   try {
//     const { fullname, email, phoneNumber, bio, skills, resume } = req.body;
//     const userId = req.id;

//     const file = req.file;
    

//     let skillsArray = [];
//     if (skills) {
//       skillsArray = skills.split(",");
//     }

//     const updateFields = {};

//     if (fullname) updateFields.fullname = fullname;
//     if (email) updateFields.email = email;
//     if (phoneNumber) updateFields.phoneNumber = phoneNumber;
//     if (bio) updateFields["profile.bio"] = bio;
//     if (skills) updateFields["profile.skills"] = skillsArray;

//     const fileUri = getDataUri(file);
//     const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

//     if(cloudResponse){
//             user.profile.resume = cloudResponse.secure_url // save the cloudinary url
//             user.profile.resumeOriginalName = file.originalname // Save the original file name
//         }

//     const user = await User.findOneAndUpdate(
//       { _id: userId },
//       { $set: updateFields },
//       { new: true } // Return the updated document
//     );

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found",
//         success: false,
//       });
//     }

//     return res.status(200).json({
//       message: "Profile updated successfully",
//       success: true,
//       user: {
//         id: user._id,
//         fullname: user.fullname,
//         email: user.email,
//         phoneNumber: user.phoneNumber,
//         role: user.role,
//         profile: user.profile,
//       },
//     });
//   } catch (error) {
//     console.error("Update Profile Error:", error);
//     res.status(500).json({ message: "Internal server error", success: false });
//   }
// };

export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body;
    const userId = req.id;

    const file = req.file;
    let resumeUrl = null;
    let resumeOriginalName = null;

    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        resource_type: "auto",
        timeout: 60000,
      });

      resumeUrl = cloudResponse.secure_url;
      resumeOriginalName = file.originalname;
    }

    let skillsArray = [];
    if (skills) {
      skillsArray = skills.split(",").map((skill) => skill.trim());
    }

    const updateFields = {};

    if (fullname) updateFields.fullname = fullname;
    if (email) updateFields.email = email;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    if (bio) updateFields["profile.bio"] = bio;
    if (skillsArray.length > 0) updateFields["profile.skills"] = skillsArray;
    if (resumeUrl) updateFields["profile.resume"] = resumeUrl;
    if (resumeOriginalName) updateFields["profile.resumeOriginalName"] = resumeOriginalName;

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: updateFields },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
