import mongoose, { Schema, Document } from "mongoose";

export interface ISport {
  name: string;
  pricePerHour: number;
}

export interface IGround extends Document {
  name: string;
  location: { address: string; lat?: number; lng?: number };
  contactNumber: string;
  groundType: string;
  owner: mongoose.Types.ObjectId;
  sports: ISport[];
  availableTime: { from: string; to: string };
  amenities: string[];
  images: string[];
  description?: string;
  createdAt: Date;
}

const SportSchema = new Schema<ISport>(
  {
    name: { type: String, required: true },
    pricePerHour: { type: Number, required: true },
  },
  { _id: false }
);

const GroundSchema = new Schema<IGround>(
  {
    name: { type: String, required: true },
    location: {
      address: { type: String, required: true },
      lat: { type: Number },
      lng: { type: Number },
    },
    contactNumber: { type: String, required: true },
    groundType: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sports: { type: [SportSchema], required: true },
    availableTime: {
      from: { type: String, required: true },
      to: { type: String, required: true },
    },
    amenities: { type: [String], default: [] },
    images: { type: [String], default: [] },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Ground ||
  mongoose.model<IGround>("Ground", GroundSchema);
