# ChatetIN - Product Requirements Document (PRD)

## 1. Pendahuluan
**ChatetIN** adalah sebuah aplikasi pencatatan keuangan (budgeting) berbasis web yang dirancang dengan pendekatan manajemen kas yang ketat dan adaptif (SMC - Simulasi Manajemen Cash). Berbeda dengan aplikasi pencatatan konvensional yang hanya mencatat riwayat secara pasif, ChatetIN secara proaktif membagi total uang yang dimiliki pengguna dengan durasi hari yang ditargetkan, menghasilkan **jatah pengeluaran harian maksimal**. Aplikasi ini memanfaatkan tekanan psikologis (melalui teguran sarkas/savage) dan simulasi adaptif untuk memaksa penggunanya disiplin dalam mengatur keuangan.

## 2. Minimum Viable Product (MVP)
MVP dari ChatetIN berfokus pada **kesadaran arus kas harian yang ketat**. Aplikasi ini sengaja meniadakan fitur kompleks (seperti integrasi multi-rekening bank atau kategori tak terbatas) untuk berfokus pada:
1. Menetapkan jumlah uang (Target Budget) dan target waktu bertahan (Durasi).
2. Membagi uang tersebut menjadi jatah harian yang adaptif.
3. Mencatat pengeluaran masuk/keluar harian.
4. Memberikan penalti matematis langsung (jatah besok menyusut) jika hari ini boros, dan memberikan *reward* (jatah besok menggemuk) jika hari ini berhemat.
5. Menghentikan target secara paksa (Terminated) jika uang habis sebelum waktunya.

## 3. Fitur Utama (Core Features)

### A. Autentikasi & Keamanan (Supabase Auth)
- **Google Sign-In**: Login cepat dan aman menggunakan akun Google.
- **Auto-Logout**: Sistem akan secara otomatis mengeluarkan (logout) pengguna jika tidak ada aktivitas (idle) selama 15 menit untuk menjaga privasi finansial.

### B. Adaptive Budgeting (Sistem Jatah Harian)
- Pengguna menetapkan Total Budget dan Tanggal Mulai beserta Durasinya (misal: Rp1.500.000 untuk 30 Hari).
- Sistem membaginya menjadi Jatah Harian (Rp50.000/hari).
- **Logika Rollover**: Jika di hari ke-1 pengguna hanya menghabiskan Rp0 (tidak mencatat pengeluaran), maka sisa uang tersebut dialihkan (rollover) untuk menambah jatah harian di sisa 29 hari berikutnya.
- **Logika Penalti**: Jika pengguna menghabiskan melebihi jatah harian (Overspend), maka jatah harian di hari-hari selanjutnya akan dipotong secara matematis agar total budget tetap bertahan hingga hari terakhir.

### C. Pencegahan & Validasi Target
- Pengguna **tidak bisa** mencatat transaksi apapun jika mereka belum mengatur Target Budget.
- Jika tidak ada target aktif, tombol *Tambah* pengeluaran akan memicu **Modal Wajib Target** yang memaksa pengguna mengisi budget awal dari 0 (tidak ada angka default, guna menghindari kesalahan input).
- Pembatasan Tanggal: Pengguna tidak bisa mencatat pengeluaran di tanggal yang mendahului *Tanggal Mulai* target budget mereka.

### D. Savage Termination System (Pemutusan Paksa)
- Jika pengeluaran pengguna menyentuh angka yang membuat sisa saldo Rp0 atau minus (Defisit), sistem akan langsung mengakhiri target tersebut (*Terminated*).
- Sistem memunculkan **Alert/Peringatan "Savage"** yang tingkat kesadisannya bervariasi tergantung:
  1. Seberapa besar minusnya (Rp1-10.000, Rp11.000-100.000, dsb).
  2. Seberapa jauh sisa waktu yang gagal dicapai. *(Contoh: "Ngatur duitnya yang bener dong, bates waktu lo masih lama. liat tutor yt dulu sono!")*
- Pengguna dipaksa merenung dan membuat target baru dari awal.

### E. Riwayat (History Archive)
- Setiap target yang telah selesai durasinya atau yang terkena *Terminated* tidak akan dihapus, melainkan diarsipkan.
- Pengguna dapat melihat menu **Riwayat** untuk mengevaluasi apakah di masa lalu mereka defisit (warna merah) atau berhasil bertahan (warna hijau).

### F. Dasbor & Simulasi Tabel
- **Dasbor Utama**: Ringkasan sisa saldo, sisa hari, jatah hari ini, dan indikator grafis keuangan.
- **Tabel Target & Durasi**: Menampilkan simulasi harian (*day-by-day*). Baris hari yang lalu dihitung berdasarkan pengeluaran aktual (atau Rp0 jika tidak dicatat). Baris hari masa depan disimulasikan secara presisi.

### G. Export Data
- Fitur ekspor CSV untuk mengunduh seluruh transaksi yang terjadi pada sesi budget saat ini.

## 4. Alur Sistem (System Flow)
1. **Onboarding**: Pengguna login via Google.
2. **Inisiasi**: Karena belum memiliki budget aktif, pengguna pergi ke halaman Pencatatan. Saat menekan tombol Tambah, sistem mencegat pengguna dan menampilkan Modal yang mewajibkan input: `Total Budget`, `Durasi`, dan `Tanggal Mulai`.
3. **Siklus Harian (Pencatatan)**: 
   - Pengguna memasukkan pengeluaran atau pemasukan (opsional dengan kategori dan catatan).
   - *Dashboard* memperbarui metrik sisa budget dan jatah adaptif hari itu secara *real-time*.
4. **Malam Pergantian Hari (Background Calculation)**:
   - Jika pengguna melewatkan hari tanpa pengeluaran, sistem otomatis membacanya sebagai Rp0. Esok paginya, jatah harian membesar.
   - Jika pengguna overspend, esok paginya jatah harian mengecil.
5. **Kondisi Akhir**:
   - **Sukses**: Pengguna bertahan hingga durasi habis tanpa saldo minus. Budget diarsipkan ke Riwayat.
   - **Gagal (Terminated)**: Saldo menyentuh minus. Alert *Savage* muncul. Budget saat itu dimatikan dan dilempar ke Riwayat dengan status Defisit. Pengguna kembali ke tahap **Inisiasi**.
