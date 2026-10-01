// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// const sendEmail = async ({ to, subject, html }) => {
//   try {
//     await transporter.sendMail({
//       from: `"Election Commission of Pakistan" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html
//     });
//     console.log(`✅ Email sent to ${to}`);
//   } catch (err) {
//     console.error(`❌ Email error: ${err.message}`);
//     throw err;
//   }
// };

// const candidateWelcomeEmail = (email, name, tempPassword) => sendEmail({
//   to: email,
//   subject: 'Election Commission of Pakistan – Candidate Registration',
//   html: `
//     <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f0fdf4;border-radius:12px;overflow:hidden">
//       <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px;text-align:center">
//         <h1 style="color:white;margin:0;font-size:24px">🗳️ Election Commission of Pakistan</h1>
//         <p style="color:#bbf7d0;margin:8px 0 0">Official Candidate Portal</p>
//       </div>
//       <div style="padding:32px">
//         <h2 style="color:#14532d">Welcome, ${name}!</h2>
//         <p style="color:#374151">You have been registered as a candidate in the E-Voting system.</p>
//         <div style="background:white;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:20px 0">
//           <p style="margin:0;color:#374151"><strong>Login Email:</strong> ${email}</p>
//           <p style="margin:8px 0 0;color:#374151"><strong>Temporary Password:</strong> <code style="background:#f0fdf4;padding:4px 8px;border-radius:4px;color:#16a34a">${tempPassword}</code></p>
//         </div>
//         <p style="color:#dc2626;font-weight:bold">⚠️ You must change your password on first login.</p>
//         <a href="${process.env.FRONTEND_URL}/login" style="display:inline-block;background:#16a34a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">Login to Dashboard →</a>
//       </div>
//     </div>
//   `
// });

// const otpEmail = (email, otp) => sendEmail({
//   to: email,
//   subject: 'Election Commission of Pakistan – Password Reset OTP',
//   html: `
//     <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f0fdf4;border-radius:12px;overflow:hidden">
//       <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px;text-align:center">
//         <h1 style="color:white;margin:0">🔐 Password Reset OTP</h1>
//       </div>
//       <div style="padding:32px;text-align:center">
//         <p style="color:#374151;font-size:18px">Your OTP code is:</p>
//         <div style="font-size:48px;font-weight:bold;color:#16a34a;letter-spacing:12px;margin:20px 0">${otp}</div>
//         <p style="color:#6b7280">This OTP expires in 10 minutes.</p>
//       </div>
//     </div>
//   `
// });

// const votingStartEmail = (email, name, startTime, endTime) => sendEmail({
//   to: email,
//   subject: 'Election Commission of Pakistan – Voting Has Started!',
//   html: `
//     <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f0fdf4;border-radius:12px;overflow:hidden">
//       <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px;text-align:center">
//         <h1 style="color:white;margin:0">🗳️ Voting Has Begun!</h1>
//       </div>
//       <div style="padding:32px">
//         <h2 style="color:#14532d">Dear ${name},</h2>
//         <p style="color:#374151">The voting period has officially started. Cast your vote now.</p>
//         <div style="background:white;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:20px 0">
//           <p style="margin:0;color:#374151"><strong>Start:</strong> ${new Date(startTime).toLocaleString()}</p>
//           <p style="margin:8px 0 0;color:#374151"><strong>End:</strong> ${new Date(endTime).toLocaleString()}</p>
//         </div>
//         <a href="${process.env.FRONTEND_URL}/voter/dashboard" style="display:inline-block;background:#16a34a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none">Cast Your Vote →</a>
//       </div>
//     </div>
//   `
// });

// module.exports = { sendEmail, candidateWelcomeEmail, otpEmail, votingStartEmail };
const nodemailer = require('nodemailer');

/* =========================================================
   EMAIL TRANSPORTER
========================================================= */

const transporter = nodemailer.createTransport({
  service: 'gmail',

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },

  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000
});

transporter.verify((error, success) => {
  if (error) {
    console.error('GMAIL CONNECTION FAILED');
    console.error(error);
  } else {
    console.log('GMAIL READY TO SEND EMAILS');
  }
});


/* =========================================================
   SEND EMAIL
========================================================= */

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Election Commission of Pakistan" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error(`Email error: ${err.message}`);
    throw err;
  }
};


/* =========================================================
   SHARED EMAIL WRAPPER
========================================================= */

const emailWrapper = ({
  title,
  subtitle,
  content
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>${title}</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f4f8f5;
    font-family:Arial,Helvetica,sans-serif;
    color:#1f2937;
  "
>

  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="
      width:100%;
      background:#f4f8f5;
      padding:36px 16px;
    "
  >
    <tr>
      <td align="center">

        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            width:100%;
            max-width:580px;
            background:#ffffff;
            border:1px solid #dfe9e2;
            border-radius:16px;
            overflow:hidden;
            box-shadow:0 8px 28px rgba(8,102,51,0.08);
          "
        >

          <!-- =========================
               HEADER
          ========================== -->

          <tr>
            <td
              style="
                padding:28px 32px;
                background:#086633;
                text-align:left;
              "
            >

              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
              >
                <tr>

                  <td
                    width="46"
                    valign="middle"
                  >
                    <div
                      style="
                        width:42px;
                        height:42px;
                        line-height:42px;
                        text-align:center;
                        border-radius:10px;
                        background:#ffffff;
                        color:#086633;
                        font-size:17px;
                        font-weight:800;
                      "
                    >
                      ECP
                    </div>
                  </td>

                  <td
                    valign="middle"
                    style="padding-left:12px;"
                  >
                    <div
                      style="
                        color:#ffffff;
                        font-size:18px;
                        line-height:24px;
                        font-weight:700;
                      "
                    >
                      Election Commission of Pakistan
                    </div>

                    <div
                      style="
                        color:#bce8cb;
                        font-size:12px;
                        line-height:18px;
                        margin-top:2px;
                      "
                    >
                      ${subtitle}
                    </div>
                  </td>

                </tr>
              </table>

            </td>
          </tr>


          <!-- =========================
               CONTENT
          ========================== -->

          <tr>
            <td
              style="
                padding:34px 32px;
              "
            >
              ${content}
            </td>
          </tr>


          <!-- =========================
               FOOTER
          ========================== -->

          <tr>
            <td
              style="
                padding:20px 32px;
                background:#f8fbf9;
                border-top:1px solid #e5ede8;
                text-align:center;
              "
            >

              <p
                style="
                  margin:0;
                  color:#52675a;
                  font-size:11px;
                  line-height:18px;
                  font-weight:600;
                "
              >
                Election Commission of Pakistan
              </p>

              <p
                style="
                  margin:3px 0 0;
                  color:#8a9a90;
                  font-size:10px;
                  line-height:16px;
                "
              >
                Secure &nbsp;&bull;&nbsp;
                Verified &nbsp;&bull;&nbsp;
                Digital
              </p>

              <p
                style="
                  margin:12px 0 0;
                  color:#9aa8a0;
                  font-size:10px;
                  line-height:16px;
                "
              >
                This is an automated system email.
                Please do not reply to this message.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;


/* =========================================================
   CANDIDATE WELCOME EMAIL
========================================================= */

const candidateWelcomeEmail = (
  email,
  name,
  tempPassword
) =>
  sendEmail({
    to: email,

    subject:
      'Election Commission of Pakistan – Candidate Registration',

    html: emailWrapper({
      title: 'Candidate Registration',

      subtitle: 'Official Candidate Portal',

      content: `

        <div
          style="
            display:inline-block;
            padding:5px 10px;
            margin-bottom:16px;
            background:#eaf8ef;
            border:1px solid #ccebd7;
            border-radius:20px;
            color:#08713a;
            font-size:10px;
            font-weight:700;
            letter-spacing:0.4px;
            text-transform:uppercase;
          "
        >
          Candidate Account Created
        </div>


        <h1
          style="
            margin:0 0 12px;
            color:#163d27;
            font-size:24px;
            line-height:32px;
            font-weight:700;
          "
        >
          Welcome, ${name}
        </h1>


        <p
          style="
            margin:0;
            color:#56645b;
            font-size:14px;
            line-height:22px;
          "
        >
          Your candidate account has been successfully
          registered in the E-Voting System. You can use
          the credentials below to access the Candidate Portal.
        </p>


        <!-- LOGIN DETAILS -->

        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            margin:26px 0 22px;
            background:#f7faf8;
            border:1px solid #dce9e0;
            border-radius:12px;
          "
        >

          <tr>
            <td
              style="
                padding:18px 20px 8px;
                color:#7a8b80;
                font-size:10px;
                font-weight:700;
                letter-spacing:0.7px;
                text-transform:uppercase;
              "
            >
              Your Login Credentials
            </td>
          </tr>


          <!-- EMAIL -->

          <tr>
            <td
              style="
                padding:10px 20px;
              "
            >

              <div
                style="
                  color:#7c8b82;
                  font-size:11px;
                  margin-bottom:5px;
                "
              >
                Login Email
              </div>

              <div
                style="
                  color:#20382a;
                  font-size:14px;
                  line-height:20px;
                  font-weight:700;
                  word-break:break-all;
                "
              >
                ${email}
              </div>

            </td>
          </tr>


          <!-- DIVIDER -->

          <tr>
            <td
              style="
                padding:0 20px;
              "
            >
              <div
                style="
                  height:1px;
                  background:#e1eae4;
                "
              ></div>
            </td>
          </tr>


          <!-- PASSWORD -->

          <tr>
            <td
              style="
                padding:12px 20px 20px;
              "
            >

              <div
                style="
                  color:#7c8b82;
                  font-size:11px;
                  margin-bottom:7px;
                "
              >
                Temporary Password
              </div>

              <div
                style="
                  display:inline-block;
                  padding:8px 12px;
                  background:#e9f7ee;
                  border:1px solid #c7e8d2;
                  border-radius:8px;
                  color:#086633;
                  font-family:'Courier New',monospace;
                  font-size:16px;
                  line-height:20px;
                  font-weight:700;
                  letter-spacing:1px;
                "
              >
                ${tempPassword}
              </div>

            </td>
          </tr>

        </table>


        <!-- SECURITY NOTICE -->

        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            margin-bottom:24px;
            background:#fffaf0;
            border:1px solid #f1dfb5;
            border-radius:10px;
          "
        >
          <tr>
            <td
              style="
                padding:13px 15px;
                color:#72551a;
                font-size:12px;
                line-height:19px;
              "
            >
              <strong>Security notice:</strong>
              You will be required to create a new password
              when you sign in for the first time. Do not
              share your temporary password with anyone.
            </td>
          </tr>
        </table>


        <!-- LOGIN BUTTON -->

        <table
          role="presentation"
          cellspacing="0"
          cellpadding="0"
          border="0"
        >
          <tr>
            <td
              bgcolor="#159447"
              style="
                border-radius:9px;
              "
            >

              <a
                href="${process.env.FRONTEND_URL}/login"
                style="
                  display:inline-block;
                  padding:12px 22px;
                  color:#ffffff;
                  text-decoration:none;
                  font-size:13px;
                  line-height:18px;
                  font-weight:700;
                "
              >
                Sign in to Candidate Portal
              </a>

            </td>
          </tr>
        </table>


        <p
          style="
            margin:22px 0 0;
            color:#8b9890;
            font-size:11px;
            line-height:18px;
          "
        >
          If you were not expecting this registration,
          please contact the Election Commission administrator.
        </p>

      `
    })
  });


/* =========================================================
   PASSWORD RESET OTP EMAIL
========================================================= */

const otpEmail = (email, otp) =>
  sendEmail({
    to: email,

    subject:
      'Election Commission of Pakistan – Password Reset Code',

    html: emailWrapper({
      title: 'Password Reset',

      subtitle: 'Account Security',

      content: `

        <div style="text-align:center;">

          <div
            style="
              display:inline-block;
              padding:5px 10px;
              margin-bottom:16px;
              background:#eaf8ef;
              border:1px solid #ccebd7;
              border-radius:20px;
              color:#08713a;
              font-size:10px;
              font-weight:700;
              letter-spacing:0.4px;
              text-transform:uppercase;
            "
          >
            Security Verification
          </div>


          <h1
            style="
              margin:0 0 10px;
              color:#163d27;
              font-size:23px;
              line-height:30px;
              font-weight:700;
            "
          >
            Password Reset
          </h1>


          <p
            style="
              margin:0;
              color:#637067;
              font-size:14px;
              line-height:21px;
            "
          >
            Use the verification code below to
            continue resetting your password.
          </p>


          <div
            style="
              margin:26px auto 20px;
              padding:18px 20px;
              max-width:270px;
              background:#f2faf5;
              border:1px solid #cde9d6;
              border-radius:12px;
            "
          >

            <div
              style="
                color:#7b8e82;
                font-size:10px;
                font-weight:700;
                letter-spacing:0.8px;
                text-transform:uppercase;
                margin-bottom:9px;
              "
            >
              Verification Code
            </div>

            <div
              style="
                color:#08713a;
                font-family:'Courier New',monospace;
                font-size:32px;
                line-height:40px;
                font-weight:700;
                letter-spacing:7px;
              "
            >
              ${otp}
            </div>

          </div>


          <p
            style="
              margin:0;
              color:#6f7d74;
              font-size:12px;
              line-height:19px;
            "
          >
            This code expires in
            <strong style="color:#344c3d;">
              10 minutes
            </strong>.
          </p>


          <p
            style="
              margin:20px 0 0;
              color:#929f97;
              font-size:11px;
              line-height:18px;
            "
          >
            If you did not request a password reset,
            you can safely ignore this email.
          </p>

        </div>

      `
    })
  });


/* =========================================================
   VOTING START EMAIL
========================================================= */

const votingStartEmail = (
  email,
  name,
  startTime,
  endTime
) =>
  sendEmail({
    to: email,

    subject:
      'Election Commission of Pakistan – Voting Period Has Started',

    html: emailWrapper({
      title: 'Voting Period',

      subtitle: 'Official Voting Notification',

      content: `

        <div
          style="
            display:inline-block;
            padding:5px 10px;
            margin-bottom:16px;
            background:#eaf8ef;
            border:1px solid #ccebd7;
            border-radius:20px;
            color:#08713a;
            font-size:10px;
            font-weight:700;
            letter-spacing:0.4px;
            text-transform:uppercase;
          "
        >
          Voting Now Open
        </div>


        <h1
          style="
            margin:0 0 12px;
            color:#163d27;
            font-size:24px;
            line-height:32px;
            font-weight:700;
          "
        >
          Voting period has started
        </h1>


        <p
          style="
            margin:0;
            color:#56645b;
            font-size:14px;
            line-height:22px;
          "
        >
          Dear ${name}, the scheduled voting period is
          now open. You can access your voter dashboard
          during the period shown below.
        </p>


        <!-- VOTING PERIOD -->

        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            margin:25px 0;
            background:#f7faf8;
            border:1px solid #dce9e0;
            border-radius:12px;
          "
        >

          <tr>
            <td
              width="50%"
              valign="top"
              style="
                padding:17px 18px;
                border-right:1px solid #e1eae4;
              "
            >

              <div
                style="
                  color:#849087;
                  font-size:10px;
                  font-weight:700;
                  text-transform:uppercase;
                  letter-spacing:0.5px;
                  margin-bottom:6px;
                "
              >
                Starts
              </div>

              <div
                style="
                  color:#254331;
                  font-size:12px;
                  line-height:19px;
                  font-weight:700;
                "
              >
                ${new Date(startTime).toLocaleString()}
              </div>

            </td>


            <td
              width="50%"
              valign="top"
              style="
                padding:17px 18px;
              "
            >

              <div
                style="
                  color:#849087;
                  font-size:10px;
                  font-weight:700;
                  text-transform:uppercase;
                  letter-spacing:0.5px;
                  margin-bottom:6px;
                "
              >
                Ends
              </div>

              <div
                style="
                  color:#254331;
                  font-size:12px;
                  line-height:19px;
                  font-weight:700;
                "
              >
                ${new Date(endTime).toLocaleString()}
              </div>

            </td>
          </tr>

        </table>


        <!-- BUTTON -->

        <table
          role="presentation"
          cellspacing="0"
          cellpadding="0"
          border="0"
        >
          <tr>
            <td
              bgcolor="#159447"
              style="
                border-radius:9px;
              "
            >

              <a
                href="${process.env.FRONTEND_URL}/voter/dashboard"
                style="
                  display:inline-block;
                  padding:12px 22px;
                  color:#ffffff;
                  text-decoration:none;
                  font-size:13px;
                  line-height:18px;
                  font-weight:700;
                "
              >
                Open Voter Dashboard
              </a>

            </td>
          </tr>
        </table>


        <p
          style="
            margin:22px 0 0;
            color:#8b9890;
            font-size:11px;
            line-height:18px;
          "
        >
          For account security, access the voting system
          only through the official E-Voting portal.
        </p>

      `
    })
  });


/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  sendEmail,
  candidateWelcomeEmail,
  otpEmail,
  votingStartEmail
};