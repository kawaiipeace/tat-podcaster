# 🔧 Clerk JWT Template Setup Instructions

## ขั้นตอนการตั้งค่า Clerk JWT Template สำหรับ Convex:

### 1. เข้า Clerk Dashboard
- ไปที่: https://dashboard.clerk.com
- เลือก Application ของคุณ

### 2. สร้าง JWT Template
- ไปที่ **JWT Templates** (ใน Configure menu)
- คลิก **"+ New template"**

### 3. ใส่ข้อมูล Template:
```
Name: convex
Token Lifetime: 60 minutes
```

### 4. ใส่ Claims:
```json
{
  "aud": "convex",
  "sub": "{{user.id}}"
}
```

**หมายเหตุ:** ไม่ต้องใส่ `iss` เพราะเป็น reserved claim ที่ Clerk จัดการให้อัตโนมัติ

### 5. บันทึกและเสร็จสิ้น

หลังจากสร้างเสร็จแล้ว refresh หน้าเว็บแอปพลิเคชัน error จะหายไป

## หมายเหตุ:
- ต้องใช้ domain ที่ตรงกับใน `convex/auth.config.ts`
- applicationID ต้องเป็น "convex"
- ใช้ template name เป็น "convex"
