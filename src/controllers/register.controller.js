const { createUser } = require('../models/user.model');
const db = require('../db/sqlite');

function registerUser(req, res) {
  const { firstname, lastname, username, password, email, uuid } = req.body;

  if (!firstname || !lastname || !username || !password || !email || !uuid) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  createUser(
    { firstname, lastname, uuid, username, password, email },
    function (err) {
      if (err) {
        console.error('Error:', err.message);

        if (err.message.includes('uuid')) {
          return res.status(400).json({ error: 'UUID นี้ถูกใช้ไปแล้ว' });
        }
        if (err.message.includes('username')) {
          return res.status(400).json({ error: 'Username นี้ถูกใช้ไปแล้ว' });
        }
        if (err.message.includes('email')) {
          return res.status(400).json({ error: 'Email นี้ถูกใช้ไปแล้ว' });
        }

        return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลงทะเบียน' });
      }

      res.status(201).json({ message: 'ลงทะเบียนสำเร็จ' });
      console.log('ข้อมูลที่ได้รับจาก mobile app:', req.body);
    },
  );
}

function updateUser(req, res) {
  const { uuid } = req.params;
  const { firstname, lastname, email, password, newUuid, username } = req.body;

  const fields = [];
  const values = [];

  if (firstname) {
    fields.push('firstname = ?');
    values.push(firstname);
  }
  if (lastname) {
    fields.push('lastname = ?');
    values.push(lastname);
  }
  if (email) {
    fields.push('email = ?');
    values.push(email);
  }
  if (password) {
    fields.push('password = ?');
    values.push(password);
  }
  if (newUuid) {
    fields.push('uuid = ?');
    values.push(newUuid);
  }
  if (username) {
    fields.push('username = ?');
    values.push(username);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'ไม่ได้ส่งข้อมูลที่จะแก้ไข' });
  }

  const sql = `UPDATE users SET ${fields.join(', ')} WHERE uuid = ?`;
  values.push(uuid);

  db.run(sql, values, function (err) {
    if (err) {
      console.error('Update user error:', err.message);

      if (err.message.includes('email')) {
        return res.status(400).json({ error: 'Email นี้ถูกใช้ไปแล้ว' });
      }
      if (err.message.includes('uuid')) {
        return res.status(400).json({ error: 'UUID นี้ถูกใช้ไปแล้ว' });
      }
      if (err.message.includes('username')) {
        return res.status(400).json({ error: 'Username นี้ถูกใช้ไปแล้ว' });
      }

      return res.status(500).json({ error: 'ไม่สามารถแก้ไขข้อมูลได้' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    res.status(200).json({ message: 'แก้ไขข้อมูลสำเร็จ' });
  });
}

module.exports = {
  registerUser,
  updateUser,
};