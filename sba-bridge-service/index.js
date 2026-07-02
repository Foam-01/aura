const express = require('express');
const { execFile } = require('child_process');
const path = require('path');
const iconv = require('iconv-lite');
const app = express();
const PORT = 3005;

app.get('/api/sba', (req, res) => {
  const { keyword } = req.query;
  if (!keyword) return res.json([]);

  const searchKey = keyword.toLowerCase().trim();
  const exePath = path.join(__dirname, 'SbaQuery32.exe');

  // สั่งรับค่าผ่าน Buffer บิตดิบจากชั้นระบบ OS ของ Windows
  execFile(exePath, [searchKey], { encoding: 'buffer' }, (error, stdout, stderr) => {
    if (error) {
      console.error('🔥 [SBA OS Exec Error]:', error.message);
      return res.json([]);
    }
    
    try {
      // แปลงข้อมูลบิตสัญชาติไทย win874 ออกมาเป็นข้อความสากลคลีน ๆ
      const output = iconv.decode(stdout, 'win874').trim();
      
      if (!output || output === "[]") return res.json([]);
      
      const data = JSON.parse(output);
      
      // ดักฟ้องกรณีฝั่งตู้ C# โยน Error คำสั่งออกมา
      if (data[0] && data[0].error) {
        console.error('🔥 [SBA DB Core Report Error]:', data[0].error);
        return res.json([]);
      }

      return res.json(Array.isArray(data) ? data : [data]);
    } catch (parseError) {
      console.error('🔥 [JSON Parse Error]:', parseError.message);
      return res.json([]);
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SBA Native-Bridge Service (Final Patch) is running on http://127.0.0.1:${PORT}`);
});