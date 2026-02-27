import nodemailer from "nodemailer";

interface EmailData {
  to: string;
  subject: string;
  userName: string;
  groundName: string;
  bookingDate: string;
  bookingTime: string;
  amount: number | string;
  text?: string; // ✅ Optional plain-text version
  cancellationLink?: string; // ✅ Optional cancellation link
}

export async function sendBookingConfirmationEmail({
  to,
  subject,
  userName,
  groundName,
  bookingDate,
  bookingTime,
  amount,
  text,
  cancellationLink,
}: EmailData) {
  try {
    // Validate recipient email
    if (!to || typeof to !== "string" || !to.includes("@")) {
      throw new Error(`Invalid recipient email: ${to}`);
    }

    // Validate credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Missing email credentials in environment variables");
    }

    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // HTML email body
    const isMultiDate = bookingDate === "Multiple Dates" || bookingTime.includes('\n');

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; background-color: #f4f7f6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #e1e8e5;">
          <div style="background-color: #2E8B57; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${subject}</h1>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px; margin-top: 0;">Hi <strong>${userName}</strong>,</p>
            <p style="font-size: 15px; color: #555;">Your booking at <strong>${groundName}</strong> has been confirmed! Here are the details of your reservation:</p>
            
            <div style="background-color: #f9fbf9; border-left: 4px solid #2E8B57; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>📍 Ground:</strong> ${groundName}</p>
              
              ${isMultiDate
        ? `<p style="margin: 0 0 8px 0; font-size: 15px;"><strong>📅 Booking Schedule:</strong></p>
                   <div style="margin-left: 10px; font-size: 14px; color: #444;">
                     ${bookingTime.split('\n').map(line => `<div style="margin-bottom: 6px; padding: 4px 0; border-bottom: 1px dashed #eee;">• ${line}</div>`).join('')}
                   </div>`
        : `<p style="margin: 0 0 8px 0; font-size: 15px;"><strong>📅 Date:</strong> ${bookingDate}</p>
                   <p style="margin: 0 0 15px 0; font-size: 15px;"><strong>⏰ Time:</strong> ${bookingTime}</p>`
      }
              
              <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #eef2f0;">
                <p style="margin: 0; font-size: 18px; color: #2E8B57;"><strong>Total Amount:</strong> ${amount}</p>
              </div>
            </div>
            
            <p style="font-size: 15px; line-height: 1.5;">We look forward to seeing you at the ground! If you need to make any changes, please contact the ground admin directly.</p>
            
            ${cancellationLink ? `
            <div style="margin: 30px 0; text-align: center;">
              <p style="font-size: 14px; color: #666; margin-bottom: 15px;">Need to cancel? You can cancel your booking up to 24 hours before the scheduled time.</p>
              <a href="${cancellationLink}" style="background-color: #d9534f; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Cancel Booking</a>
            </div>
            ` : ''}

            <p style="margin-top: 30px; font-size: 15px;">Thank you for choosing <strong>BookIndoor</strong>!</p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee; font-size: 13px; color: #888; text-align: center;">
              <p style="margin: 0;">Best regards,<br/><strong>The BookIndoor Team</strong></p>
              <p style="margin: 10px 0 0 0;">© ${new Date().getFullYear()} BookIndoor. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Send email
    const info = await transporter.sendMail({
      from: `"BookIndoor" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || `Booking confirmation for ${groundName} on ${bookingDate} at ${bookingTime}.`,
      html: htmlContent,
    });

    console.log(`✅ Email successfully sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}
