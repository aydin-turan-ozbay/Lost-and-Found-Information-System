# Admin Paneli Modülü - Implementasyon Rehberi

## 📋 Özet
Admin Paneli modülü, sistem yöneticilerine (role = 'admin') kayıp ve bulunan eşyaları yönetmek için kapsamlı bir arayüz sağlar. Yalnızca Admin rolüne sahip kullanıcılar erişebilir.

## 🚀 Kurulum Adımları

### 1. Database Migration
Veritabanına `delivered_to_user_id` sütunu eklemek için aşağıdaki SQL komutunu çalıştırın:

```bash
# MySQL Workbench içinde veya mysql CLI aracılığıyla:
mysql -u root -p12345678 lost_found_db < src/database/migration_add_delivered_to.sql
```

**SQL komutu:**
```sql
ALTER TABLE items ADD COLUMN delivered_to_user_id INT DEFAULT NULL;
ALTER TABLE items ADD CONSTRAINT fk_items_delivered_to_user 
    FOREIGN KEY (delivered_to_user_id) REFERENCES users(id) ON DELETE SET NULL;
```

### 2. Dosya Yapısı

Oluşturulan yeni dosyalar:

```
src/
├── backend/
│   ├── admin_panel.php              [NEW] Admin dashboard PHP
│   ├── deliver_item.php             [NEW] Delivery işlemi API
│   ├── get_admin_items.php          [NEW] Öğeleri getiren API
│   ├── get_lost_item_users.php      [NEW] Kayıp ilanı sahiplerini getiren API
│   └── index.php                    [MODIFIED] Admin link eklendi
│
├── database/
│   └── migration_add_delivered_to.sql [NEW] Database migration
│
└── frontend/
    ├── admin_panel.css              [NEW] Admin panel stilleri
    └── admin_panel.js               [NEW] Admin panel fonksiyonları
```

## 🔐 Erişim Kontrolü

Admin Paneli şu şekilde korunmaktadır:
- ✅ Sadece login olmuş kullanıcılar erişebilir
- ✅ Sadece `role = 'admin'` olan kullanıcılar erişebilir
- ✅ Diğer tüm kullanıcılar ana sayfaya yönlendirilir

## 🎯 Özellikler

### 1. Dinamik Tablo (4 Sekme)

#### a) **Tümü Sekmesi**
- Tüm ilanları gösterir (kayıp + bulunan)
- Tür, durum, konum vb. bilgiler

#### b) **Kayıp Eşyalar Sekmesi**
- Sadece `type = 'lost'` ilanları gösterir
- Kayıp ilanları yönetmek için

#### c) **Bulunan Eşyalar Sekmesi**
- Sadece `type = 'found'` ilanları gösterir
- **"Teslim Et" Butonu:**
  - Sadece `status = 'active'` olan "Found" ilanlarında görünür
  - Tıklandığında modal açılır

#### d) **Teslim Edilenler Sekmesi**
- Sadece `status = 'delivered'` olan ilanları gösterir
- Hangi buluntunun kime teslim edildiğini gösterir

### 2. Akıllı "Teslim Et" Mekanizması

#### Flow:
1. **Bulunan Eşyalar sekmesinde "Teslim Et" butonuna tıkla**
   - Modal açılır

2. **Modal Açılır:**
   - Eşya bilgisi gösterilir
   - "Teslim Alıcı Seçiniz" dropdown
   - "İptal" ve "Teslim Et" butonları

3. **Dropdown İçeriği:**
   - Aktif `Lost` ilanları bulunan kullanıcılar
   - SQL JOIN sorgusu ile çekilir
   - Format: `Ad Soyad (T.C. Kimlik Numarası)`

4. **"Teslim Et" Butonuna Basılır:**
   - Fetch API ile `deliver_item.php` e POST isteği
   - Backend işlemleri:
     - İlan status'u `'active'` → `'delivered'` değişir
     - `delivered_to_user_id` kaydedilir
     - Sayfa yenilenmeden tablo güncellenir

### 3. Navbar Güncellemesi

Ana sayfada (`index.php`) admin kullanıcılar için:
- **🔐 Admin Paneli** linki eklenmiş
- Profil linkinin yanında görünür
- Sadece admins için görülebilir

### 4. Çıkış Butonu

Sayfanın en alt ortasında büyükçe bir "Çıkış Yap" butonu:
- `position: fixed; bottom: 30px; left: 50%`
- Gradient background (kırmızı)
- Hover efektleri

## 📊 Veritabanı Şeması Güncellemesi

**Eklenen Sütun:**
```sql
delivered_to_user_id INT DEFAULT NULL
FOREIGN KEY REFERENCES users(id) ON DELETE SET NULL
```

**Kullanım:**
- Buluntu eşyası (`type = 'found'`) teslim edildiğinde
- Bu sütun alıcı kullanıcının ID'sini saklar

## 🔄 API Endpoints

### 1. GET `/backend/get_admin_items.php?type=`
**Parametreler:** `all`, `lost`, `found`, `delivered`

**Dönüş:**
```json
{
  "ok": true,
  "items": [
    {
      "id": 1,
      "user_id": 5,
      "title": "İPhone 14",
      "type": "found",
      "status": "active",
      "category": "electronic",
      "location": "bakırköy campus",
      "item_date": "2025-04-20",
      "full_name": "Ali Veli",
      "student_id": "12345",
      "delivered_to_user": null
    }
  ]
}
```

### 2. GET `/backend/get_lost_item_users.php`
**Açıklama:** Aktif Lost ilanları olan kullanıcıları getirir

**Dönüş:**
```json
{
  "ok": true,
  "users": [
    {
      "id": 3,
      "full_name": "Fatih Eren",
      "student_id": "98765",
      "email": "fatih@example.com"
    }
  ]
}
```

### 3. POST `/backend/deliver_item.php`
**Parameters:**
- `item_id` (int): Teslim edilecek eşya ID'si
- `recipient_id` (int): Teslim alıcı kullanıcı ID'si

**Dönüş:**
```json
{
  "ok": true,
  "message": "Eşya başarıyla teslim edildi"
}
```

## 🎨 Stilendirme

### CSS Dosyası: `frontend/admin_panel.css`

**Renkler:**
- Gradient: `#667eea` → `#764ba2` (mavi-mor)
- Başarı: `#28a745` (yeşil)
- Uyarı: `#ffc107` (sarı)
- Hata: `#e74c3c` (kırmızı)

**Responsive:**
- Tablet: 768px breakpoint
- Mobile-first design
- Tüm cihazlarda çalışır

## 🔧 Güvenlik Özellikleri

✅ **SQL Injection Koruması:** Prepared statements kullanılır
✅ **CSRF Koruması:** Session tabanlı
✅ **XSS Koruması:** `htmlspecialchars()` ve `escapeHtml()` kullanılır
✅ **Access Control:** Role tabanlı erişim kontrolü
✅ **Input Validation:** Tüm girdiler kontrol edilir

## 📝 Notlar

- Mevcut dosyalar ve veritabanı yapısı korunmuş
- Modüler kod - kolayca genişletilebilir
- UTF-8 karakter desteği var
- Türkçe tam destekli

## ⚠️ Önemli

**Migration çalıştırmayı unutmayın!** Aksi takdirde `delivered_to_user_id` sütunu olmadığı için teslim işlemi çalışmaz.

```bash
# Terminal'de
cd src/database/
mysql -u root -p12345678 lost_found_db < migration_add_delivered_to.sql
```

## 🐛 Troubleshooting

| Sorun | Çözüm |
|-------|-------|
| Admin paneline erişemiyor | Kullanıcının `role = 'admin'` olup olmadığını kontrol et |
| Migration hataları | MySQL versiyonunu kontrol et (InnoDB gerekli) |
| Teslim işlemi başarısız | Alıcının aktif Lost ilanı olup olmadığını kontrol et |
| Dropdown boş | Active Lost ilanı olmadığında beklenen davranış |

---

**Yapılandırma Tarihi:** 21.04.2025
**Sistem:** Lost and Found Information System v1.2
