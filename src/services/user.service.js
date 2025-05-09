import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import passUtil from "../util/passUtil.js";
import { mailService } from "../configs/sendMail.config.js";
import {RandomOTP, GetExpiredOtp} from "../util/otpUtil.js";

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
    catch(err){
      throw new Error("Error registering user: " + err.message);
    }
  }

  async GetAll() {
    try {
      return await this.user.find({});
    } catch (err) {
      throw new Error("Error retrieving users: " + err.message);
    }
  }

  async GetById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    try {
      return await this.user.findById(id);
    } catch (err) {
      throw new Error("Error retrieving user: " + err.message);
    }
  }

  async Create(userData) {
    try {
      const newUser = new this.user(userData);
      return await newUser.save();
    } catch (err) {
      throw new Error("Error creating user: " + err.message);
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
    } catch (err) {
      throw new Error("Error updating user: " + err.message);
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
    } catch (err) {
      throw new Error("Error deleting user: " + err.message);
    }
  }
  async ForgotPassword(email) {
    try {
      const existedUser = await this.user.findOne({email});
      if(!existedUser){
        throw new Error("User not registered yet");

      }
      //generate token
      // const resetToken = jwt.sign({id: existedUser._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
      
      // await this.user.findByIdAndUpdate(existedUser._id, {resetToken});
      // console.log("resetToken: ", resetToken);
      const otp = RandomOTP();
      const expiredOtp = GetExpiredOtp();

      const updatedUser = await this.user.findByIdAndUpdate(existedUser._id, {otp, expiredOtp});

      
      const mailOptions ={
        emailFrom: "SGroupResetPassword@gmail.com",
        emailTo: email,
        emailSubject: "Reset Password",
        emailText: `This is your otp: ${otp}. It will expire in 5 minutes. Please use it to reset your password. If you did not request this, please ignore this email.`,
      }
      const result = await mailService.sendMail(mailOptions);
          if(!result){
            throw new Error("Error sending email");
          }
          console.log("result: ", result);
          return result


    } catch (err) {
      throw new Error("Error sending forgot pass email: " + err.message);
      
    }
  }
  async ResetPassword(otp, email, newPassword) {
    try {
      
      
      const user = await this.user.findOne({email});
      if (!user) {
        throw new Error("User not found");
      }

      //check if otp matched
     

      //check if otp expired
      


      //hash password and update new pass
      
      
      const updatedUser = await user.save();
      if (!updatedUser) {
        throw new Error("Error updating password");
      }
      return updatedUser;
      
    } catch (err) {
      throw new Error("Error reset pass: " + err.message);
      
    }
  }
}

export default new UserService();
