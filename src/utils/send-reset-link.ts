
import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.NODE_MAILER_EMAIL,
    pass: process.env.NODE_MAILER_PASSWORD,
  },
});

const sendResetLink = async (
  toEmail: string,
  resetLink: string,
  subject?: string
): Promise<boolean> => {
  try {
    const mailOptions = {
      from: `"SkillClub" <${process.env.NODE_MAILER_EMAIL}>`,
      to: toEmail,
      subject: subject ? subject : "Reset Your Password",
      text: `Click the link below to reset your password: ${resetLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
          <h2 style="color:#2563eb;">Password Reset</h2>

          <p>You requested to reset your password.</p>

          <p>Click the button below to reset it:</p>

          <a href="${resetLink}" 
             style="
               display: inline-block;
               padding: 12px 20px;
               background-color: #2563eb;
               color: #ffffff;
               text-decoration: none;
               border-radius: 6px;
               font-weight: bold;
             ">
             Reset Password
          </a>

          <p style="margin-top:20px;">
            Or copy and paste this link into your browser:
          </p>

          <p style="word-break: break-all;">${resetLink}</p>

          <p>This link will expire in 10 minutes.</p>

          <hr style="margin-top:20px;" />
          <small>If you did not request this, please ignore this email.</small>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Reset email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending reset email:", error);
    return false;
  }
};

export default sendResetLink;