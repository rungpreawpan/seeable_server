const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

let latestResult = null;

const uploadImage = [
  upload.single('image'),
  async (req, res) => {
    const imagePath = req.file?.path;

    if (!req.file) {
      return res.status(400).json({ error: 'ไม่พบไฟล์ภาพที่อัปโหลด' });
    }

    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

    try {
      const response = await axios.post('http://localhost:5001/obstacle-detect', form, {
        headers: form.getHeaders(),
      });

      res.json({
        message: 'Image sent to Python',
        status: response.data.status || 'sent',
        result: response.data.result || null,
      });
    } catch (err) {
      console.error('Error sending to Python:', err.message);
      res.status(500).json({ error: 'Failed to send to Python' });
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

const receiveResult = (req, res) => {
  latestResult = req.body;
  console.log('Result from Python:', latestResult);
  res.sendStatus(200);
};

const getLatest = (req, res) => {
  if (latestResult) {
    res.json(latestResult);
  } else {
    res.status(404).json({ error: 'No result yet' });
  }
};

module.exports = {
  uploadImage,
  receiveResult,
  getLatest,
};
