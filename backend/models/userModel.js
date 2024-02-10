import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(email);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    password: {
      type: String,
      required: [true, "password is required"],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password Must be Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character",
      ],
    },
    photo: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/6596/6596121.png",
    },
    phone: {
      type: String,
    },
    bio: {
      type: String,
      maxLength: [25, "Bio Must bu Maximum 25 characters"],
      default: "bio",
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate(); // {password: "..."}
  if (update.password) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(update.password, salt);
    this.setUpdate({
      $set: {
        password: passwordHash,
        confirmpw: undefined,
      },
    });
  }
  next();
});

UserSchema.methods.matchPassword = async function (pass) {
  return await bcrypt.compare(pass, this.password);
};

const User = mongoose.model("User", UserSchema);

export default User;
