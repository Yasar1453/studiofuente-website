// Voortgang van het project, te volgen op /voortgang.
// Status per stap: 'klaar', 'bezig', 'akkoord' (wacht op akkoord) of 'volgt'.
// Is een stap akkoord, zet er dan bij wie en wanneer: akkoord: { door: 'Mert Kaynak', datum: '24 nov' }.
// Pas hier de status aan en zet de kijkversie opnieuw online met ./deploy.sh.
export const BIJGEWERKT = '23 november 2026';

const TOTAAL = 6500;                                   // afgesproken bedrag, exclusief btw
const euro = n => '€ ' + n.toLocaleString('nl-NL');
export const AFSPRAKEN = [
  { kop: euro(TOTAAL) + ' excl. btw', tekst: 'Afgesproken totaalbedrag voor website en showroomportaal.' },
  { kop: '25% na fase 1', tekst: euro(TOTAAL * .25) + ' excl. btw zodra de website af is.' },
  { kop: '75% bij oplevering', tekst: euro(TOTAAL * .75) + ' excl. btw na afronding van fase 2.' },
  { kop: 'Akkoord per stap', tekst: 'Wij gaan pas door naar de volgende stap na jullie akkoord.' },
  { kop: 'Fouten en extra werk', tekst: 'Fouten van onze kant lossen wij kosteloos op. Extra werk kost € 75 per uur excl. btw.' },
  { kop: 'Hosting en domein', tekst: 'Twee jaar inbegrepen, daarna € 15 per maand excl. btw.' },
];
export const PDF = '/assets/afspraken-studio-fuente.pdf';

export const FASES = [
  {
    naam: 'Website',
    stappen: [
      { naam: 'Homepage', sub: 'Drie versies om te vergelijken: A, B en C. Kies met de balk rechts op de homepage.', status: 'bezig' },
      { naam: "Overige pagina's", sub: 'Projecten, Showroom, Over Fuente en Contact', status: 'volgt' },
      { naam: 'Afspraakplanner en vindbaarheid', status: 'volgt' },
      { naam: 'Website live', status: 'volgt' },
    ],
    mijlpaal: 'Na afronding van fase 1 factureren wij 25% van het totaalbedrag: ' + euro(TOTAAL * .25) + ' excl. btw.',
  },
  {
    naam: 'Showroomportaal',
    stappen: [
      { naam: 'iPad-weergave en productcatalogus', status: 'volgt' },
      { naam: 'Keuzelijst en offertes versturen', status: 'volgt' },
      { naam: 'Dashboard voor producten en bestellingen', status: 'volgt' },
      { naam: 'Testen in de showroom en oplevering', status: 'volgt' },
    ],
  },
];
