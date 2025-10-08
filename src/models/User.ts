import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: "super_admin" | "admin";
  phone?: string;
  address?: string;
  nicNumber?: string;
  bankName?: string;
  accountNumber?: string;
  branchName?: string;
  managingGrounds?: Types.ObjectId[]; // array of grounds managed
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["super_admin", "admin"], default: "admin" },
  phone: { type: String },
  address: { type: String },
  nicNumber: { type: String },
  bankName: { type: String },
  accountNumber: { type: String },
  branchName: { type: String },
  managingGrounds: [{ type: Schema.Types.ObjectId, ref: "Ground" }],
  createdAt: { type: Date, default: Date.now },
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
