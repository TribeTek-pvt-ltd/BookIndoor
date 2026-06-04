# BookIndoor - Project Documentation

## Project Overview
**BookIndoor** is a premium, full-stack sports facility booking platform designed to streamline the management and reservation of indoor sports grounds. It provides a seamless experience for both facility owners (Admins) and users looking to book slots for sports like Badminton, Cricket, and Futsal.

---

## Tech Stack

### Core Frameworks
- **Frontend**: Next.js 15.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x
- **Animations**: Framer Motion
- **Icons**: Heroicons, React Icons

### Backend & Database
- **Runtime**: Node.js (Next.js Server Actions & API Routes)
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (JSON Web Tokens) & Bcryptjs for password hashing

### Third-Party Services
- **Payment Gateway**: PayHere
- **Image Hosting**: Cloudinary
- **Email Service**: Nodemailer
- **File Uploads**: Multer (for API-based uploads)

---

## Project Structure

```text
BookIndoor/
├── src/
│   ├── app/                # Next.js App Router (Pages & API)
│   │   ├── admin/          # Admin Dashboard & Ground Management
│   │   ├── api/            # Backend API Endpoints
│   │   ├── booking/        # Public Booking Flow
│   │   ├── login/          # Authentication Page
│   │   ├── superadmin/     # Super Admin Management Interface
│   │   └── user/           # User/Admin Profile Area
│   ├── components/         # Reusable React Components
│   │   ├── Calendar.tsx    # Complex Booking Calendar logic
│   │   ├── AddGroundForm.tsx # Multi-step ground creation
│   │   ├── GroundCard.tsx   # Display card for search results
│   │   └── ...
│   ├── lib/                # Utility Functions & Configs
│   │   ├── auth.ts         # JWT handling
│   │   ├── mongodb.ts      # Database connection
│   │   ├── payhere.ts      # Payment signatures & logic
│   │   └── email.ts        # Nodemailer templates & transport
│   └── models/             # Mongoose Database Schemas
│       ├── User.ts         # Admin & Super Admin schemas
│       ├── Grounds.ts      # Ground details & availability
│       └── Booking.ts      # Reservation & Payment status
├── public/                 # Static Assets
└── package.json            # Dependencies & Scripts
```

---

## Database Models

### 1. User Model (`User.ts`)
Stores information for administrative roles.
- **Roles**: `super_admin`, `admin`.
- **Fields**: Name, Email, PasswordHash, Phone, Address, Bank Details (for payouts), NIC.

### 2. Ground Model (`Grounds.ts`)
Represents the sports facilities.
- **Fields**: Name, Location (Address, Lat/Lng), Contact, Ground Type, Sports (Array of objects with price), Available Time, Amenities, Images (Cloudinary URLs), Description.

### 3. Booking Model (`Booking.ts`)
Handles reservations and financial transactions.
- **Fields**: Ground Reference, Sport Name, Guest Info (Name, Phone, etc.), Date, Time Slots, Status (`reserved`, `confirmed`, `cancelled`), Payment Status (`pending`, `advanced_paid`, `full_paid`), Transaction IDs.

---

## Key Features

### 1. Public Booking Flow
- **Search & Filter**: Users can filter grounds by location and type.
- **Real-time Availability**: An interactive calendar displays available slots based on selected sports and dates.
- **Secure Checkout**: Integrates with PayHere for advanced or full payments.

### 2. Admin Dashboard
- **Ground Management**: Admins can add/edit their grounds, upload images, and set pricing.
- **Booking Management**: View and manage reservations, track payments, and update booking statuses.

### 3. Super Admin Panel
- **User Management**: Ability to create and manage Admin accounts.
- **Global Analytics**: View platform-wide statistics like total bookings, active grounds, and revenue.

---

## API Documentation

### Auth
- `POST /api/auth/login`: Authenticates users and sets a JWT cookie.

### Grounds
- `GET /api/grounds`: Fetch all available grounds.
- `POST /api/grounds`: Create a new ground (Admin only).

### Bookings
- `POST /api/booking`: Create a temporary reservation.
- `GET /api/booking/check`: Verify slot availability.

### PayHere
- `POST /api/payhere/notify`: Webhook listener for payment status updates from PayHere.

---

## Environment Variables Required
To run this project, the following `.env` variables are needed:
- `MONGODB_URI`: Connection string for MongoDB.
- `JWT_SECRET`: Secret key for token signing.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary credentials.
- `PAYHERE_MERCHANT_ID`, `PAYHERE_SECRET`: PayHere integration keys.
- `EMAIL_USER`, `EMAIL_PASS`: SMTP credentials for Nodemailer.

---

## Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```
