# 🚨 แก้ไข Clerk JWT Template Claims Error

## ปัญหา: "You can't use the reserved claim: iss"

### ✅ วิธีแก้ไข:

1. **เข้า Clerk Dashboard** (ที่ sincere-foxhound-61.clerk.accounts.dev)
   - ไปที่ JWT Templates
   - ตรวจสอบว่ามี template ชื่อ "convex" หรือไม่

2. **ถ้าไม่มี template ให้สร้างใหม่:**
   - คลิก "New template"
   - Name: `convex` (ต้องเป็นตัวพิมพ์เล็กทั้งหมด)
   - Token lifetime: 60 minutes

3. **แก้ไข Claims ให้เป็น:**
```json
{
  "aud": "convex",
  "sub": "{{user.id}}"
}
```

4. **Save Template**

### 🚨 สิ่งสำคัญ:
- Template name ต้องเป็น `convex` (ตัวพิมพ์เล็ก)
- applicationID ใน auth.config.ts ต้องเป็น `convex`
- Domain ต้องตรงกับ Clerk instance ของคุณ

### 📝 Claims ที่ถูกต้อง:
- **aud (audience)**: ระบุว่า token นี้ใช้สำหรับ Convex
- **sub (subject)**: ระบุ user ID จาก Clerk

### 🚫 Claims ที่ห้ามใช้ (Reserved Claims):
- `iss` (issuer) - Clerk จัดการเอง
- `exp` (expiration) - Clerk จัดการเอง  
- `iat` (issued at) - Clerk จัดการเอง
- `nbf` (not before) - Clerk จัดการเอง

หลังจากแก้แล้ว refresh หน้าเว็บ error จะหายไป!
