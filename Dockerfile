# 1. ดึงฐานระบบ Python 3.13 ที่เสถียรมาใช้งาน
FROM python:3.13-slim

# 2. ตั้งค่าพื้นที่ทำงานในตู้คอนเทนเนอร์
WORKDIR /app

# 3. คัดลอกไฟล์รายชื่อไลบรารีเข้าไปติดตั้งก่อน
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. คัดลอกโค้ดทั้งหมดในโฟลเดอร์ backend ตามเข้าไป
COPY backend/ .

# 5. สั่งให้แอปเปิดทำงานผ่านพอร์ตของ Railway โดยตรง
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
