import { z } from "zod";

// --- User Schemas ---
export const UserRoleSchema = z.enum(["super_admin", "admin"]);

export const UserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: UserRoleSchema.default("admin"),
  phone: z.string().optional(),
  address: z.string().optional(),
  nicNumber: z.string().optional(),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  branchName: z.string().min(1, "Branch name is required"),
});

export type UserInput = z.infer<typeof UserSchema>;

// --- Ground Schemas ---
export const SportSchema = z.object({
  name: z.string().min(1, "Sport name is required"),
  pricePerHour: z.number().positive("Price must be positive"),
});

export const GroundSchema = z.object({
  name: z.string().min(2, "Ground name is required"),
  location: z.object({
    address: z.string().min(1, "Address is required"),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  contactNumber: z.string().min(1, "Contact number is required"),
  groundType: z.string().min(1, "Ground type is required"),
  owner: z.string().optional(), // ObjectId as string
  sports: z.array(SportSchema).min(1, "At least one sport is required"),
  availableTime: z.object({
    from: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
    to: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
  }),
  amenities: z.array(z.string()).default([]),
  description: z.string().optional(),
});

export type GroundInput = z.infer<typeof GroundSchema>;

// --- Booking Schemas ---
export const TimeSlotSchema = z.object({
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
});

export const BookingSchema = z.object({
  ground: z.string().min(1, "Ground ID is required"),
  sportName: z.string().min(1, "Sport name is required"),
  user: z.string().optional(),
  guest: z.object({
    name: z.string().min(1, "Guest name is required"),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().min(1, "Guest phone is required"),
    nicNumber: z.string().optional(),
  }).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  timeSlots: z.array(TimeSlotSchema).min(1, "At least one time slot is required"),
  totalAmount: z.number().positive(),
});

export type BookingInput = z.infer<typeof BookingSchema>;

export const BatchBookingSchema = z.object({
  guest: z.object({
    name: z.string().min(1, "Guest name is required"),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().min(1, "Guest phone is required"),
    nicNumber: z.string().optional(),
  }).optional(),
  ground: z.string().min(1, "Ground ID is required"),
  sportName: z.string().min(1, "Sport name is required"),
  bookings: z.array(z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    timeSlots: z.array(TimeSlotSchema).min(1),
  })).min(1),
  paymentStatus: z.enum(["pending", "advanced_paid", "full_paid"]).default("pending"),
  idempotencyKey: z.string().optional(),
});

export type BatchBookingInput = z.infer<typeof BatchBookingSchema>;
