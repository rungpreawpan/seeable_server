const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '2463110383@tni.ac.th',
    pass: 'akpb qksa jjpq ngst',
  },
});

async function sendOTPEmail(to, otp) {
  const info = await transporter.sendMail({
    from: '"Seeable Team" <your.email@gmail.com>',
    to,
    subject: 'รหัส OTP สำหรับรีเซ็ตรหัสผ่าน',
    html: `<p>รหัส OTP ของคุณคือ: <b>${otp}</b></p>`,
  });

  console.log('อีเมลถูกส่ง:', info.messageId);
}

module.exports = { sendOTPEmail };
