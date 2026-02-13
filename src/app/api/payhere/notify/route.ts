import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { verifyPayHereSignature } from '@/lib/payhere';

export async function POST(req: Request) {
    try {
        const text = await req.text();
        const params = new URLSearchParams(text);
        const data: Record<string, string> = {};
        params.forEach((value, key) => {
            data[key] = value;
        });

        const {
            merchant_id,
            order_id,
            payment_id,
            payhere_amount,
            payhere_currency,
            status_code,
            md5sig,
            custom_1, // Assuming custom_1 is used to pass booking ID if order_id is not the booking ID
            custom_2 // Assuming custom_2 is used to pass payment type (advance/full)
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

            // Assuming order_id is the Booking ID
            // If we use a custom order ID format (e.g., BOOKING_ID_TIMESTAMP), we need to extract the Booking ID
            // For simplicity, let's assume order_id passed to PayHere is the Booking ID (mongodb _id)

            const booking = await Booking.findById(order_id);

            if (!booking) {
                console.error(`Booking not found for order_id: ${order_id}`);
                return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
            }

            // Update booking status
            // custom_2 could store 'advanced_paid' or 'full_paid' if we passed it
            // Or we can infer from amount vs totalAmount

            // Let's assume we pass the intended status in custom_2 or just mark as advanced_paid/full_paid based on context
            // Re-evaluating: In PaymentForm, we decide isAdvance. 
            // Ideally, we should pass this info to PayHere in a custom field (custom_1 or custom_2)

            const paymentStatus = custom_1 === 'advance' ? 'advanced_paid' : 'full_paid';

            booking.paymentStatus = paymentStatus;
            booking.status = 'confirmed'; // Confirming the booking on payment
            // You might want to save payment_id as well if you add a field to the schema

            await booking.save();

            console.log(`Booking ${order_id} updated to ${paymentStatus}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('PayHere notify error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
