const { findUserByUsername, findUserByID } = require('../models/user.model');

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
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
      },
    });
  });
}

function getUserById(req, res) {
  const { id } = req.params;

  findUserByID(id, (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
    }

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    }

    res.status(200).json({
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      email: user.email,
    });
  });
}

module.exports = { login, getUserById };
