const form = document.getElementById('gadai-form');
const hasilSection = document.getElementById('hasil');
let hasilTampil = false;

// Fungsi format Rupiah
function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

// Fungsi format tanggal
function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value + 'T00:00:00');
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Hitung admin berdasarkan kategori
function getAdminFee(kategori, pinjaman) {
  switch (kategori) {

    case 'hp':
      if (pinjaman <= 1000000) return 10000;

      return Math.ceil(pinjaman / 1000000) * 10000;

    case 'laptop':
      return pinjaman < 500000
        ? 10000
        : Math.ceil((pinjaman * 0.02) / 1000) * 1000;

    case 'proyektor':
      return pinjaman < 500000
        ? 10000
        : Math.ceil((pinjaman * 0.03) / 1000) * 1000;

    case 'tv-kecil':
      return 25000;

    case 'tv-besar':
      return Math.ceil((pinjaman * 0.05) / 1000) * 1000;
    
    case 'kendaraan':
      return Math.ceil((pinjaman * 0.05) / 1000) * 1000;

    default:
      return 10000;
  }
}

// Nama kategori
function getNamaKategori(kategori) {
  const names = {
    hp: 'HP, Laptop, Iphone, LM',
    laptop: 'Laptop Gaming, iPad, Macbook, Tablet',
    proyektor: 'Kamera, Proyektor, Video Game, Smart Watch',
    'tv-kecil': 'LED TV < 550rb',
    'tv-besar': 'LED TV > 550rb',
    kendaraan: 'KENDARAAN MOTOR & MOBIL', 
  };
  return names[kategori] || kategori;
}

// Hitung gadai
function calculateGadai(event) {
  event.preventDefault();

  const kategori = document.querySelector('input[name="kategori"]:checked').value;
  const tanggal = document.getElementById('tanggal').value;

  const pinjaman = Number(
    document.getElementById("pinjaman").value.replace(/\./g, "") || 0
  );


  if (!tanggal || pinjaman < 100000) {
    alert('Mohon isi semua field dengan benar');
    return;
  }

  // Perhitungan biaya
  let tarif = pinjaman * 0.10;

  // Bulatkan ke atas ke kelipatan Rp1.000
  tarif = Math.ceil(tarif / 1000) * 1000;
  const admin = getAdminFee(kategori, pinjaman);
  const asuransi = 10000;
  const totalPotongan = tarif + admin + asuransi;

  // Jumlah yang diterima
  const uangTerima = pinjaman - totalPotongan;

  // Tanggal jatuh tempo
  const transaksiDate = new Date(tanggal + 'T00:00:00');
  const jatuhTempo = new Date(transaksiDate);
  jatuhTempo.setDate(jatuhTempo.getDate() + 31);

  // Skenario pembayaran
  const diskonTebusCepat = Math.ceil((pinjaman - (tarif * 0.5)) / 1000) * 1000;

  // Admin perpanjangan
  const adminPerpanjang =
    pinjaman < 500000
      ? 5000
      : Math.ceil((pinjaman * 0.01) / 1000) * 1000;

  // Perpanjangan
  const perpanjangNormal = Math.ceil(
    (pinjaman * 0.10 + adminPerpanjang) / 1000
  ) * 1000;

  const perpanjangLewat = Math.ceil(
    (pinjaman * 0.15 + adminPerpanjang) / 1000
  ) * 1000;

  const tebuLewat = Math.ceil(
    (pinjaman + pinjaman * 0.05 + tarif * 0.5) / 1000
  ) * 1000;

  const nominalPengganti = Math.ceil(
    (pinjaman + pinjaman * 0.1) / 1000
  ) * 1000;

  // Update tampilan
  document.getElementById('nominal-pinjaman').textContent = formatRupiah(pinjaman);
  document.getElementById('kategori-display').textContent = getNamaKategori(kategori);
  document.getElementById('tgl-transaksi').textContent = formatDate(tanggal);
  document.getElementById('tgl-jatuh-tempo').textContent = formatDate(
    jatuhTempo.toISOString().split('T')[0]
  );

  document.getElementById('biaya-tarif').textContent = formatRupiah(tarif);
  document.getElementById('biaya-admin').textContent = formatRupiah(admin);
  document.getElementById('biaya-asuransi').textContent = formatRupiah(asuransi);
  document.getElementById('total-potongan').textContent = formatRupiah(totalPotongan);
  document.getElementById('uang-terima').textContent = formatRupiah(uangTerima);

  // Generate scenario cards — dibuat lebih mudah dibaca saat CS menjelaskan ke nasabah
  const scenarioHTML = `
    <div class="scenario-card diskon">
      <div class="recommended">Pilihan Menguntungkan</div>
      <div class="scenario-left">
        <h4>Tebus Cepat</h4>
        <p>Tebus Maksimal 3 hari dari Tanggal Transaksi dengan Diskon 50% Tarif Sewa.</p>
        <div class="scenario-date">Batas: ${formatDate(new Date(transaksiDate.getTime() + 4 * 86400000).toISOString().split('T')[0])}</div>
      </div>
      <div class="scenario-right">
        <span class="label">Total Tebus cepat</span>
        <div class="nominal">${formatRupiah(diskonTebusCepat)}</div>
      </div>
    </div>

    <div class="scenario-card perpanjang">
      <div class="scenario-left">
        <h4>Perpanjangan Normal</h4>
        <p>Perpanjang masa pinjaman sampai 30 hari.</p>
      </div>
      <div class="scenario-right">
        <span class="label">Biaya Perpanjangan</span>
        <div class="nominal">${formatRupiah(perpanjangNormal)}</div>
      </div>
    </div>

    <div class="scenario-card lewat">
      <div class="scenario-left">
        <h4>Perpanjang Setelah Jatuh Tempo</h4>
        <p>Perpanjangan 1–15 hari setelah jatuh tempo dengan denda flat 5%.</p>
        <div class="scenario-date">Batas: ${formatDate(new Date(transaksiDate.getTime() + 46 * 86400000).toISOString().split('T')[0])}</div>
      </div>
      <div class="scenario-right">
        <span class="label">Biaya Perpanjangan</span>
        <div class="nominal">${formatRupiah(perpanjangLewat)}</div>
      </div>
    </div>

    <div class="scenario-card lewat">
      <div class="scenario-left">
        <h4>Tebus Setelah Jatuh Tempo</h4>
        <p>Pelunasan 2–15 hari setelah jatuh tempo dengan denda flat 5% + Denda dibulan berikutnya 5%.</p>
        <div class="scenario-date">Batas: ${formatDate(new Date(transaksiDate.getTime() + 46 * 86400000).toISOString().split('T')[0])}</div>
      </div>
      <div class="scenario-right">
        <span class="label">Total Tebus</span>
        <div class="nominal">${formatRupiah(tebuLewat)}</div>
      </div>
    </div>

    <div class="scenario-card pengganti">
      <div class="scenario-left">
        <h4>Nilai Asuransi</h4>
        <p>Nominal Asuransi sebesar pinjaman + 10%.</p>
      </div>  
      <div class="scenario-right">
        <span class="label">Nominal Asuransi</span>
        <div class="nominal">${formatRupiah(nominalPengganti)}</div>
      </div>
    </div>
  `;

  document.getElementById('scenario-cards').innerHTML = scenarioHTML;
  hasilSection.style.display = 'block';
  hasilTampil = true;

  // Scroll ke hasil
  setTimeout(() => {
    hasilSection.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

// Event listeners
form.addEventListener('submit', calculateGadai);

// Format input pinjaman saat diketik
const pinjamanInput = document.getElementById("pinjaman");

pinjamanInput.addEventListener("input", function () {
  let angka = this.value.replace(/\D/g, "");

  this.value = angka.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
});

// Tab navigation (semua halaman dalam satu file)
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;

    document.querySelectorAll('.tab-btn').forEach((b) => {
      b.classList.toggle('active', b === btn);
    });

    document.querySelectorAll('.tab-content').forEach((c) => {
      c.style.display = c.id === tabName ? '' : 'none';
    });

    // Hasil hitungan hanya tampil di tab Hitungan
    hasilSection.style.display =
      tabName === 'hitungan' && hasilTampil ? 'block' : 'none';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// Update input text saat number berubah
document.getElementById('pinjaman').addEventListener('change', (e) => {
  const value = e.target.value;
  const pinjamanText = document.getElementById('pinjaman-text');
  if (pinjamanText) {
    pinjamanText.value = value ? formatRupiah(Number(value)).replace('Rp', '').trim() : '';
  }
});

function updateTanggal() {
  const now = new Date();

  const today =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");

  document.getElementById("tanggal").value = today;
}

updateTanggal();

function jadwalkanUpdateTengahMalam() {
  const now = new Date();

  const besok = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 1 // jam 00:00:01
  );

  const delay = besok - now;

  setTimeout(() => {
    updateTanggal();
    jadwalkanUpdateTengahMalam();
  }, delay);
}

jadwalkanUpdateTengahMalam();


// const tbody = document.getElementById("tabel-pinjaman");

// for (let pinjaman = 500000; pinjaman <= 10000000; pinjaman += 100000) {
//   const tarif = pinjaman * 0.10;

//   let admin;
//   if (pinjaman <= 1000000) {
//     admin = 10000;
//   } else {
//     admin = Math.ceil(pinjaman / 1000000) * 10000;
//   }

//   const asuransi = 10000;
//   const bersih = pinjaman - tarif - admin - asuransi;

//   tbody.innerHTML += `
//     <tr>
//       <td>${formatRupiah(pinjaman)}</td>
//       <td>${formatRupiah(bersih)}</td>
//     </tr>
//   `;
// }

const tbody = document.getElementById("tabel-pinjaman");

if (tbody) {
  for (let pinjaman = 500000; pinjaman <= 10000000; pinjaman += 100000) {

    const tarif = pinjaman * 0.10;

    let admin;

    if (pinjaman <= 1000000) {
      admin = 10000;
    } else {
      admin = Math.ceil(pinjaman / 1000000) * 10000;
    }

    const asuransi = 10000;
    const bersih = pinjaman - tarif - admin - asuransi;

    tbody.innerHTML += `
      <tr>
        <td>${formatRupiah(pinjaman)}</td>
        <td>${formatRupiah(bersih)}</td>
      </tr>
    `;
  }
}

function salinWhatsApp() {
    const pesan = `*RAJA GADAI*

*📋 Halo Kak 👋
Berikut kami sampaikan simulasi gadai sesuai nominal pinjaman yang Kakak butuhkan:*

Nilai Pinjaman:
Rp ${document.getElementById('pinjaman').value}
Uang yang Diterima:
${document.getElementById('uang-terima').textContent}

Tanggal Transaksi:
${document.getElementById('tgl-transaksi').textContent}
Jatuh Tempo:
${document.getElementById('tgl-jatuh-tempo').textContent}

*Pilihan Pembayaran:*

⚡ *Tebus Cepat 0-3 Hari*
${document.querySelector('.scenario-card.diskon .nominal').textContent}

📅 *Perpanjangan + Cicil*
(Bisa cicil pokok pinjaman mulai Rp50.000)
${document.querySelector('.scenario-card.perpanjang .nominal').textContent}

⚠️ *Perpanjangan Lewat Jatuh Tempo + Cicil*
(Bisa cicil pokok pinjaman mulai Rp50.000)
${document.querySelector('.scenario-card.lewat .nominal').textContent} 

⚠️ *Pelunasan Lewat Jatuh Tempo*
${document.querySelector('.scenario-card.pengganti .nominal').textContent} 

Informasi di atas merupakan simulasi agar Kakak lebih mudah memahami perhitungan gadai di Raja Gadai.

Terima kasih telah mempercayakan kebutuhan gadai Anda kepada Raja Gadai. 👑
Kami siap membantu memberikan pelayanan yang mudah, aman, dan nyaman. 🙏

RAJA GADAI
Solusi kebutuhan dana Anda ✨.`;

      navigator.clipboard.writeText(pesan)  
        .then(() => {
            showToast("✓ Informasi berhasil disalin", "Silakan paste ke WhatsApp");
        })
        .catch(() => {
            showToast("✕ Gagal menyalin informasi", "Silakan coba lagi", "error");
        });
}

function showToast(title, message, type = "success") {
    const toast = document.createElement("div");

    toast.className = `copy-toast ${type}`;

    toast.innerHTML = `
        <div class="toast-icon">
            ${type === "success" ? "✓" : "!"}
        </div>

        <div class="toast-content">
            <strong>${title}</strong>
            <span>${message}</span>
        </div>
    `;

    // WAJIB langsung ke body
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    setTimeout(() => {
        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }, 2500);
}

// =========================================
// DARK MODE
// =========================================

// const themeToggle = document.getElementById("themeToggle");
// const themeIcon = document.getElementById("themeIcon");

// // Ambil tema terakhir
// const savedTheme = localStorage.getItem("rg-theme");

// if (savedTheme === "dark") {
//   document.body.classList.add("dark-mode");
//   themeIcon.textContent = "☀️";
// } else {
//   themeIcon.textContent = "🌙";
// }

// // Tombol ganti tema
// themeToggle.addEventListener("click", function () {

//   document.body.classList.toggle("dark-mode");

//   const isDark = document.body.classList.contains("dark-mode");

//   if (isDark) {
//     themeIcon.textContent = "☀️";
//     localStorage.setItem("rg-theme", "dark");
//   } else {
//     themeIcon.textContent = "🌙";
//     localStorage.setItem("rg-theme", "light");
//   }

// });

// =========================================
// DARK MODE
// =========================================

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

const moonIcon = `
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

const sunIcon = `
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8"/>
    <path d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;

function updateThemeIcon(isDark) {
  if (!themeIcon) return;
  themeIcon.innerHTML = isDark ? sunIcon : moonIcon;
}

if (themeToggle && themeIcon) {
  const savedTheme = localStorage.getItem("rg-theme");
  const isDark = savedTheme === "dark";

  document.body.classList.toggle("dark-mode", isDark);
  updateThemeIcon(isDark);

  themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
    const darkModeActive = document.body.classList.contains("dark-mode");

    updateThemeIcon(darkModeActive);
    localStorage.setItem("rg-theme", darkModeActive ? "dark" : "light");
  });
}
