const nodemailer = require('nodemailer');

const getTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('[EmailService] EMAIL_USER/EMAIL_PASS not configured. Emails will not be sent.');
        return null;
    }
    return nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
};

const sendEmail = async ({ to, subject, html }) => {
    const transporter = getTransporter();
    if (!transporter) return { skipped: true };
    try {
        const info = await transporter.sendMail({
            from: `"CoreX Gym" <${process.env.EMAIL_USER}>`,
            to, subject, html,
        });
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('[EmailService] Failed to send:', err.message);
        return { success: false, error: err.message };
    }
};

// ─── EMAIL TEMPLATES ──────────────────────────────────────────────────────────
const baseStyle = `font-family: 'Inter', Arial, sans-serif; background:#0a0a0a; color:#fff; padding:32px; border-radius:12px; max-width:600px; margin:0 auto;`;
const btnStyle = `display:inline-block; background: linear-gradient(135deg,#f97316,#ef4444); color:#fff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:600; margin-top:16px;`;
const headerStyle = `font-size:24px; font-weight:700; color:#f97316; margin-bottom:8px;`;

exports.sendMembershipExpiryEmail = async (member, daysLeft) => {
    return sendEmail({
        to: member.email,
        subject: `⚠️ Your CoreX membership expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
        html: `<div style="${baseStyle}">
            <p style="${headerStyle}">Membership Expiring Soon</p>
            <p>Hi <strong>${member.username}</strong>,</p>
            <p>Your CoreX membership expires in <strong>${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong>. Renew now to keep your fitness journey going!</p>
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/profile" style="${btnStyle}">Renew Now</a>
            <p style="margin-top:24px; font-size:12px; color:#666;">CoreX Fitness Intelligence</p>
        </div>`,
    });
};

exports.sendWelcomeEmail = async (member) => {
    return sendEmail({
        to: member.email,
        subject: '🔥 Welcome to CoreX!',
        html: `<div style="${baseStyle}">
            <p style="${headerStyle}">Welcome to CoreX!</p>
            <p>Hi <strong>${member.username}</strong>,</p>
            <p>You're officially part of the CoreX family. Your member ID is <strong>${member.memberId}</strong>.</p>
            <p>Start your fitness journey by completing your AI assessment!</p>
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/ai/assessment" style="${btnStyle}">Start AI Assessment</a>
        </div>`,
    });
};

exports.sendPaymentReceiptEmail = async (member, payment) => {
    return sendEmail({
        to: member.email,
        subject: '✅ Payment Confirmed — CoreX',
        html: `<div style="${baseStyle}">
            <p style="${headerStyle}">Payment Confirmed</p>
            <p>Hi <strong>${member.username}</strong>, your payment of <strong>₹${payment.amount}</strong> has been received.</p>
            <p>Plan: ${payment.planName || 'Membership'} | Date: ${new Date(payment.date).toLocaleDateString()}</p>
        </div>`,
    });
};

exports.sendBirthdayEmail = async (member) => {
    return sendEmail({
        to: member.email,
        subject: '🎂 Happy Birthday from CoreX!',
        html: `<div style="${baseStyle}">
            <p style="${headerStyle}">Happy Birthday, ${member.username}! 🎉</p>
            <p>Wishing you a fantastic birthday. Keep crushing your fitness goals!</p>
            <p>From the entire CoreX team 💪</p>
        </div>`,
    });
};

exports.sendEmail = sendEmail;
