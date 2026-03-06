import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking, { IBooking } from "@/models/Booking";
import { verifyToken } from "@/lib/auth";
import { sendBookingConfirmationEmail } from "@/lib/email";
import Ground, { IGround } from "@/models/Grounds";
import { IUser } from "@/models/User";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        // The params argument needs to be awaited in Next.js 15+ (if using dynamic routes in app router, though here params is direct argument)
        // However, in some Next.js versions params might be a promise.
        // For standard route handlers, params is an object.
        const { id } = await params;

        const body = await req.json();
        const { token, paymentStatus, bookingStatus } = body;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || (decoded.role !== "admin" && decoded.role !== "super_admin")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updateData: Partial<IBooking> = {};
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (bookingStatus) updateData.status = bookingStatus;

        const booking = await Booking.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // ✅ Trigger Confirmation Emails if status changed to 'confirmed'
        if (bookingStatus === 'confirmed') {
            try {
                const populatedBooking = await Booking.findById(booking._id)
                    .populate({
                        path: 'ground',
                        populate: { path: 'owner' }
                    });

                if (populatedBooking) {
                    const groundInfo = populatedBooking.ground as unknown as IGround;
                    const ownerInfo = groundInfo?.owner as unknown as IUser;
                    const guestInfo = populatedBooking.guest;

                    const bookingDetails = `${populatedBooking.date}: ${populatedBooking.timeSlots.map((ts: any) => ts.startTime).join(', ')}`;

                    // 1. Send to Guest
                    if (guestInfo?.email) {
                        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
                        const cancellationLink = `${baseUrl}/booking/cancel?id=${populatedBooking.paymentGroupId || populatedBooking._id}`;

                        await sendBookingConfirmationEmail({
                            to: guestInfo.email,
                            subject: "Your Booking is Confirmed! - BookIndoor",
                            userName: guestInfo.name,
                            groundName: groundInfo.name,
                            bookingDate: populatedBooking.date,
                            bookingTime: bookingDetails,
                            amount: `Rs. ${populatedBooking.totalAmount}`,
                            cancellationLink: cancellationLink,
                        });
                    }

                    // 2. Send to Ground Owner
                    if (ownerInfo?.email) {
                        await sendBookingConfirmationEmail({
                            to: ownerInfo.email,
                            subject: "New Confirmed Booking Received - BookIndoor",
                            userName: ownerInfo.name,
                            groundName: groundInfo.name,
                            bookingDate: populatedBooking.date,
                            bookingTime: bookingDetails,
                            amount: `Rs. ${populatedBooking.totalAmount}`,
                            text: `Hi ${ownerInfo.name},\n\nYou have a new confirmed booking for ${groundInfo.name}.\n\nUser: ${guestInfo?.name}\nDate/Time: ${bookingDetails}\nTotal: Rs. ${populatedBooking.totalAmount}\n\nPlease check your admin panel for details.`
                        });
                    }

                    // 3. Send to System Admin
                    const systemAdminEmail = process.env.EMAIL_USER;
                    if (systemAdminEmail) {
                        await sendBookingConfirmationEmail({
                            to: systemAdminEmail,
                            subject: "System Alert: Booking Confirmed Manually - BookIndoor",
                            userName: "System Admin",
                            groundName: groundInfo.name,
                            bookingDate: populatedBooking.date,
                            bookingTime: bookingDetails,
                            amount: `Rs. ${populatedBooking.totalAmount}`,
                            text: `System Notification:\n\nA booking has been manually confirmed by an admin.\n\nGround: ${groundInfo.name}\nOwner: ${ownerInfo?.name} (${ownerInfo?.email})\nUser: ${guestInfo?.name} (${guestInfo?.email})\nDate/Time: ${bookingDetails}\nTotal: Rs. ${populatedBooking.totalAmount}`
                        });
                    }
                }
            } catch (emailError) {
                console.error("❌ Failed to send manual confirmation emails:", emailError);
            }
        }

        return NextResponse.json(booking);
    } catch (err: unknown) {
        console.error("Update Booking Error:", err);
        return NextResponse.json(
            { error: "Failed to update booking" },
            { status: 500 }
        );
    }
}
