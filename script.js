// ===== Navigasi slide =====
const slides = [...document.querySelectorAll('.slide')];
const bar = document.getElementById('bar');
const count = document.getElementById('count');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
let cur = 0;

function go(n) {
  cur = Math.max(0, Math.min(slides.length - 1, n));
  slides.forEach((s, i) => {
    s.classList.toggle('active', i === cur);
    s.classList.toggle('prev', i < cur);
    s.setAttribute('aria-hidden', i !== cur);
  });
  count.textContent = `${cur + 1} / ${slides.length}`;
  bar.style.width = ((cur + 1) / slides.length * 100) + '%';
  prevBtn.disabled = cur === 0;
  nextBtn.disabled = cur === slides.length - 1;
  history.replaceState(null, '', '#' + (cur + 1));
}

prevBtn.onclick = () => go(cur - 1);
nextBtn.onclick = () => go(cur + 1);
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'PageDown') go(cur + 1);
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(cur - 1);
});

let touchX = null;
document.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend', e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 60) go(cur + (dx < 0 ? 1 : -1));
  touchX = null;
});

// ===== Interaktif 1: mixer RGB =====
const hex2 = n => Number(n).toString(16).padStart(2, '0');
function mix() {
  const [r, g, b] = ['r', 'g', 'b'].map(id => document.getElementById(id).value);
  ['r', 'g', 'b'].forEach(id => { document.getElementById(id + 'v').textContent = document.getElementById(id).value; });
  const hex = `#${hex2(r)}${hex2(g)}${hex2(b)}`;
  const p = document.getElementById('mixPreview');
  p.style.background = hex;
  p.style.color = (0.299 * r + 0.587 * g + 0.114 * b) > 140 ? '#151a33' : '#fff';
  document.getElementById('mixHex').textContent = `${hex}  rgb(${r}, ${g}, ${b})`;
}
['r', 'g', 'b'].forEach(id => document.getElementById(id).addEventListener('input', mix));
mix();

// ===== Interaktif 2: pengecek kontras (rumus WCAG) =====
function lum(hex) {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contrast() {
  const fg = document.getElementById('fg').value;
  const bg = document.getElementById('bg').value;
  const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
  const ratio = (a + 0.05) / (b + 0.05);
  const pv = document.getElementById('conPreview');
  pv.style.color = fg;
  pv.style.background = bg;
  document.getElementById('ratio').textContent = ratio.toFixed(2) + ' : 1';
  const v = document.getElementById('verdict');
  const ok = ratio >= 4.5;
  v.textContent = ok ? 'Lulus AA' : 'Belum lulus AA';
  v.className = 'badge ' + (ok ? 'pass' : 'fail');
}
['fg', 'bg'].forEach(id => document.getElementById(id).addEventListener('input', contrast));
contrast();

// ===== Interaktif 3: kuis =====
const questions = [
  { q: 'Apa hasil campuran cahaya merah, hijau, dan biru penuh di layar?', o: ['Hitam', 'Putih', 'Abu-abu'], a: 1 },
  { q: 'Dua warna yang berseberangan di roda warna disebut skema…', o: ['Analogus', 'Komplementer', 'Triadik'], a: 1 },
  { q: 'Berapa rasio kontras minimal WCAG AA untuk teks biasa?', o: ['2 : 1', '3 : 1', '4,5 : 1'], a: 2 },
  { q: 'Pada aturan 60-30-10, angka 10 untuk…', o: ['Warna aksen', 'Warna latar', 'Warna teks'], a: 0 }
];
const quiz = document.getElementById('quiz');
let qi = 0, score = 0;

function showQ() {
  const item = questions[qi];
  quiz.innerHTML = `<p><b>Soal ${qi + 1} dari ${questions.length}.</b> ${item.q}</p>`;
  item.o.forEach((text, i) => {
    const b = document.createElement('button');
    b.className = 'opt';
    b.textContent = text;
    b.onclick = () => answer(i);
    quiz.appendChild(b);
  });
}
function answer(i) {
  const item = questions[qi];
  const btns = quiz.querySelectorAll('.opt');
  btns.forEach((b, k) => {
    b.disabled = true;
    if (k === item.a) b.classList.add('ok');
    else if (k === i) b.classList.add('no');
  });
  if (i === item.a) score++;
  const n = document.createElement('button');
  n.className = 'next';
  n.textContent = qi < questions.length - 1 ? 'Soal berikutnya' : 'Lihat skor';
  n.onclick = () => { qi++; qi < questions.length ? showQ() : finish(); };
  quiz.appendChild(n);
}
function finish() {
  quiz.innerHTML = `<p><b>Skor kamu: ${score} dari ${questions.length}.</b></p>`;
  const r = document.createElement('button');
  r.className = 'next';
  r.textContent = 'Ulangi kuis';
  r.onclick = () => { qi = 0; score = 0; showQ(); };
  quiz.appendChild(r);
}
showQ();

// Mulai dari slide di hash URL (mis. index.html#5)
go((parseInt(location.hash.slice(1)) || 1) - 1);
