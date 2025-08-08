const express = require('express');
const router = express.Router();
const {
  requestReset,
  verifyOTP,
  resetPassword,
} = require('../controllers/forget.controller');

/**
 * @swagger
 * tags:
 *   name: Forget
 *   description: ระบบลืมรหัสผ่าน
 */

/**
 * @swagger
 * /forget/request-reset:
 *   post:
 *     summary: ส่ง OTP ไปยังอีเมล
 *     tags: [Forget]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: ส่ง OTP แล้ว
 *       404:
 *         description: ไม่พบผู้ใช้งาน
 */
router.post('/forget/request-reset', requestReset);

/**
 * @swagger
 * /forget/verify-otp:
 *   post:
 *     summary: ยืนยัน OTP
 *     tags: [Forget]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - otp
 *               - reference
 *             properties:
 *               username:
 *                 type: string
 *               otp:
 *                 type: string
 *               reference:
 *                 type: string
 *     responses:
 *       200:
 *         description: ยืนยัน OTP สำเร็จ
 *       400:
 *         description: OTP หรือ reference ไม่ถูกต้อง
 */
router.post('/forget/verify-otp', verifyOTP);

/**
 * @swagger
 * /forget/reset-password:
 *   put:
 *     summary: เปลี่ยนรหัสผ่าน
 *     tags: [Forget]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - old_password
 *               - new_password
 *             properties:
 *               username:
 *                 type: string
 *               old_password:
 *                 type: string
 *               new_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: เปลี่ยนรหัสผ่านเรียบร้อย
 *       400:
 *         description: รหัสผ่านเดิมไม่ถูกต้อง
 */
router.put('/forget/reset-password', resetPassword);

module.exports = router;