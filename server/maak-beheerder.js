// Maakt een beheerder aan of zet een bestaand account om naar beheerder.
// Gebruik: npm run beheerder -- naam@studiofuente.nl "sterk-wachtwoord"
import { one, run } from './db.js';
import { hashPassword, validEmail } from './lib.js';
const [email, pw] = process.argv.slice(2);
if (!validEmail(email) || !pw || pw.length < 10) { console.error('Gebruik: npm run beheerder -- e-mail "wachtwoord (min. 10 tekens)"'); process.exit(1); }
const u = one('SELECT id FROM users WHERE email = ?', email.toLowerCase());
if (u) run(`UPDATE users SET role = 'beheerder', password_hash = ? WHERE id = ?`, await hashPassword(pw), u.id);
else run(`INSERT INTO users (email, password_hash, role, first_name) VALUES (?, ?, 'beheerder', 'Studio Fuente')`, email.toLowerCase(), await hashPassword(pw));
console.log(`Beheerder ${email} is klaar. Log in via /account/inloggen.`);
