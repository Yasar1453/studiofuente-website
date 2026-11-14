// Afspraken plannen: met wie, hoelang, welke dag en welk tijdstip.
// Openingstijden en duur zijn aannames tot Studio Fuente ze bevestigt. Pas ze hier aan.
import { all } from './db.js';

export const STAFF = [
  { id: 'fatih', name: 'Fatih Kaynak' },
  { id: 'mert', name: 'Mert Kaynak' },
];
export const DURATIONS = [
  { min: 30, label: '30 minuten', hint: 'Kort advies of één vraag' },
  { min: 60, label: '1 uur', hint: 'Materialen kiezen voor één ruimte' },
  { min: 90, label: '1,5 uur', hint: 'Complete woning of verbouwing' },
];
const OPEN = 10 * 60, CLOSE = 17 * 60, STEP = 30;   // 10:00 tot 17:00, elk half uur
const CLOSED_DAYS = [0];                              // zondag
const DAYS_AHEAD = 28;

const pad = n => String(n).padStart(2, '0');
const hhmm = m => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
const mins = t => { const m = /^(\d{2}):(\d{2})$/.exec(t || ''); return m ? +m[1] * 60 + +m[2] : NaN; };
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
// Vandaag volgens de klok in Nederland, ook als de server ergens anders staat.
const vandaag = () => { const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam' }).format(new Date()).split('-').map(Number); return new Date(y, m - 1, d); };

export const staffById = id => STAFF.find(s => s.id === id);
export const durationByMin = m => DURATIONS.find(d => d.min === +m);

// De dagen waarop je een afspraak kunt kiezen: vanaf morgen, vier weken vooruit.
export function days() {
  const out = [], start = vandaag();
  for (let i = 1; i <= DAYS_AHEAD; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    if (CLOSED_DAYS.includes(d.getDay())) continue;
    out.push({
      date: iso(d),
      weekday: d.toLocaleDateString('nl-NL', { weekday: 'short' }).replace('.', ''),
      day: d.getDate(),
      month: d.toLocaleDateString('nl-NL', { month: 'short' }).replace('.', ''),
    });
  }
  return out;
}
export const validDay = date => days().some(d => d.date === date);
export const dateLong = date => { const [y, m, d] = date.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' }); };

// Alle starttijden van een dag voor één persoon, met of ze nog vrij zijn.
export function slots(staff, duration, date) {
  if (!staffById(staff) || !durationByMin(duration) || !validDay(date)) return [];
  const busy = all(`SELECT time, duration FROM appointments WHERE staff = ? AND date = ? AND status != 'geannuleerd' AND time IS NOT NULL`, staff, date)
    .map(a => [mins(a.time), mins(a.time) + (a.duration || 30)]);
  const out = [];
  for (let t = OPEN; t + +duration <= CLOSE; t += STEP) {
    out.push({ time: hhmm(t), free: !busy.some(([a, b]) => t < b && t + +duration > a) });
  }
  return out;
}
export const slotFree = (staff, duration, date, time) => slots(staff, duration, date).some(s => s.time === time && s.free);
