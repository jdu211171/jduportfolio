# Nginx 413 Xatosini Tuzatish Yo'riqnomasi

## Muammo
Recruiter profilida fayl yuklashda 413 Request Entity Too Large xatosi chiqmoqda. Bu nginx serveri 1MB dan katta fayllarni qabul qilmasligi sababli.

## Yechim Qadamlari

### 1. Express Server Yangilanishi ✅
Express server allaqachon yangilandi va 21MB gacha fayllarni qabul qilishga tayyor.

### 2. Nginx Konfiguratsiyasini Yangilash

#### Option A: Global nginx.conf faylini tahrirlash
```bash
# Nginx konfiguratsiya faylini toping
sudo nano /etc/nginx/nginx.conf

# http {} bloki ichiga quyidagini qo'shing:
client_max_body_size 21m;

# Nginx'ni qayta yuklang
sudo nginx -s reload
```

#### Option B: Site-specific konfiguratsiya (tavsiya etiladi)
```bash
# Portfolio.jdu.uz uchun nginx config faylini tahrirlang
sudo nano /etc/nginx/sites-available/portfolio.jdu.uz

# Yoki agar sites-enabled papkasida bo'lsa:
sudo nano /etc/nginx/sites-enabled/portfolio.jdu.uz
```

### 3. Nginx Konfiguratsiyasi Namunasi
Loyihada `nginx.conf` fayli yaratildi. Ushbu fayldan kerakli qismlarni serveringizdagi nginx konfiguratsiyasiga qo'shing:

**Muhim qo'shilishi kerak bo'lgan qatorlar:**
```nginx
# Server bloki ichida
client_max_body_size 21m;
client_body_timeout 120s;
client_header_timeout 120s;

# Location bloklarida
proxy_connect_timeout 120s;
proxy_send_timeout 120s;
proxy_read_timeout 120s;
```

### 4. O'zgarishlarni Qo'llash
```bash
# Nginx konfiguratsiyasini tekshirish
sudo nginx -t

# Agar xatolik yo'q bo'lsa, nginx'ni qayta yuklash
sudo nginx -s reload

# Yoki to'liq qayta ishga tushirish
sudo systemctl restart nginx
```

### 5. Tekshirish
1. Browser'da portfolio.jdu.uz saytini oching
2. Recruiter profiliga kiring
3. 1MB dan katta fayl yuklashga harakat qiling
4. Fayl muvaffaqiyatli yuklanishi kerak

## Qo'shimcha Ma'lumotlar

### Fayl Hajmi Chegaralari:
- **Nginx**: 21MB (yangi sozlama)
- **Express**: 21MB (yangilandi)
- **Multer (application logic)**: 20MB (o'zgartirilmagan)

### Debug qilish:
Agar hali ham muammo bo'lsa, quyidagilarni tekshiring:
```bash
# Nginx error loglarini ko'rish
sudo tail -f /var/log/nginx/error.log

# Node.js loglarini ko'rish
pm2 logs
```

### Muhim Eslatmalar:
- Serverda nginx konfiguratsiyasini o'zgartirish uchun sudo huquqi kerak
- O'zgarishlardan keyin nginx'ni qayta yuklashni unutmang
- Agar SSL sertifikat ishlatilsa, HTTPS server blokida ham client_max_body_size o'rnatilganligiga ishonch hosil qiling