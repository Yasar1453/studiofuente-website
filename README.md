# Studio Fuente: website + webwinkel

Node.js-server met ingebouwde SQLite-database. Geen losse database of build nodig.

## Starten

    npm install
    npm start            # http://localhost:8765

Eerste start vult de database vanzelf met de producten uit `data/seed/` (startset, 634 producten).

## Alle producten van studiofuente.nl overnemen

    python3 -I scripts/import-live.py      # haalt ALLE producten + voorwaarden + privacy op (rustig, hervat zelf)
    npm run import                          # zet ze in de database
    npm run import -- --afbeeldingen        # slaat de productfoto's lokaal op (langzaam, ~1 per seconde)

Let op: hun server blokkeert bij te veel verzoeken achter elkaar. Het script wacht dan vanzelf.

## Beheer

    npm run beheerder -- naam@studiofuente.nl "sterk-wachtwoord"

Daarna inloggen via /account/inloggen. Je komt dan in /beheer: bestellingen, producten (prijs, zichtbaar, uitgelicht), klanten en afspraakaanvragen.

## Wat werkt

- Homepage, Producten (filter, zoeken, sorteren), productpagina met m²-calculator, Diensten, Showroom, Afspraak, Voorwaarden, Privacy
- Winkelmand (lade + pagina), afrekenen als gast of met account
- Klantaccount: registreren, inloggen, wachtwoord vergeten, bestellingen met status en verloop, afspraken, gegevens
- Beheer: dashboard, status/betaling/verzendkosten per bestelling, notitie zichtbaar voor de klant

## Live zetten (checklist)

Maak een `.env` naast `package.json`:

    SITE_URL=https://studiofuente.nl
    NODE_ENV=production
    PORT=8765
    # MOLLIE_API_KEY=...   (pas na koppeling)

- Zet de server achter een webserver met https (Caddy of nginx) die doorstuurt naar poort 8765 en de `Host`-header meestuurt.
- Draai hem als dienst (pm2 of systemd), zodat hij na een herstart vanzelf weer opstart.
- Maak een beheerder aan (zie hierboven) en een back-up van `data/studiofuente.db` (bijv. dagelijks `sqlite3 data/studiofuente.db ".backup backup.db"`).
- Vul het KvK-nummer aan in de voorwaarden en het privacybeleid. Ook op de huidige live site ontbreekt het.

## Nog te doen

- **Mollie**: `server/payments.js`. Nu wordt een bestelling geplaatst met status "Wacht op betaling".
- **E-mail**: bevestigingen en wachtwoord-herstel. De herstel-link staat nu in de serverlog.
- **Bezorgkosten**: staan op "in overleg". De beheerder vult ze per bestelling in.
