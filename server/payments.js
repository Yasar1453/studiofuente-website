// Betalingen via Mollie. Staat uit zolang MOLLIE_API_KEY niet in .env staat.
// Koppelen: 1) API-sleutel in .env, 2) createPayment() afmaken met https://api.mollie.com/v2/payments,
// 3) webhook-route /betaling/webhook toevoegen die de order op 'betaald' zet.
export const paymentsEnabled = () => Boolean(process.env.MOLLIE_API_KEY) && process.env.PAYMENTS === 'aan';

export async function createPayment(/* order */) {
  throw new Error('Mollie is nog niet gekoppeld.');
}
