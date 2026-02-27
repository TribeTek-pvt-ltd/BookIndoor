import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Ground, { IGround } from '@/models/Grounds';
import User, { IUser } from '@/models/User';
import { verifyPayHereSignature } from '@/lib/payhere';
import { sendBookingConfirmationEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const text = await req.text();
        const params = new URLSearchParams(text);
        const data: Record<string, string> = {};
        params.forEach((value, key) => {
            data[key] = value;
        });

        console.log("📢 PayHere Notify Received:", {
            order_id: data.order_id,
            status_code: data.status_code,
            amount: data.payhere_amount
        });

        const {
            merchant_id,
            order_id,
            payment_id,
            payhere_amount,
            payhere_currency,
            status_code,
            md5sig,
            custom_1, // payment type (advance/full)
            custom_2
        } = data;

        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

        if (!merchantSecret) {
            console.error('PayHere merchant secret not configured');
            return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
        }

        // Verify signature
        const isValid = verifyPayHereSignature(
            merchant_id,
            order_id,
            payhere_amount,
            payhere_currency,
            status_code,
            md5sig,
            merchantSecret
        );

        if (!isValid) {
            console.error('Invalid PayHere signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        if (status_code === '2') {
            // Payment Success
            await dbConnect();

            // The order_id passed from frontend is the paymentGroupId
            const paymentGroupId = order_id;

            // Update all bookings with this paymentGroupId
            const paymentStatus = custom_1 === 'advance' ? 'advanced_paid' : 'full_paid';

            const result = await Booking.updateMany(
                { paymentGroupId: paymentGroupId },
                {
                    $set: {
                        paymentStatus: paymentStatus,
                        status: 'confirmed',
                        payherePaymentId: payment_id,
                        paidAmount: parseFloat(payhere_amount)
                    }
                }
            );

            console.log(`📝 Update result for paymentGroupId ${paymentGroupId}:`, result);

            if (result.matchedCount === 0) {
                console.error(`Bookings not found for paymentGroupId: ${paymentGroupId}`);
            } else {
                console.log(`Updated ${result.modifiedCount} bookings for paymentGroupId ${paymentGroupId} to ${paymentStatus} (Payment ID: ${payment_id}, Amount: ${payhere_amount})`);

                // ✅ Send Confirmation Emails
                try {
                    // Fetch updated bookings with populated ground and owner info
                    const updatedBookings = await Booking.find({ paymentGroupId: paymentGroupId })
                        .populate({
                            path: 'ground',
                            populate: { path: 'owner' }
                        });

                    console.log(`🔍 Found ${updatedBookings.length} bookings for email notification.`);

                    if (updatedBookings.length > 0) {
                        const firstBooking = updatedBookings[0];
                        const groundInfo = firstBooking.ground as unknown as IGround;
                        const ownerInfo = groundInfo?.owner as unknown as IUser;
                        const guestInfo = firstBooking.guest;

                        const bookingDetails = updatedBookings.map(b => `${b.date}: ${b.timeSlots.map(ts => (ts as any).startTime).join(', ')}`).join('\n');

                        // 1. Send to Guest
                        if (guestInfo?.email) {
                            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
                            const cancellationLink = `${baseUrl}/booking/cancel?id=${paymentGroupId}`;

                            console.log(`📧 Sending guest email to ${guestInfo.email}. Cancellation Link: ${cancellationLink}`);

                            await sendBookingConfirmationEmail({
                                to: guestInfo.email,
                                subject: "Your Booking is Confirmed! - BookIndoor",
                                userName: guestInfo.name,
                                groundName: groundInfo.name,
                                bookingDate: updatedBookings.length > 1 ? "Multiple Dates" : firstBooking.date,
                                bookingTime: bookingDetails,
                                amount: `Rs. ${payhere_amount}`,
                                cancellationLink: cancellationLink,
                            });
                        }

                        // 2. Send to Ground Owner
                        if (ownerInfo?.email) {
                            console.log(`📧 Sending owner email to ${ownerInfo.email}`);
                            await sendBookingConfirmationEmail({
                                to: ownerInfo.email,
                                subject: "New Confirmed Booking Received - BookIndoor",
                                userName: ownerInfo.name,
                                groundName: groundInfo.name,
                                bookingDate: updatedBookings.length > 1 ? "Multiple Dates" : firstBooking.date,
                                bookingTime: bookingDetails,
                                amount: `Rs. ${payhere_amount}`,
                                text: `Hi ${ownerInfo.name},\n\nYou have received a new confirmed booking for ${groundInfo.name}.\n\nUser: ${guestInfo?.name}\nDates/Times:\n${bookingDetails}\nTotal Paid: Rs. ${payhere_amount}\n\nPlease check your admin panel for details.`
                            });
                        }
                    }
                } catch (emailError) {
                    console.error("❌ Failed to send confirmation emails:", emailError);
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('PayHere notify error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
