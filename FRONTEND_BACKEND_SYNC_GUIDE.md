# Frontend Backend Uyg'unlash - Test Yo'riqnoma

## Backend O'zgarishlar Xulosasi

### 1. **Yangi `upsertDraft` metodi**

- Endpoint: `POST /api/draft`
- Bitta endpoint orqali ham yaratish, ham yangilash
- `changed_fields` avtomatik kuzatiladi

### 2. **Submit xavfsizlik tekshiruvi**

- Bir vaqtda faqat bitta `submitted` draft bo'lishi mumkin
- Xatolik: "Sizda allaqachon tekshiruvga yuborilgan faol qoralama mavjud"

## Frontend O'zgarishlar

### 1. **Top.jsx - handleDraftUpsert**

```javascript
// Eski:
if (currentDraft.id) {
	res = await axios.put(`/api/draft/${currentDraft.id}`, data)
} else {
	res = await axios.post(`/api/draft`, data)
}

// Yangi:
const res = await axios.post(`/api/draft`, {
	student_id: studentIdToUse,
	profile_data: { ...editData.draft },
})
```

### 2. **QA.jsx - Submit xatolik handle**

```javascript
catch (error) {
  if (error.response?.data?.error?.includes('allaqachon tekshiruvga yuborilgan')) {
    showAlert('Avvalgi so\'rovingiz hali ko\'rib chiqilmagan!', 'warning')
  }
}
```

### 3. **ChekProfile.jsx - Changed fields ko'rsatish**

- Staff jadvalida yangi "変更項目" ustuni
- O'zgargan maydonlar ko'k taglikda ko'rsatiladi

## Test Qilish Bosqichlari

### 1. **Draft yaratish/yangilash testi**

1. Student sifatida login qiling
2. Profile > Edit tugmasini bosing
3. Biror maydonni o'zgartiring (masalan, self_introduction)
4. "Update Draft" tugmasini bosing
5. Tekshiring: Draft muvaffaqiyatli saqlandi

### 2. **Submit xavfsizlik testi**

1. Draft'ni submit qiling (承認依頼・同意)
2. Edit mode'ga qaytib, yana submit qilishga urinib ko'ring
3. Kutilgan natija: Warning xabar chiqishi kerak

### 3. **Changed fields testi (Staff uchun)**

1. Staff sifatida login qiling
2. "確認プロフィール" sahifasiga o'ting
3. "変更項目" ustunida o'zgargan maydonlar ko'rinishi kerak
4. Masalan: "自己紹介", "スキル" kabi

### 4. **Status o'zgarishi testi**

1. Student tahrirlashni boshlaganda status avtomatik `draft` ga o'tadi
2. Staff tasdiqlasa yoki rad etsa, `changed_fields` tozalanadi

## Muhim Eslatmalar

1. **Migration**: Backend ishga tushirilganda `npm run migrate` bajarilgan bo'lishi kerak
2. **Cache**: Browser cache'ni tozalash tavsiya etiladi
3. **Console**: Xatoliklar uchun browser console'ni tekshiring

## Debugging

Agar muammo bo'lsa:

1. Network tab'da API response'larni tekshiring
2. Console'da xatoliklarni ko'ring
3. Backend log'larini tekshiring: `npm run dev`

## API Endpoints

- Draft yaratish/yangilash: `POST /api/draft`
- Draft submit: `PUT /api/draft/:id/submit`
- Status yangilash: `PUT /api/draft/status/:id`
- Barcha draft'lar: `GET /api/draft`
