// Journaal: kennisartikelen. Algemene vakkennis, geen productclaims.
// Een sectie heeft een kop (h), alinea's (p) en eventueel een opsomming (list).
const W = '/assets/web/', L = '/assets/web/lib/';

export const ARTICLES = [
  {
    slug: 'grootformaat-tegels',
    topic: 'Tegels',
    title: 'Grootformaat tegels: *rust in de ruimte*',
    intro: 'Een grote tegel geeft minder voegen en een rustiger beeld. Het vraagt wel meer van de ondergrond en van de tegelzetter. Dit zijn de punten waar je op let.',
    img: L + 'tegels-marmerwand.webp',
    service: 'tegels',
    summary: ['Minder voegen geeft een rustiger en ruimer beeld', 'De ondergrond moet vlakker zijn dan bij kleine tegels', 'Reken op meer snijverlies in kleine of hoekige ruimtes'],
    sections: [
      { h: 'Wat verstaan we onder grootformaat', p: [
        'Er is geen vaste grens, maar in de praktijk spreken we van grootformaat vanaf ongeveer 60 bij 120 centimeter. Daarboven vind je formaten als 120 bij 120 en platen van 120 bij 280 centimeter, die vaak maar zes millimeter dik zijn.',
        'Hoe groter de tegel, hoe minder voegen je ziet. Een vloer leest dan als één vlak in plaats van als een raster. Dat werkt vooral goed bij een marmerlook, omdat de adering kan doorlopen.' ] },
      { h: 'De ondergrond bepaalt het resultaat', p: [
        'Een grote tegel volgt geen oneffenheden. Waar een kleine tegel een lichte bolling opvangt, komt een grote tegel hol te liggen. De vloer wordt daarom vooraf gecontroleerd en zo nodig geëgaliseerd.',
        'Bij het leggen wordt de lijm zowel op de vloer als op de achterkant van de tegel aangebracht. Zo ligt de tegel volledig in de lijm en ontstaan er geen holle plekken. Een nivelleersysteem houdt de randen van de tegels onderling gelijk tot de lijm is uitgehard.' ] },
      { h: 'Past het in een kleine ruimte', p: [
        'Ja. Het idee dat een kleine badkamer om kleine tegels vraagt klopt niet. Juist weinig voegen maken een kleine ruimte rustiger. Het nadeel zit in het snijverlies: in een ruimte met veel hoeken, een nis of een inloopdouche met afschot houd je meer reststukken over.' ] },
      { h: 'Waar je op let bij de keuze', list: [
        'Gerectificeerde randen. De tegel is na het bakken op maat geslepen, waardoor een smalle voeg van ongeveer twee millimeter mogelijk is.',
        'De dikte. Dunne platen zijn lichter en geschikt voor wanden en meubels, maar vragen ervaring bij het verwerken.',
        'Het transport naar binnen. Een plaat van 280 centimeter moet door het trappenhuis of de lift kunnen.',
        'De adering. Vraag hoeveel verschillende afbeeldingen een serie heeft, zodat het patroon zich niet zichtbaar herhaalt.' ] },
      { h: 'Vloerverwarming', p: [
        'Keramiek geleidt warmte goed en combineert daarom prima met vloerverwarming. Belangrijk is dat de dekvloer droog genoeg is en dat de verwarming volgens een opstookprotocol is opgewarmd voordat er getegeld wordt.' ] },
    ],
  },
  {
    slug: 'pvc-dry-back-of-klik',
    topic: 'Vloeren',
    title: 'PVC vloer: *dry-back of klik*',
    intro: 'Beide vloeren zien er eenmaal gelegd hetzelfde uit. Het verschil zit in de opbouw, de ondergrond en wat er daarna nog mogelijk is.',
    img: L + 'pvc-wand.webp',
    service: 'pvc-vloeren',
    summary: ['Dry-back wordt verlijmd en is het dunst', 'Klik ligt los en is sneller gelegd', 'Bij vloerverwarming en visgraat is dry-back meestal de eerste keuze'],
    sections: [
      { h: 'Dry-back: verlijmd op de vloer', p: [
        'Een dry-back vloer bestaat uit stroken van ongeveer twee tot tweeënhalve millimeter dik. Ze worden volledig verlijmd op een vlakke, geëgaliseerde ondergrond. Elke oneffenheid tekent zich op termijn af in de vloer, dus egaliseren hoort er vrijwel altijd bij.',
        'Doordat de vloer vast ligt, voelt hij massief aan en klinkt hij rustig. De geringe dikte is een voordeel bij deuren en drempels en zorgt voor een lage warmteweerstand.' ] },
      { h: 'Klik: zwevend gelegd', p: [
        'Een klikvloer is dikker, meestal tussen de vier en acht millimeter, en heeft een stijve kern. De planken klikken in elkaar en liggen los op een ondervloer. De ondergrond hoeft daardoor minder strak te zijn en de vloer is sneller gelegd.',
        'Een klikvloer kan in veel gevallen over een bestaande harde vloer worden gelegd. Dat maakt hem geschikt voor een huurwoning of een snelle verbouwing. Houd wel rekening met de extra hoogte.' ] },
      { h: 'Wat past bij vloerverwarming', p: [
        'Beide systemen zijn te combineren met vloerverwarming. Dry-back geeft de warmte het makkelijkst door, omdat de vloer dun is en direct op de dekvloer ligt. Bij klik telt de ondervloer mee in de warmteweerstand, dus kies een ondervloer die daarvoor bedoeld is.',
        'Fabrikanten hanteren doorgaans een maximale temperatuur aan het vloeroppervlak van rond de 27 graden. Controleer de voorschriften van de vloer die je kiest.' ] },
      { h: 'Zo kies je', list: [
        'Nieuwbouw of een complete renovatie met vloerverwarming: dry-back.',
        'Visgraat of een ander patroon: dry-back, omdat elke strook afzonderlijk wordt gelegd.',
        'Een bestaande vloer die blijft liggen of weinig tijd: klik.',
        'Een ruimte met veel direct zonlicht, zoals een serre: vraag naar de maatvastheid van de vloer.' ] },
    ],
  },
  {
    slug: 'hoeveel-tegels-bestellen',
    topic: 'Praktisch',
    title: 'Hoeveel bestel je: *rekenen met snijverlies*',
    intro: 'Te weinig bestellen is vervelender dan een doos overhouden. Zo bereken je de juiste hoeveelheid tegels of vloer.',
    img: L + 'detail-stalen-1.webp',
    service: 'tegels',
    summary: ['Meet de ruimte op in vierkante meters', 'Tel 10 procent op bij een recht patroon', 'Tel 15 procent op bij diagonaal of visgraat'],
    sections: [
      { h: 'Begin met de oppervlakte', p: [
        'Meet de lengte en de breedte van de ruimte en vermenigvuldig die met elkaar. Verdeel een ruimte met een hoek of een nis in rechthoeken en tel de uitkomsten op. Voor wanden meet je de breedte keer de hoogte en trek je deuren en ramen eraf.' ] },
      { h: 'Tel het snijverlies erbij', p: [
        'Langs de wanden worden tegels op maat gesneden en niet elk reststuk is opnieuw te gebruiken. Daarom bestel je altijd meer dan de gemeten oppervlakte.' ],
        list: [
          'Recht of halfsteens patroon: ongeveer 10 procent extra.',
          'Diagonaal gelegd of visgraat: ongeveer 15 procent extra.',
          'Veel hoeken, een schuine wand of grootformaat in een kleine ruimte: reken ruimer.' ] },
      { h: 'Rond af op hele dozen', p: [
        'Tegels en vloeren worden per doos geleverd. Deel de benodigde vierkante meters door de inhoud van één doos en rond naar boven af. Op de productpagina’s in onze webwinkel staat een rekenhulp die dit voor je doet, inclusief het snijverlies.' ] },
      { h: 'Bestel alles in één keer', p: [
        'Keramiek wordt in partijen gebakken. Tussen twee partijen kan de tint of de exacte maat licht verschillen. Bij een nabestelling is de kans groot dat je uit een andere partij geleverd krijgt, en dat verschil zie je in de vloer.',
        'Bewaar na afloop een paar tegels. Bij een beschadiging of een latere aanpassing heb je dan materiaal uit dezelfde partij.' ] },
    ],
  },
  {
    slug: 'tegels-binnen-en-buiten',
    topic: 'Tegels',
    title: 'Dezelfde tegel *binnen en buiten*',
    intro: 'Een vloer die doorloopt van de woonkamer naar het terras maakt beide ruimtes groter. De tegel ziet er hetzelfde uit, maar is buiten anders opgebouwd.',
    img: L + 'tuintegels-hoek.webp',
    service: 'tuintegels',
    summary: ['Buiten ligt een tegel van 2 centimeter dik met een stroevere afwerking', 'Kies een serie die in beide uitvoeringen bestaat', 'Laat de voegen binnen en buiten op elkaar uitlijnen'],
    sections: [
      { h: 'Eén serie, twee uitvoeringen', p: [
        'Veel keramische series zijn er in een binnenuitvoering van ongeveer een centimeter dik en een buitenuitvoering van twee centimeter. De print en de kleur zijn gelijk. De buitentegel is dikker, zodat hij ook los op split of op tegeldragers kan liggen.',
        'Keramische tegels nemen vrijwel geen water op. Daardoor zijn ze vorstbestendig en blijven ze kleurvast. Groene aanslag hecht minder snel dan op beton of natuursteen.' ] },
      { h: 'Stroefheid', p: [
        'Buiten wordt een tegel nat en moet hij stroever zijn dan binnen. De stroefheid wordt aangegeven met een R-waarde. Binnen is R9 of R10 gebruikelijk, voor een terras kies je R11. De buitentegel voelt daardoor iets ruwer aan, maar dat verschil is met het oog nauwelijks te zien.' ] },
      { h: 'De overgang bij de pui', p: [
        'Het mooist is een overgang waarbij de voegen binnen en buiten in één lijn liggen. Dat vraagt om planning vooraf: het legplan begint bij de pui en niet bij de wand.',
        'Buiten ligt de vloer altijd op afschot, zodat regenwater van de gevel af loopt. Bij een vlakke overgang zonder opstap hoort een afvoergoot langs de pui. Bespreek dit op tijd met de aannemer of de hovenier.' ] },
      { h: 'Waar je op let', list: [
        'Controleer of de serie in beide diktes en in hetzelfde formaat leverbaar is.',
        'Bestel binnen en buiten bij voorkeur tegelijk, zodat de tint zo dicht mogelijk bij elkaar ligt.',
        'Kies een voegkleur die binnen en buiten gelijk is.',
        'Bedenk waar het terras eindigt, zodat je niet met een smalle strook uitkomt.' ] },
    ],
  },
  {
    slug: 'visgraat-leggen',
    topic: 'Vloeren',
    title: 'Visgraat: *richting en verhouding*',
    intro: 'Een visgraatvloer is tijdloos, maar het patroon is nadrukkelijk aanwezig. Met de juiste richting en strookmaat valt hij op zijn plek.',
    img: L + 'pvc-sfeer-3.webp',
    service: 'pvc-vloeren',
    summary: ['De punt van het patroon wijst naar het licht of langs de langste zichtlijn', 'Kleine stroken geven een klassiek beeld, grote stroken een rustiger beeld', 'Reken op ongeveer 15 procent snijverlies'],
    sections: [
      { h: 'De richting van het patroon', p: [
        'Een visgraat heeft een duidelijke richting. Meestal wijst de punt naar de grootste raampartij of loopt hij mee met de langste zichtlijn in huis, bijvoorbeeld van de voordeur naar de tuin. Het patroon trekt de blik dan de ruimte in.',
        'Loopt de vloer door in meerdere kamers, kies dan één richting voor de hele verdieping. Een wisseling per kamer oogt onrustig en vraagt om drempels of profielen.' ] },
      { h: 'De maat van de strook', p: [
        'Kleine stroken geven een fijn, klassiek patroon dat goed past bij een woning met ornamenten en hoge plafonds. Grotere stroken ogen moderner en rustiger en komen het best tot hun recht in een ruime kamer.',
        'In een smalle gang of een kleine kamer kan een grote strook uit verhouding raken. Leg in de showroom een paar stroken naast elkaar en bekijk het patroon van een afstand.' ] },
      { h: 'Met of zonder bies', p: [
        'Een bies is een rechte rand langs de wanden, eventueel met een smalle sierstrook. Het kadert de vloer in en vangt scheve wanden op. Zonder bies loopt het patroon door tot aan de plint, wat strakker oogt en minder werk is.' ] },
      { h: 'Leggen en snijverlies', p: [
        'Het leggen begint vanuit een middenlijn, zodat het patroon symmetrisch in de ruimte ligt. Aan de wanden wordt elke strook schuin afgesneden. Daarom is het snijverlies hoger dan bij een rechte plankenvloer: reken op ongeveer 15 procent.',
        'Bij PVC wordt visgraat meestal als dry-back gelegd. De stroken worden één voor één verlijmd op een geëgaliseerde vloer.' ] },
    ],
  },
  {
    slug: 'voegkleur-kiezen',
    topic: 'Tegels',
    title: 'De voeg: *klein detail, groot effect*',
    intro: 'De voeg beslaat maar een paar procent van het oppervlak en bepaalt toch of een vloer rustig of grafisch oogt.',
    img: L + 'tegels-ruimte.webp',
    service: 'tegels',
    summary: ['Toon op toon maakt van de vloer één vlak', 'Contrast benadrukt het formaat en het legpatroon', 'Op de vloer blijft een iets donkerdere voeg langer mooi'],
    sections: [
      { h: 'Toon op toon of contrast', p: [
        'Kies je een voeg in de kleur van de tegel, dan valt het raster weg en lees je de vloer als één vlak. Dat is bijna altijd de keuze bij grootformaat en bij een marmerlook.',
        'Een contrasterende voeg doet het omgekeerde: het patroon wordt het onderwerp. Dat werkt bij kleine wandtegels, mozaïek of een bijzonder legpatroon. Wees je ervan bewust dat ook kleine maatverschillen dan zichtbaar worden.' ] },
      { h: 'Kijk naar de donkerste tint in de tegel', p: [
        'Een tegel heeft zelden één kleur. Bij een tegel met adering of nuance kies je de voeg meestal in een van de middentinten, of net iets donkerder. Een voeg die lichter is dan de tegel valt sneller op dan een voeg die iets donkerder is.',
        'Beoordeel de kleur op een droog monster en bij daglicht. Voegmortel is nat een stuk donkerder dan na het uitharden.' ] },
      { h: 'De breedte van de voeg', p: [
        'Gerectificeerde tegels kunnen met een smalle voeg van ongeveer twee millimeter gelegd worden. Tegels met een natuurlijke, onregelmatige rand vragen om een bredere voeg. Helemaal zonder voeg leggen kan niet: de voeg vangt kleine maatverschillen en werking op.' ] },
      { h: 'Cement of epoxy', p: [
        'De meeste voegen zijn op cementbasis. Ze zijn goed te verwerken en in veel kleuren verkrijgbaar. Een epoxyvoeg is dichter, neemt geen vocht en vuil op en blijft kleurvast. Dat is een overweging voor een inloopdouche of een keukenwand, al is het verwerken bewerkelijker.' ],
        list: [
          'Vloer in de hal of keuken: kies niet te licht, een lichte voeg vraagt meer onderhoud.',
          'Douche: overweeg epoxy of een waterafstotende voeg.',
          'Aansluitingen bij bad, hoeken en vloer: die worden afgekit in dezelfde kleur als de voeg.' ] },
    ],
  },
];

export const leestijd = a => Math.max(2, Math.round(
  [a.intro, ...a.sections.flatMap(s => [s.h, ...(s.p || []), ...(s.list || [])])].join(' ').split(/\s+/).length / 200));
