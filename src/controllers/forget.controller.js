const db = require('../db/sqlite');
const crypto = require('crypto');
const { sendOTPEmail } = require('../utils/sendMail');

let otpStore = {};

async function requestReset(req, res) {
  const { username, email } = req.body;

  const sql = `SELECT * FROM users WHERE username = ? AND email = ?`;
  db.get(sql, [username, email], async (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const ref = crypto.randomBytes(6).toString('hex');

    otpStore[username] = { otp, ref };

    try {
      await sendOTPEmail(email, otp);
      res.status(200).json({ message: 'ส่ง OTP เรียบร้อย', reference: ref });
    } catch (error) {
      console.error('ส่งอีเมลล้มเหลว:', error);
      res.status(500).json({ error: 'ส่งอีเมลล้มเหลว' });
    }
  });
}

function verifyOTP(req, res) {
  const { username, otp, reference } = req.body;

  const record = otpStore[username];
  if (!record || record.otp !== otp || record.ref !== reference) {
    return res.status(400).json({ error: 'OTP หรือ reference ไม่ถูกต้อง' });
  }

  res.status(200).json({ message: 'ยืนยัน OTP สำเร็จ' });
}

function resetPassword(req, res) {
  const { username, new_password } = req.body;

  const sql = `SELECT * FROM users WHERE username = ?`;
  db.get(sql, [username], (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    const updateSql = `UPDATE users SET password = ? WHERE username = ?`;
    db.run(updateSql, [new_password, username], (err) => {
      if (err)
        return res.status(500).json({ error: 'ไม่สามารถเปลี่ยนรหัสผ่านได้' });

      delete otpStore[username];
      res.status(200).json({ message: 'เปลี่ยนรหัสผ่านเรียบร้อย' });
    });
  });
}

module.exports = {
  requestReset,
  verifyOTP,
  resetPassword,
};
