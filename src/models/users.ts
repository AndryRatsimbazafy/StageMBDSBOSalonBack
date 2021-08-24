import * as crypto from "crypto";
import * as mongoose from "mongoose";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

import config from "../environments";
export interface IUser extends mongoose.Document {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  birthDate: Date;
  phoneNumber: string;
  postalCode: string;
  projects: string[];
  conferences: string[];
  coachings: [{ 
    coachingDate: string, 
    coachingHour: string 
  }]
  regReason: string;
  password: string;
  role: string;
  active: boolean;
  email: string;
  companyName: string;
  standNumber: number;
  createdAt: Date;
  updatedAt: Date;
  connected: boolean;
  contact: string[];
  resetPasswordToken: string;
  resetPasswordExpire: Date;
}

let Schema = mongoose.Schema;

let UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Veuillez utiliser au moins 2 caractères"],
      maxlength: [
        50,
        "Le nombre maximum de caractères autorisé est de 50 caractères",
      ],
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Veuillez utiliser au moins 2 caractères"],
      maxlength: [
        50,
        "Le nombre maximum de caractères autorisé est de 50 caractères",
      ],
    },
    age: {
      type: Number,
      required: false,
    },
    gender: {
      type: String,
      required: false,
    },
    birthDate: {
      type: Date,
      required: false,
    },
    phoneNumber: {
      type: String,
    },
    postalCode: {
      type: String,
    },
    projects: {
      type: [String],
    },
    conferences: {
      type: [String]
    },
    coachings: [{
      coachingDate: String,
      coachingHour: String,
    }],
    regReason: {
      type: String
    },
    password: {
      type: String,
      required: true,
      select: false,
      trim: true,
      minlength: [6, "Veuillez utiliser au moins 6 caratères"],
    },
    role: {
      type: String,
      default: "visiteur",
      enum: ["admin", "visiteur", "exposant", "commercial", "coach"],
    },
    active: {
      type: Boolean,
      default: true,
    },
    companyName: {
      type: String,
      default: "visiteur",
      trim: true,
    },
    standNumber: {
      type: Number,
      default: 301,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Email non valide",
      ],
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    connected: {
      type: Boolean,
      default: false,
      required: false,
    }, 
    contact: {
      type: [Schema.Types.ObjectId],
      ref: "users",
      required: false 
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      required: false,
    },
  },
  { _id: true }
);

/**
 * crypt user password before save [eto]
 */
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * generate a jwt access token
 * @param expireTime token expire time in minutes
 * @returns string jwt signed access token
 */
UserSchema.methods.generateAccessToken = function (expireTime?: string) {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
    },
    config.ACCESS_TOKEN_SECRET,
    {
      expiresIn: expireTime ? expireTime : "15m",
    }
  );
};

/**
 * generate a jwt refresh token
 * @returns string jwt signed refresh token
 */
UserSchema.methods.generateRefreshToken = function () {
  // add user password to secret to invalidate latest token when user password changes
  //const refreshSecret = `${config.REFRESH_TOKEN_SECRET}${this.password}`;
  // use refresh token secret without passwords
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
    },
    config.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

/**
 * match database password with user input
 * @returns boolean password matched
 */
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/**
 * generate and hash password reset token
 * @returns string reset password token
 */
UserSchema.methods.getResetPasswordToken = function () {
  // generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // hash token and set resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // set expire
  console.log('Date.now()', Date.now());
  
  // this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10m

  return resetToken;
};

export default mongoose.model("users", UserSchema);
