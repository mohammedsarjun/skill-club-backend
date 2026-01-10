import nodemailer from 'nodemailer';

const sendEmailOtp = async (toEmail: string, otp: string) => {
  try {
    // 1. Create transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // SMTP host
      port: 587,
      secure: false, // false for TLS
      service: 'gmail', // using Gmail SMTP
      auth: {
        user: process.env.NODE_MAILER_EMAIL, // your Gmail address
        pass: process.env.NODE_MAILER_PASSWORD, // your Gmail App Password
      },
    });

    // 2. Email options
    const mailOptions = {
      from: `"SkillClub" <${process.env.NODE_MAILER_EMAIL}>`,
      to: toEmail,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
      html: `<p>Your OTP code is <b>${otp}</b>. It is valid for 5 minutes.</p>`,
    };

    // 3. Send mail
    const info = await transporter.sendMail(mailOptions);

    console.log('OTP email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email OTP:', error);
    return false;
  }
};

export default sendEmailOtp;
