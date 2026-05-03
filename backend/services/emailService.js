const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Election Commission of Pakistan" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error(`❌ Email error: ${err.message}`);
    throw err;
  }
};

const candidateWelcomeEmail = (email, name, tempPassword) => sendEmail({
  to: email,
  subject: 'Election Commission of Pakistan – Candidate Registration',
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f0fdf4;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px;text-align:center">
        <h1 style="color:white;margin:0;font-size:24px">🗳️ Election Commission of Pakistan</h1>
        <p style="color:#bbf7d0;margin:8px 0 0">Official Candidate Portal</p>
      </div>
      <div style="padding:32px">
        <h2 style="color:#14532d">Welcome, ${name}!</h2>
        <p style="color:#374151">You have been registered as a candidate in the E-Voting system.</p>
        <div style="background:white;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:20px 0">
          <p style="margin:0;color:#374151"><strong>Login Email:</strong> ${email}</p>
          <p style="margin:8px 0 0;color:#374151"><strong>Temporary Password:</strong> <code style="background:#f0fdf4;padding:4px 8px;border-radius:4px;color:#16a34a">${tempPassword}</code></p>
        </div>
        <p style="color:#dc2626;font-weight:bold">⚠️ You must change your password on first login.</p>
        <a href="${process.env.FRONTEND_URL}/login" style="display:inline-block;background:#16a34a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">Login to Dashboard →</a>
      </div>
    </div>
  `
});

const otpEmail = (email, otp) => sendEmail({
  to: email,
  subject: 'Election Commission of Pakistan – Password Reset OTP',
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f0fdf4;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px;text-align:center">
        <h1 style="color:white;margin:0">🔐 Password Reset OTP</h1>
      </div>
      <div style="padding:32px;text-align:center">
        <p style="color:#374151;font-size:18px">Your OTP code is:</p>
        <div style="font-size:48px;font-weight:bold;color:#16a34a;letter-spacing:12px;margin:20px 0">${otp}</div>
        <p style="color:#6b7280">This OTP expires in 10 minutes.</p>
      </div>
    </div>
  `
});

const votingStartEmail = (email, name, startTime, endTime) => sendEmail({
  to: email,
  subject: 'Election Commission of Pakistan – Voting Has Started!',
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f0fdf4;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px;text-align:center">
        <h1 style="color:white;margin:0">🗳️ Voting Has Begun!</h1>
      </div>
      <div style="padding:32px">
        <h2 style="color:#14532d">Dear ${name},</h2>
        <p style="color:#374151">The voting period has officially started. Cast your vote now.</p>
        <div style="background:white;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:20px 0">
          <p style="margin:0;color:#374151"><strong>Start:</strong> ${new Date(startTime).toLocaleString()}</p>
          <p style="margin:8px 0 0;color:#374151"><strong>End:</strong> ${new Date(endTime).toLocaleString()}</p>
        </div>
        <a href="${process.env.FRONTEND_URL}/voter/dashboard" style="display:inline-block;background:#16a34a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none">Cast Your Vote →</a>
      </div>
    </div>
  `
});

module.exports = { sendEmail, candidateWelcomeEmail, otpEmail, votingStartEmail };