const express = require('express');
const { execFile } = require('child_process');
const path = require('path');
const app = express();
const PORT = 3005;

app.get('/api/sba', (req, res) => {
  const { keyword } = req.query;
  if (!keyword) return res.json([]);

  const searchKey = keyword.toLowerCase().trim();
  const exePath = path.join(__dirname, 'SbaQuery32.exe');

  // 🎯 บังคับรับค่าเป็นสตริงสากล utf8 ตรง ๆ ไม่ผ่านตัวแปลงภาษา win874 อีกต่อไป
  execFile(exePath, [searchKey], { encoding: 'utf8' }, (error, stdout, stderr) => {
    if (error) {
      console.error('🔥 [SBA OS Exec Error]:', error.message);
      return res.json([]);
    }
    
    try {
      const output = stdout.trim();
      if (!output || output === "[]") return res.json([]);
      
      const data = JSON.parse(output);
      return res.json(Array.isArray(data) ? data : [data]);
    } catch (parseError) {
      console.error('🔥 [JSON Parse Error]:', parseError.message, stdout);
      return res.json([]);
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SBA Native-Bridge Service (Pure UTF-8 Pass-Through) is running on http://127.0.0.1:${PORT}`);
});

//D:\Git Desktop\aura\sba-bridge-service>node index.js