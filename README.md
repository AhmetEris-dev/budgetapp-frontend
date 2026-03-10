# BudgetApp Frontend

BudgetApp Frontend; kullanicinin butce limiti belirlemesini, harcama kaydi olusturmasini, belirli tarih araliklarinda toplam harcamasini takip etmesini ve backend tarafindan uretilen butce uyarilarini gormesini saglayan bir React uygulamasidir.

Uygulama, JWT tabanli kimlik dogrulama ile calisir ve token yenileme (refresh token) mekanizmasini otomatik olarak yonetir.

## Ozellikler

- Kimlik dogrulama: kayit olma, giris yapma ve cikis
- Token yonetimi: access/refresh token localStorage'da saklanir
- Otomatik token yenileme: 401 durumunda `/api/v1/auth/refresh` ile tek seferlik yenileme ve istegi tekrar deneme
- Dashboard:
  - kullanici bilgisi (`/users/me`)
  - aktif butce ozeti
  - tarih araligina gore toplam harcama
  - son aktif bildirimler
- Butce yonetimi:
  - aylik ve yillik butce tanimlama/guncelleme
  - aktif butceyi cekme
- Harcama yonetimi:
  - harcama ekleme
  - tarih araligina gore harcama listeleme
  - tarih araligina gore toplam harcama hesaplama
- Bildirim yonetimi:
  - sag drawer icinde aktif bildirimleri gosterme
  - bildirimleri "okundu" olarak isaretleme
  - 30 saniyede bir polling ile bildirimleri yenileme
  - kritik/butce asimi durumlarinda toast ve dikkat cekici app bar vurgusu
- Tema yonetimi: light/dark mod gecisi
- Form dogrulama: `react-hook-form` + `zod`
- Geri bildirim: `sweetalert2` ile modal ve toast mesajlari

## Kullanilan Teknolojiler

- React 19 + TypeScript
- Vite
- Material UI (MUI)
- Redux Toolkit + React Redux
- React Router
- React Hook Form + Zod
- SweetAlert2

## Mimari Ozet

Proje feature tabanli bir yapi izler:

- `src/features/auth`: giris/kayit akisi
- `src/features/user`: kullanici bilgisi (`me`)
- `src/features/budget`: butce kaydetme ve aktif butce
- `src/features/expense`: harcama ekleme/listeleme/toplam
- `src/features/alert`: bildirim listeleme ve okundu isaretleme
- `src/services/httpClient.ts`: tum HTTP istekleri, hata ayiklama ve token refresh yonetimi
- `src/store`: Redux store ve typed hook'lar
- `src/shared/layout`: uygulama kabuklari (`AuthShell`, `AppShell`)
- `src/router`: route tanimlari ve korumali route yapisi
- `src/utils`: tarih, etiket, tema, localStorage, sweetalert yardimcilari

## Route Yapisi

Genel route davranisi:

- `/login` ve `/register`: herkese acik
- `/dashboard`, `/budget`, `/expenses`: token gerektiren korumali sayfalar
- `/`: otomatik olarak `/dashboard` yonlendirmesi
- `*`: token durumuna gore `/dashboard` veya `/login` fallback

> Not: Bildirimler uygulamada sag drawer uzerinden yonetiliyor. Ayrica `AlertsPage` bileseni mevcut olsa da su an route listesine bagli degil.

## API Entegrasyonu

Frontend, backend endpointlerini `/api/v1` prefix'i ile cagirir.

Kullanilan temel endpointler:

- Auth
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
- User
  - `GET /api/v1/users/me`
- Budget
  - `POST /api/v1/budgets`
  - `GET /api/v1/budgets/active?periodType=...&year=...&month=...`
- Expense
  - `POST /api/v1/expenses`
  - `GET /api/v1/expenses?start=YYYY-MM-DD&end=YYYY-MM-DD`
  - `GET /api/v1/expenses/total?start=YYYY-MM-DD&end=YYYY-MM-DD`
- Alert
  - `GET /api/v1/alerts?status=ACTIVE|READ&page=0&size=10`
  - `PATCH /api/v1/alerts/{id}/read`

## Gereksinimler

- Node.js 20+ (onerilir)
- npm 10+
- Bu frontend ile uyumlu calisan bir backend servisi

## Kurulum

```bash
npm install
```

## Gelistirme Ortami

Vite gelistirme sunucusu, `/api` isteklerini varsayilan olarak `http://localhost:9090` adresine proxy'ler.

`vite.config.ts`:

- `/api` -> `http://localhost:9090`

Bu nedenle backend'in lokal ortamda calisiyor olmasi gerekir.

## Komutlar

```bash
npm run dev      # Gelistirme sunucusu
npm run build    # TypeScript + production build
npm run preview  # Build ciktisini lokal sunma
npm run lint     # ESLint kontrolu
```

## Ornek Kullanim Akisi

1. Kullanici `/register` ile hesap olusturur veya `/login` ile giris yapar.
2. Tokenlar localStorage'a kaydedilir.
3. Dashboard acilisinda kullanici, aktif butce, toplam harcama ve aktif bildirimler yuklenir.
4. Harcama ekleme ekranindan yeni kayit girilir.
5. Butce limiti asimi gibi durumlarda backend bildirim uretir; frontend polling ile bildirimi cekip kullaniciya gosterir.

## Durum Yonetimi

Redux store dilimleri:

- `auth`: token, auth loading/error
- `user`: kullanici profili
- `budget`: aktif butce, kaydetme/yukleme durumlari
- `expense`: harcama listesi, toplam, ekleme durumlari
- `alert`: sayfalanmis bildirim verisi ve okundu isaretleme durumlari

## Notlar

- Sayisal para alanlari backend ile uyum icin string olarak tasiniyor (BigDecimal hassasiyeti).
- 401 hatalarinda otomatik refresh denenir; refresh basarisizsa tokenlar temizlenir ve kullanici `/login` sayfasina yonlendirilir.
- Tema tercihi localStorage'da saklanir.

## Lisans

Bu proje icin lisans bilgisi henuz tanimlanmamis. Gerekirse `LICENSE` dosyasi ekleyebilirsiniz.
