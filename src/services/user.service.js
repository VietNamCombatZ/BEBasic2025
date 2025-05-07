import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import passUtil from "../util/passUtil.js";

class UserService {
  constructor() {
    this.user = User;
  }

  async Login(email, password){
    try {
      const existedUser = await this.user.findOne({email});
      if(!existedUser){
        throw new Error("User not found");
      }
      console.log("existedUser: ",existedUser);
      const checkPass = await passUtil.compare(password, existedUser.password);
      if(!checkPass){
        throw new Error("Password does not match");
      }
      console.log("checkPass: ",checkPass);

      //neu dang nhap thanh cong, tra ve token
      const accessToken = await jwt.sign({id: existedUser._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10m'}); ;
      const refreshToken = await jwt.sign({id: existedUser._id}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '3d'}); ;
      
      console.log("accessToken: ", accessToken);
      console.log("refreshToken: ", refreshToken);
      
      return {accessToken, refreshToken};
    } catch (err) {
      throw new Error("Error logging in user: " + err.message);
    }
  }

  async Register(username, email, password) {
    try{
    const existedUser = await this.user.findOne({email});
    console.log("existedUser: ",existedUser);
    
    if(existedUser){
      throw new Error("User already exists");
    }

    const hashedPass = await bcrypt.hash(password, 10);
    if(!hashedPass){
      throw new Error("Error hashing password");
    }

    const newUser = new this.user({
      username,
      email,
      password: hashedPass,
    });
    const savedUser = await newUser.save();
    console.log("savedUser: ", newUser);
    if(!savedUser){
      throw new Error("Error saving user");
    }
    return savedUser;
  }
    catch(error){
      throw new Error("Error registering user: " + error.message);
    }
  }

  async GetAll() {
    try {
      return await this.user.find({});
    } catch (error) {
      throw new Error("Error retrieving users: " + error.message);
    }
  }

  async GetById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    try {
      return await this.user.findById(id);
    } catch (error) {
      throw new Error("Error retrieving user: " + error.message);
    }
  }

  async Create(userData) {
    try {
      const newUser = new this.user(userData);
      return await newUser.save();
    } catch (error) {
      throw new Error("Error creating user: " + error.message);
    }
  }

  async Update(id, updateData) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    try {
      const updatedUser = await this.user.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      if (!updatedUser) {
        throw new Error("User not found");
      }
      return updatedUser;
    } catch (error) {
      throw new Error("Error updating user: " + error.message);
    }
  }

  async Delete(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    try {
      const deletedUser = await this.user.findByIdAndDelete(id);
      if (!deletedUser) {
        throw new Error("User not found");
      }
      return deletedUser;
    } catch (error) {
      throw new Error("Error deleting user: " + error.message);
    }
  }
}

export default new UserService();
