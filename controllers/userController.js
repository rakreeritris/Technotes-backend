const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

//@desc Get all users
// @route GET /users
// @access Private

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();
    if (!users?.length) {
      return res.status(400).json({ message: "No users found" });
    }
    res.json(users);
  } catch (error) {
    console.log(error);
  }
};

//@desc Create new user
// @route POST /users
// @access Private

const createNewUser = async (req, res) => {
  try {
    const { username, password, roles } = req.body;
    //confirm data
    if (!username || !password || !Array.isArray(roles) || !roles.length) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    // Check for duplicate
    const duplicate = await User.findOne({ username }).lean().exec();
    if (duplicate) {
      return res.status(409).json({ message: "Duplicate Users" });
    }
    //Hash password
    const hashedPwd = await bcrypt.hash(password, 10);

    const userObject = { username, password: hashedPwd, roles };
    // create and store a new user

    const user = await User.create(userObject);
    if (user) {
      res.status(201).json({ message: `New user ${username} created` });
    } else {
      res.status(400).json({
        message: "Invalid user data received",
      });
    }
  } catch (error) {}
};
//@desc Update a user
// @route PATCH /users
// @access Private

const updateUser = async (req, res) => {
  try {
    const { _id, username, roles, active, password } = req.body;
    console.log(req.body);
    if (
      !_id ||
      !username ||
      !Array.isArray(roles) ||
      !roles.length ||
      typeof active !== "boolean"
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findById(_id);
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    //Check for duplicates
    const duplicate = await User.findOne({ username }).lean();
    // Allow updates to the orignal user
    if (duplicate && duplicate?._id.toString() !== _id) {
      return res.status(409).json({
        message: "Duplicate username",
      });
    }
    user.username = username;
    user.roles = roles;
    user.active = active;
    if (password) {
      // Hash password
      user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();
    res.json({
      message: `${updatedUser} updated`,
    });
  } catch (error) {
    console.log(error);
  }
};
//@desc Delete a user
// @route DELETE /users
// @access Private

const deleteUser = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(400).json({ message: "User Id is required" });
    }
    const notes = await Note.findOne({ user: _id }).lean();
    if (notes?.length) {
      return res.status(400).json({
        message: "User has assigned notes",
      });
    }
    const user = await User.findById(_id).exec();
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    const result = await user.deleteOne();
    const reply = `Username ${result.username} with ID ${result._id} deleted`;
    res.json(reply);
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
