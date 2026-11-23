// Voortgang van het project, te volgen op /voortgang.
// Status per stap: 'klaar', 'bezig', 'akkoord' (wacht op akkoord) of 'volgt'.
// Pas hier de status aan en zet de kijkversie opnieuw online met ./deploy.sh.
export const BIJGEWERKT = '23 november 2026';

export const FASES = [
  {
    naam: 'Website',
    stappen: [
      { naam: 'Homepage', status: 'bezig' },
      { naam: "Overige pagina's", sub: 'Projecten, Showroom, Over Fuente en Contact', status: 'volgt' },
      { naam: 'Afspraakplanner en vindbaarheid', status: 'volgt' },
      { naam: 'Website live', status: 'volgt' },
    ],
    mijlpaal: 'Na afronding van fase 1 factureren wij 25% van het totaalbedrag.',
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
