const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Create a transporter
    // We are using Ethereal Email for testing. In production, use Gmail, SendGrid, etc.
    let transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        // Use production SMTP if configured
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } else {
        // Fallback to test account if no SMTP provided
        console.log("No SMTP credentials found in .env, falling back to ethereal.email test account.");
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    // 2. Define the email options
    const mailOptions = {
        from: 'JobListingPortal <noreply@joblistingportal.com>',
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    // 3. Actually send the email
    const info = await transporter.sendMail(mailOptions);
    
    console.log("Message sent: %s", info.messageId);
    
    // Log preview URL if using Ethereal
    if (info.messageId && !process.env.SMTP_HOST) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
};

module.exports = sendEmail;
