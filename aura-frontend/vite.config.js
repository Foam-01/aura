import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 🟢 เติมบล็อกนี้เข้าไปในโค้ดเดิมของโฟมครับ เพื่อเปิดสิทธิ์ให้พี่เลี้ยงยิง IP เข้ามาได้
  server: {
    host: true, 
    port: 5173 // หรือพอร์ตเดิมที่หน้าบ้านโฟมใช้รันปกติ
  }
})

//export default defineConfig({
 // plugins: [react()],
//})