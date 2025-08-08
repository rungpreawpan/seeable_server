const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const upload = multer({ dest: 'uploads/' });

let latestOCRResult = null;

const uploadOCR = [
  upload.single('image'),
  async (req, res) => {
    const lang = req.body.lang || 'eng';
    const imagePath = req.file.path;

    if (!req.file) {
      return res.status(400).json({ error: 'ไม่พบไฟล์ภาพที่อัปโหลด' });
    }

    try {
      const form = new FormData();
      form.append('image', fs.createReadStream(imagePath));
      form.append('lang', lang);

      await axios.post('http://localhost:5001/ocr', form, {
        headers: form.getHeaders(),
      });

      res.json({ status: 'OCR processing started' });
    } catch (err) {
      console.error('OCR forward error:', err.message);
      res.status(500).json({ error: 'Failed to send to OCR processor' });
    } finally {
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('ลบไฟล์ไม่สำเร็จ:', err.message);
        } else {
          console.log(`ลบไฟล์ชั่วคราวแล้ว: ${imagePath}`);
        }
      });
    }
  },
];

const receiveOCRResult = (req, res) => {
  latestOCRResult = {
    ...req.body,
    timestamp: new Date().toISOString(),
  };
  console.log('OCR Result received:', latestOCRResult);
  res.sendStatus(200);
};

const getLatestOCR = (req, res) => {
  if (latestOCRResult) {
    res.json(latestOCRResult);
  } else {
    res.status(404).json({ error: 'No OCR result yet' });
  }
};

module.exports = {
  uploadOCR,
  receiveOCRResult,
  getLatestOCR,
};
