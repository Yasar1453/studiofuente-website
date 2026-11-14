#!/bin/sh
# Zet de kijkversie op Netlify (studiofuente-nieuw.netlify.app).
# Netlify weigert een directe --prod deploy ("Forbidden"), daarom: proefdeploy en die publiceren via de API.
set -e
cd "$(dirname "$0")"
SITE=27887e80-151f-49fb-8081-2aedcd1ca912
rm -f data/kijkversie.db
sqlite3 data/studiofuente.db "VACUUM INTO 'data/kijkversie.db'"
# Geen accounts, bestellingen of sessies mee naar de kijkversie
sqlite3 data/kijkversie.db "DELETE FROM sessions; DELETE FROM cart_items; DELETE FROM guest_orders; DELETE FROM password_resets; DELETE FROM order_events; DELETE FROM order_items; DELETE FROM orders; DELETE FROM appointments; DELETE FROM users; PRAGMA journal_mode=DELETE; VACUUM;" >/dev/null
ID=$(netlify deploy --json | python3 -c "import json,sys;print(json.load(sys.stdin)['deploy_id'])")
netlify api restoreSiteDeploy --data "{\"site_id\":\"$SITE\",\"deploy_id\":\"$ID\"}" >/dev/null
for p in / /producten /journaal /winkelmand; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' "https://studiofuente-nieuw.netlify.app$p") $p"
done
