const { findUserByUsername, findUserByUUID } = require('../models/user.model');

// POST /login
function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'กรุณากรอก username และ password' });
  }

  findUserByUsername(username, (err, user) => {
    if (err) return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });

    if (!user || user.password !== password) {
      return res
        .status(400)
        .json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    res.status(200).json({
      message: 'เข้าสู่ระบบสำเร็จ',
      user: {
        uuid: user.uuid,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      },
    });
  });
}

// GET /user/:uuid
function getUserByUUID(req, res) {
  const uuid = req.params.uuid;

  findUserByUUID(uuid, (err, user) => {
    if (err) return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    }

    res.status(200).json({
      uuid: user.uuid,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      email: user.email,
    });
  });
}

module.exports = { login, getUserByUUID };
