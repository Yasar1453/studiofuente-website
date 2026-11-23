#!/bin/sh
# Zet de site op de eigen server (map /opt/studiofuente, service "studiofuente").
# Gebruik: SERVER=root@<adres> SSH="ssh -i <sleutel> -o IdentitiesOnly=yes" ./uitrol.sh
# De database op de server blijft staan: daar staan de echte afspraken, offertes en bestellingen.
set -e
cd "$(dirname "$0")"
: "${SERVER:?zet SERVER=root@<adres>}"
SSH="${SSH:-ssh}"
rsync -az --delete -e "$SSH" \
  --exclude node_modules --exclude .git --exclude .netlify --exclude .env \
  --exclude 'data/*.db' --exclude 'data/*.db-*' --exclude data/raw \
  ./ "$SERVER:/opt/studiofuente/"
$SSH "$SERVER" 'cd /opt/studiofuente && npm ci --omit=dev --silent && chown -R fuente:fuente /opt/studiofuente && systemctl restart studiofuente && sleep 2 && systemctl is-active studiofuente'
