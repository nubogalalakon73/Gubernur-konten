// Rule-based chatbot for "AI Assistant Gubernur Konten".
// Scripted intent matching + quick-reply flows. No external LLM.

import { WA_LINK } from "@/lib/api";

const GREETING_TEXT =
  "Selamat datang di ruang analisis politik digital Indonesia.\n\nApakah Anda ingin membaca Bab 1 gratis atau melihat isi lengkap buku?";

export const INITIAL_QUICK_REPLIES = [
  { id: "qr-bab1", label: "📖 Baca Bab 1 Gratis", intent: "bab1" },
  { id: "qr-isi", label: "💬 Tanya Isi Buku", intent: "tentang" },
  { id: "qr-harga", label: "💳 Lihat Harga", intent: "harga" },
  { id: "qr-paid", label: "✅ Sudah Bayar, Cari Link", intent: "paid-no-link" },
  { id: "qr-wa", label: "📲 Konsultasi WhatsApp", intent: "wa" },
];

export const greeting = () => ({
  text: GREETING_TEXT,
  quickReplies: INITIAL_QUICK_REPLIES,
});

const CHAPTER_LIST = [
  "BAB 1 — Ketika Algoritma Menjadi Alun-Alun",
  "BAB 2 — Dedi Mulyadi dan Kelahiran Genre",
  "BAB 3 — Empat Gubernur, Empat Strategi",
  "BAB 4 — Tujuh Dakwaan terhadap Gubernur Konten",
  "BAB 5 — Pembelaan dan Epistemologi Politik Lokal",
  "BAB 6 — AI, Deepfake, dan Masa Depan Demokrasi",
  "BAB 7 — Setelah Panggung Ditutup",
];

// Intent matching
function detectIntent(textRaw) {
  const t = (textRaw || "").toLowerCase();
  if (!t.trim()) return "fallback";
  if (/(bab 1|bab1|preview|gratis|free|sample|baca dulu)/.test(t)) return "bab1";
  if (/(harga|biaya|beli|traktir|berapa|tarif|paket|price|murah)/.test(t)) return "harga";
  if (/(rekomendasi|saran|cocok|profesi|mahasiswa|dosen|akademisi|politisi|asn|aktivis|jurnalis|konsultan|kreator)/.test(t))
    return "rekomendasi";
  if (/(isi|tentang|apa itu|gubernur konten|konsep|sinopsis|isi buku|materi|bab)/.test(t)) return "tentang";
  if (/(whatsapp|admin|wa|manusia|customer|cs|hubungi|kontak)/.test(t)) return "wa";
  if (/(bayar|transfer|qris|bca|mandiri|dana|gopay|ovo)/.test(t)) return "bayar";
  if (/(terima kasih|makasih|thx|thanks|oke|ok)/.test(t)) return "terimakasih";
  if (/(halo|hai|hi|hello|assalamualaikum|pagi|siang|sore|malam)/.test(t)) return "salam";
  if (
    /(sudah bayar|telah bayar|udah bayar|bayar sukses|bayar berhasil|pembayaran berhasil|sudah transfer)/.test(t) &&
    /(link|download|donlot|unduh|file|pdf|epub|email)/.test(t)
  ) return "paid-no-link";
  if (/(mana link|link mana|mana donlot|dimana link|link.*tidak ada|link.*belum ada)/.test(t)) return "paid-no-link";
  if (/(gagal.*(download|unduh|donlot)|tidak.*(bisa|dapat).*(download|unduh|file|pdf|epub)|link.*(mati|error|rusak|tidak.*kerja)|email.*tidak.*(terima|datang|masuk)|belum.*terima.*file|tidak.*dapat.*file|download.*error|resend|kirim.ulang)/.test(t)) return "download-error";
  return "fallback";
}

// Quick reply sets
const QR_BACK = { id: "back", label: "↩ Kembali ke menu", intent: "menu" };

const QR_HARGA = [
  { id: "h-free", label: "🆓 Free · Baca Bab 1", intent: "select-free" },
  { id: "h-perbab", label: "📑 Per Bab · Rp 10.000", intent: "select-perbab" },
  { id: "h-full", label: "🔥 Full Buku · Rp 55.000", intent: "select-full" },
  QR_BACK,
];

const QR_PAYMENT = [
  { id: "p-transfer", label: "🏦 Transfer Bank", intent: "pay-transfer" },
  { id: "p-qris", label: "📱 QRIS", intent: "pay-qris" },
  { id: "p-wa", label: "💬 WhatsApp Admin", intent: "wa" },
  QR_BACK,
];

const QR_PROFESI = [
  { id: "pr-akademisi", label: "Akademisi / Dosen", intent: "rec-akademisi" },
  { id: "pr-mahasiswa", label: "Mahasiswa", intent: "rec-mahasiswa" },
  { id: "pr-politisi", label: "Politisi / Konsultan", intent: "rec-politisi" },
  { id: "pr-kreator", label: "Kreator / Jurnalis", intent: "rec-kreator" },
  QR_BACK,
];

const PURCHASE_FLOW_TEXT = `Terima kasih sudah tertarik mentraktir kami ☕\n\n*Gubernur Konten: Siapa Dalang, Siapa Wayang?*\n\nSilakan pilih paket Anda:\n1️⃣ Bab 1 GRATIS (tanpa form)\n2️⃣ Per Bab Rp 10.000\n3️⃣ Full Buku Rp 55.000\n\nSetelah pembayaran dikonfirmasi, akses langsung dikirim otomatis via WhatsApp.`;

// Build response per intent (action returns: { text, quickReplies, action })
export function respond(intent, ctx = {}) {
  switch (intent) {
    case "salam":
      return {
        text: "Halo 👋 Saya AI Asisten Gubernur Konten. Saya bisa bantu Anda baca Bab 1 gratis, jelaskan isi buku, atau bahas paket traktir. Pilih salah satu di bawah ya.",
        quickReplies: INITIAL_QUICK_REPLIES,
      };

    case "menu":
      return { text: "Apa yang ingin Anda eksplor selanjutnya?", quickReplies: INITIAL_QUICK_REPLIES };

    case "bab1":
      return {
        text: "Bab 1 — \"Ketika Algoritma Menjadi Alun-Alun\" — bisa Anda baca penuh, gratis, langsung di HP atau desktop. Estimasi 14 menit baca, tanpa unduh PDF.",
        quickReplies: [
          { id: "open-bab1", label: "🚀 Buka Bab 1 Sekarang", intent: "open-bab1" },
          { id: "go-harga", label: "💳 Lihat Harga Full Book", intent: "harga" },
          QR_BACK,
        ],
        action: { type: "navigate-bab1" },
      };

    case "open-bab1":
      return {
        text: "Membuka halaman Bab 1 dalam mode baca premium…",
        quickReplies: INITIAL_QUICK_REPLIES,
        action: { type: "navigate-bab1" },
      };

    case "tentang":
      return {
        text:
          "*Gubernur Konten* adalah dekonstruksi populisme digital dan otoritas neo-tradisional dalam politik lokal Indonesia.\n\nDitulis dalam kerangka *dakwaan–pembelaan–sintesis*, buku ini membedah bagaimana algoritma menjadi panggung kekuasaan baru.\n\nIsi 7 bab:\n" +
          CHAPTER_LIST.map((c, i) => `${i === 0 ? "🔓" : "🔒"} ${c}`).join("\n"),
        quickReplies: [
          { id: "rec", label: "🎯 Rekomendasi bab untuk saya", intent: "rekomendasi" },
          { id: "qr-bab1", label: "📖 Baca Bab 1 Gratis", intent: "bab1" },
          { id: "qr-harga", label: "💳 Lihat Harga", intent: "harga" },
          QR_BACK,
        ],
      };

    case "harga":
      return {
        text:
          "Tiga jalur akses, sesuai kedalaman yang Anda cari:\n\n🆓 *Bab 1 GRATIS* — baca online, mobile-friendly\n📑 *Per Bab* — Rp 10.000 / bab (Bab 2–7)\n🔥 *Full Buku* — Rp 55.000 (PDF + EPUB + Flipbook + AI Assistant access). PALING DIMINATI.",
        quickReplies: QR_HARGA,
      };

    case "select-free":
      return {
        text: "Bab 1 gratis dibuka tanpa pembayaran. Saya arahkan ke mode baca sekarang.",
        quickReplies: INITIAL_QUICK_REPLIES,
        action: { type: "navigate-bab1" },
      };

    case "select-perbab":
      return {
        text:
          "Paket Per Bab — Rp 10.000 per bab. Pilih bab yang ingin dibongkar:\n• Bab 2 · Dedi Mulyadi dan Kelahiran Genre\n• Bab 3 · Empat Gubernur, Empat Strategi\n• Bab 4 · Tujuh Dakwaan terhadap Gubernur Konten 🔥\n• Bab 5 · Pembelaan dan Epistemologi Politik Lokal\n• Bab 6 · AI, Deepfake dan Masa Depan Demokrasi\n• Bab 7 · Setelah Panggung Ditutup\n\nKlik tombol di bawah untuk lanjut ke halaman traktir.",
        quickReplies: [
          { id: "go-checkout-perbab", label: "☕ Lanjut Checkout", intent: "go-checkout-perbab" },
          { id: "go-wa", label: "💬 Tanya Admin", intent: "wa" },
          QR_BACK,
        ],
      };

    case "select-full":
      return {
        text: PURCHASE_FLOW_TEXT + "\n\nAnda memilih *Full Buku Rp 55.000*. Klik tombol di bawah untuk lanjut ke pembayaran.",
        quickReplies: [
          { id: "go-checkout-full", label: "☕ Lanjut Checkout", intent: "go-checkout-full" },
          { id: "go-wa", label: "💬 Tanya Admin", intent: "wa" },
          QR_BACK,
        ],
      };

    case "go-checkout-perbab":
      return {
        text: "Membuka halaman checkout untuk pilih bab…",
        quickReplies: INITIAL_QUICK_REPLIES,
        action: { type: "navigate-checkout", paket: "bab-4" },
      };

    case "go-checkout-full":
      return {
        text: "Membuka halaman checkout Full Buku Rp 55.000…",
        quickReplies: INITIAL_QUICK_REPLIES,
        action: { type: "navigate-checkout", paket: "full" },
      };

    case "pay-transfer":
      return {
        text:
          "🏦 *Transfer Bank*\n\nBCA: 7772112141\na.n. DIDI SUBANDI\n\nSetelah transfer, kirim bukti ke WhatsApp Admin. Akses akan dikirim < 10 menit.",
        quickReplies: [
          { id: "confirm-wa", label: "📲 Kirim Bukti via WA", intent: "wa" },
          QR_BACK,
        ],
      };

    case "pay-qris":
      return {
        text:
          "📱 *QRIS*\n\nMinta QR kode dinamis ke Admin (jumlah otomatis). Tim kami akan mengirim QR Anda dalam 1 menit setelah kontak WA.",
        quickReplies: [
          { id: "qris-wa", label: "📲 Minta QR via WA", intent: "wa" },
          QR_BACK,
        ],
      };

    case "wa":
      return {
        text:
          "Membuka WhatsApp Admin sekarang… Jika tidak terbuka otomatis, nomor: 0899-855-3333.",
        quickReplies: INITIAL_QUICK_REPLIES,
        action: { type: "open-wa", url: WA_LINK("Halo Admin, saya ingin mentraktir ebook Gubernur Konten.") },
      };

    case "rekomendasi":
      return {
        text: "Boleh tahu Anda dari kalangan apa? Saya akan rekomendasikan urutan bab yang paling relevan.",
        quickReplies: QR_PROFESI,
      };

    case "rec-akademisi":
      return {
        text:
          "Untuk akademisi & dosen — saya rekomendasi urutan ini:\n1. Bab 1 (kerangka konseptual) — gratis\n2. Bab 5 (epistemologi politik lokal)\n3. Bab 4 (tujuh dakwaan) — paling sering dikutip\n4. Lanjut full untuk dapat 7 bab + revisi.",
        quickReplies: [{ id: "harga", label: "💳 Ambil Full Buku", intent: "select-full" }, QR_BACK],
      };

    case "rec-mahasiswa":
      return {
        text:
          "Untuk mahasiswa komunikasi/politik:\n1. Bab 1 (gratis dulu) — untuk pemahaman dasar\n2. Bab 2 (studi kasus genre)\n3. Bab 6 (AI & deepfake — relevan untuk tugas akhir).",
        quickReplies: [{ id: "harga", label: "💳 Lihat Harga", intent: "harga" }, QR_BACK],
      };

    case "rec-politisi":
      return {
        text:
          "Untuk politisi / konsultan:\n1. Bab 3 (empat strategi) — playbook komparatif\n2. Bab 4 (dakwaan) — anti-pattern yang harus dihindari\n3. Full Buku direkomendasikan.",
        quickReplies: [{ id: "harga", label: "🔥 Ambil Full Buku", intent: "select-full" }, QR_BACK],
      };

    case "rec-kreator":
      return {
        text:
          "Untuk kreator / jurnalis:\n1. Bab 1 (lensa konseptual)\n2. Bab 4 (dakwaan) — bahan investigasi\n3. Bab 6 (AI & deepfake) — penting untuk masa depan kerja Anda.",
        quickReplies: [{ id: "harga", label: "💳 Lihat Harga", intent: "harga" }, QR_BACK],
      };

    case "bayar":
      return {
        text: "Tentu! Pilih metode pembayaran:",
        quickReplies: QR_PAYMENT,
      };

        case "paid-no-link":
      return {
        text: "Saya bantu sekarang 🙏\n\nSiapkan:\n• Email yang dipakai saat checkout\n• Order ID (format: GK-XXXXXXXXXXXX) — ada di notifikasi Midtrans\n\nJuga cek folder *Spam / Promosi* di email dulu.",
        quickReplies: [],
        action: { type: "show-resend-form" },
      };

    case "download-error":
      return {
        text: "Maaf Anda mengalami kendala mengunduh 🙏\n\nAda dua cara yang bisa saya bantu:\n\n📧 *Kirim ulang ke Email* — masukkan email & Order ID, kami kirim link download langsung ke inbox Anda.\n\n💬 *Hubungi Admin WA* — tim kami kirimkan file secara manual dalam 5–10 menit.",
        quickReplies: [
          { id: "dl-email", label: "📧 Kirim Ulang ke Email Saya", intent: "resend-email-form" },
          { id: "dl-wa", label: "💬 Hubungi Admin WhatsApp", intent: "download-wa" },
          QR_BACK,
        ],
      };

    case "resend-email-form":
      return {
        text: "Baik, saya bantu kirim ulang link download ke email Anda.",
        quickReplies: [],
        action: { type: "show-resend-form" },
      };

    case "download-wa":
      return {
        text: "Membuka WhatsApp Admin… Sampaikan Order ID Anda agar admin bisa cek langsung.",
        quickReplies: INITIAL_QUICK_REPLIES,
        action: { type: "open-wa", url: WA_LINK("Halo Admin, saya gagal download file setelah bayar. Mohon bantuannya.") },
      };

    case "terimakasih":
      return {
        text: "Sama-sama 🙏 Saya selalu di sini. Pilih opsi berikut bila butuh lagi.",
        quickReplies: INITIAL_QUICK_REPLIES,
      };

    case "fallback":
    default:
      return {
        text:
          "Mohon maaf, saya belum menangkap maksud pertanyaan Anda. Mungkin saya bisa bantu dengan salah satu pilihan di bawah?",
        quickReplies: INITIAL_QUICK_REPLIES,
      };
  }
}

export function intentOf(text) {
  return detectIntent(text);
}
