# FixMyCity — API Endpointlar

Baza URL: `http://localhost:5001/api`
Swagger: `http://localhost:5001/api-docs`

Avtorizatsiya: JWT access token **httpOnly cookie** (`access_token`) orqali. Admin va Super Admin uchun role tekshiruvi middleware orqali amalga oshiriladi.

## Status kodlari
- `200` OK, `201` Yaratildi, `400` Validatsiya xatosi, `401` Avtorizatsiya kerak, `403` Ruxsat yo'q, `404` Topilmadi, `409` Konflikt, `500` Server xatosi

## Javob formati
```json
{ "success": true, "message": "...", "data": {}, "meta": {} }
```

---

## Auth

| Method | Endpoint | Ruxsat | Tavsif |
|--------|----------|--------|--------|
| POST | `/auth/register` | — | Ro'yxatdan o'tish. Tokenni cookie'ga yozadi |
| POST | `/auth/login` | — | Kirish. Tokenni cookie'ga yozadi |
| POST | `/auth/refresh` | refresh cookie | Refresh token orqali yangi tokenlar (rotatsiya) |
| POST | `/auth/logout` | refresh cookie | Chiqish, cookie'lar tozalanadi |
| GET | `/auth/me` | USER+ | Joriy foydalanuvchi |

### register
```json
{ "firstName": "Ali", "lastName": "Valiyev", "email": "a@b.uz", "password": "secret123" }
```
> Parol `bcrypt` 12 siklda hash'lanadi. `firstName/lastName` ≥2 belgi, `password` ≥6 belgi.

### login
```json
{ "email": "a@b.uz", "password": "secret123" }
```

---

## Users

| Method | Endpoint | Ruxsat | Tavsif |
|--------|----------|--------|--------|
| PATCH | `/users/me` | USER+ | Profilni yangilash (firstName, lastName, password, avatarUrl) |
| GET | `/users` | ADMIN+ | Ro'yxat. Query: `page, limit, search, role` |
| PATCH | `/users/:id/block` | ADMIN+ | Bloklash/ochish. Body: `{ "isBlocked": true }` |
| PATCH | `/users/:id/role` | SUPER_ADMIN | Rol o'zgartirish. Body: `{ "role": "ADMIN" }` |
| DELETE | `/users/:id` | SUPER_ADMIN | Foydalanuvchini o'chirish |

> Super Admin'ni bloklash/o'chirish/rolini o'zgartirish mumkin emas.

---

## Categories

| Method | Endpoint | Ruxsat | Tavsif |
|--------|----------|--------|--------|
| GET | `/categories` | — | Ro'yxat. Query: `includeInactive=true` |
| POST | `/categories` | SUPER_ADMIN | Yaratish. Body: `{ "name": "Yo'l", "slug": "road", "icon": "road" }` |
| PATCH | `/categories/:id` | SUPER_ADMIN | Yangilash |
| DELETE | `/categories/:id` | SUPER_ADMIN | O'chirish (shikoyat biriktirilgan bo'lsa rad etiladi) |

---

## Complaints

| Method | Endpoint | Ruxsat | Tavsif |
|--------|----------|--------|--------|
| GET | `/complaints` | — | Ro'yxat. Query: `page, limit, status, categoryId, search, sort(votes\|newest)` |
| GET | `/complaints/map` | — | Xarita markerlari (yengil: id, lat/lng, status, votes) |
| GET | `/complaints/:id` | — (optional auth) | Tafsilotlar + rasmlar + ovozlar + status tarixi |
| POST | `/complaints` | USER+ | Yaratish. **multipart/form-data** |
| PATCH | `/complaints/:id` | muallif (PENDING) | Tahrirlash |
| POST | `/complaints/:id/images` | muallif | Rasmlar qo'shish |
| PATCH | `/complaints/:id/status` | ADMIN+ | Holatni o'zgartirish |
| DELETE | `/complaints/:id` | muallif(PENDING) yoki ADMIN+ | O'chirish |

### POST /complaints (multipart/form-data)
```
title        — sarlavha (≥5 belgi)
description  — matn (≥10 belgi)
categoryId   — UUID
latitude     — -90..90
longitude    — -180..180
address      — manzil (ixtiyoriy)
images[]     — rasm fayllari (jpeg/png/webp/gif, har biri ≤5MB, maks 6 ta)
```

> AI analiz asinxron ishlaydi: shikoyat `PENDING` bo'lib yaratiladi, keyin AI `aiAnalysis` (isAppropriate, summary, riskLevel, categoryGuess) ni to'ldiradi. Nomaqbul bo'lsa `status=BLOCKED`, `aiDecision=BLOCKED`.

### Statuslar va o'tishlar
```
PENDING    -> VERIFIED, REJECTED, BLOCKED
VERIFIED   -> IN_PROGRESS, REJECTED
IN_PROGRESS-> RESOLVED, REJECTED
REJECTED / BLOCKED / RESOLVED -> (yakuniy)
```

### PATCH /complaints/:id/status
```json
{ "status": "IN_PROGRESS", "comment": "Brigada yuborildi" }
```
> Har bir o'zgarish `ComplaintStatusHistory` ga yoziladi.

---

## Votes

| Method | Endpoint | Ruxsat | Tavsif |
|--------|----------|--------|--------|
| POST | `/complaints/:complaintId/vote` | USER+ | Ovoz berish/bekor qilish (toggle, 1 ta ovoz/user) |
| GET | `/complaints/:complaintId/votes` | — | Ovozlar soni |

---

## AI (Groq)

| Method | Endpoint | Ruxsat | Tavsif |
|--------|----------|--------|--------|
| POST | `/ai/analyze/:id` | USER+ | Shikoyatni AI tahlil qiladi |
| POST | `/ai/chat` | — (optional auth) | AI chat, o'zbekcha javob |
| GET | `/ai/status` | — | AI yoqilganmi (`enabled`) |

### POST /ai/chat
```json
{
  "message": "Qanday shikoyat yozsam bo'ladi?",
  "history": [ { "role": "user", "content": "..." }, { "role": "assistant", "content": "..." } ]
}
```
> Avatar: `GROQ_API_KEY` sozlangan bo'lsa `llama-3.3-70b-versatile` model. Login bo'lsa foydalanuvchining shikoyatlari kontekstga qo'shiladi.

---

## Admin

| Method | Endpoint | Ruxsat | Tavsif |
|--------|----------|--------|--------|
| GET | `/admin/stats` | ADMIN+ | Dashboard statistika (users, complaints, statuslar, kategoriyalar, so'nggi shikoyatlar) |

---

## Health
| GET | `/health` | — | Server holati |

## Fayllar
`/uploads/:filename` — yuklangan rasmlar (static).
