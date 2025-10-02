// script.js
// Class DigitalClock - implementasi PBO sederhana
class DigitalClock {
  constructor({elementTimeId, elementDateId, format24 = true} = {}) {
    this.timeEl = document.getElementById(elementTimeId);
    this.dateEl = document.getElementById(elementDateId);
    this.format24 = format24;
    this._timer = null;
    this.alarm = null; // string "HH:MM" jika ter-set
    this.alarmTriggeredToday = false;
  }

  start() {
    if (this._timer) return;
    this._tick(); // langsung tampil
    this._timer = setInterval(() => this._tick(), 1000);
  }

  stop() {
    if (!this._timer) return;
    clearInterval(this._timer);
    this._timer = null;
  }

  toggleFormat() {
    this.format24 = !this.format24; 
    this._tick();
  }

  setAlarm(hhmm) {
    // validasi sederhana: harus "HH:MM"
    if (!/^\d{1,2}:\d{2}$/.test(hhmm)) return false;
    const [h, m] = hhmm.split(':').map(Number);
    if (h < 0 || h > 23 || m < 0 || m > 59) return false;
    this.alarm = (h < 10 ? '0' + h : '' + h) + ':' + (m < 10 ? '0' + m : '' + m);
    this.alarmTriggeredToday = false;
    return true;
  }

  clearAlarm() {
    this.alarm = null;
    this.alarmTriggeredToday = false;
  }

  _tick() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // format waktu
    let displayHours = hours;
    let ampm = '';
    if (!this.format24) {
      ampm = hours >= 12 ? ' PM' : ' AM';
      displayHours = hours % 12;
      if (displayHours === 0) displayHours = 12;
    }
    const hh = (displayHours < 10 ? '0' + displayHours : '' + displayHours);
    const mm = (minutes < 10 ? '0' + minutes : '' + minutes);
    const ss = (seconds < 10 ? '0' + seconds : '' + seconds);

    if (this.timeEl) this.timeEl.textContent = `${hh}:${mm}:${ss}${ampm}`;

    // tanggal
    if (this.dateEl) {
      const dayNames = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
      const dayName = dayNames[now.getDay()];
      const dateStr = now.getDate().toString().padStart(2,'0');
      const month = (now.getMonth()+1).toString().padStart(2,'0');
      const year = now.getFullYear();
      this.dateEl.textContent = `${dayName}, ${dateStr}-${month}-${year}`;
    }

    // cek alarm (format alarm disimpan HH:MM)
    if (this.alarm) {
      const currentHHMM = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`;
      if (currentHHMM === this.alarm && !this.alarmTriggeredToday) {
        this._triggerAlarm();
        this.alarmTriggeredToday = true;
      }
      // reset flag setelah pergantian hari
      if (hours === 0 && minutes === 0 && seconds === 1) {
        this.alarmTriggeredToday = false;
      }
    }
  }

  _triggerAlarm() {
    // efek sederhana: alert + audio beep via Web Audio API
    alert(`Alarm! Waktu: ${this.alarm}`);
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.value = 0.05;
      o.start();
      setTimeout(()=>{ o.stop(); ctx.close(); }, 800);
    } catch (e) {
      console.warn('Audio alarm gagal dimainkan:', e);
    }
  }
}

// Inisialisasi
const clock = new DigitalClock({ elementTimeId: 'time', elementDateId: 'date', format24: true });
clock.start();

// Hook tombol UI
document.getElementById('toggleFormatBtn').addEventListener('click', () => {
  clock.toggleFormat();
});
document.getElementById('stopBtn').addEventListener('click', () => {
  clock.stop();
});
document.getElementById('startBtn').addEventListener('click', () => {
  clock.start();
});

// Alarm
const alarmStatusEl = document.getElementById('alarmStatus');
document.getElementById('setAlarmBtn').addEventListener('click', () => {
  const val = document.getElementById('alarmTime').value.trim();
  const ok = clock.setAlarm(val);
  if (ok) {
    alarmStatusEl.textContent = `Alarm diset: ${clock.alarm}`;
  } else {
    alarmStatusEl.style.color = 'red';
    alarmStatusEl.textContent = 'Format alarm salah. Gunakan HH:MM (24 jam).';
    setTimeout(()=>{ alarmStatusEl.style.color = 'green'; alarmStatusEl.textContent = ''; }, 3000);
  }
});
document.getElementById('clearAlarmBtn').addEventListener('click', () => {
  clock.clearAlarm();
  alarmStatusEl.textContent = 'Alarm dibersihkan.';
  setTimeout(()=>{ alarmStatusEl.textContent = ''; }, 2500);
});
