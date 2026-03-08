# Band Merch Kiosk

Touch-optimierte, betriebssystemunabhängige Merch-Kiosk-App im Stil eines Bestellterminals.

## Funktionen
- Startseite mit Navigation zu `Bestellseite` und `Admin`
- Bestellseite fokussiert auf Produktkacheln + Warenkorb (oben Link zurück ins Hauptmenü)
- Große Produktkacheln mit Kategorien und optionalem Hintergrundbild
- Warenkorb mit +/- Mengensteuerung
- Varianten-Auswahl (z. B. Größen S/M/L/XL) beim Produktklick
- Live-Zwischensumme
- Rabattcode-Eingabe im Warenkorb mit direkter Gesamtsummen-Anpassung
- Checkout-Dialog zur Bestellbestätigung
- Automatischer Bestandsabzug beim Verkauf (Checkout)
- Bestandsliste mit Sold/Bestand und manueller Korrektur
- Auf der Bestellseite werden nur aktuell kaufbare Artikel (Bestand > 0) angezeigt
- Responsive Layout für Desktop und Tablet
- Admin-Panel zum Verwalten von Branding und Produkten (ohne Code)

## Starten
Du brauchst nur einen Browser.

1. Dateien herunterladen/klonen.
2. `index.html` im Browser öffnen.

Optional mit lokalem Server:

```bash
python3 -m http.server 8080
```

Dann im Browser öffnen: `http://localhost:8080`

## Cloud Deployment (GitHub Pages)
Die App ist als statische Website vorbereitet und kann kostenlos auf GitHub Pages laufen.

1. Projekt in ein GitHub-Repository pushen (`main` Branch).
2. In GitHub: `Settings` -> `Pages` -> `Build and deployment`:
   - `Source`: `GitHub Actions`
3. Nach dem Push läuft automatisch der Workflow `Deploy To GitHub Pages`.
4. Danach ist die App unter deiner Pages-URL erreichbar (z. B. `https://<user>.github.io/<repo>/`).

Wichtig:
- Die Datei `.github/workflows/deploy-pages.yml` übernimmt das Deployment automatisch.
- `.nojekyll` ist gesetzt, damit statische Assets unverändert ausgeliefert werden.

## Vollautomatischer Sync (mehrere Geräte)
Du kannst zusätzlich Supabase anbinden. Dann werden Admin-Änderungen automatisch zwischen Geräten synchronisiert.

Kosten:
- GitHub Pages: kostenlos.
- Supabase: kostenloser Starttarif vorhanden (für kleine Setups meist ausreichend).

Einrichtung:
1. In Supabase ein Projekt anlegen.
2. SQL Editor öffnen und ausführen:

```sql
create table if not exists public.merch_sync (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.merch_sync enable row level security;

drop policy if exists "allow_anon_select_merch_sync" on public.merch_sync;
create policy "allow_anon_select_merch_sync"
on public.merch_sync
for select
to anon
using (true);

drop policy if exists "allow_anon_insert_merch_sync" on public.merch_sync;
create policy "allow_anon_insert_merch_sync"
on public.merch_sync
for insert
to anon
with check (true);

drop policy if exists "allow_anon_update_merch_sync" on public.merch_sync;
create policy "allow_anon_update_merch_sync"
on public.merch_sync
for update
to anon
using (true)
with check (true);
```

3. In Supabase unter `Settings -> API` kopieren:
   - `Project URL`
   - `anon public key`
4. In der App: `Admin -> Cloud-Sync (vollautomatisch)`:
   - aktivieren
   - URL + ANON Key eintragen
   - eine `Sync-ID` festlegen (z. B. `explizit-live`)
   - speichern
   - bei Bedarf `Cloud-Daten laden`, um den Cloud-Stand lokal zu überschreiben

Hinweis:
- Mit gleicher `Sync-ID` sehen alle Geräte denselben Datenstand.
- Die App arbeitet weiterhin offline; sobald wieder Internet da ist, wird wieder synchronisiert.

## Schnell veröffentlichen (ein Befehl)
Statt einzelner `git`-Befehle kannst du einfach das Skript nutzen:

```bash
cd "/Users/Bom/Documents/New project"
./publish.sh "Meine Änderung"
```

Optional ohne Commit-Text:

```bash
./publish.sh
```

## Anpassen
- Merch-Artikel liegen in [`app.js`](./app.js) im Array `defaultProducts`.
- Bandname, Tour-Label und Untertitel liegen in [`app.js`](./app.js) im Objekt `branding`.
- Farben und Look liegen in [`styles.css`](./styles.css) unter `:root`.

## Admin Panel
- Öffne die App im Browser und tippe auf `Admin` auf der Startseite.
- Standard-PIN ist `1234` (direkt danach im Admin-Bereich unter `Sicherheit` ändern).
- Dort kannst du Branding-Texte ändern sowie Produkte anlegen, bearbeiten und löschen.
- Varianten im Format `S:12, M:10, L:8` eintragen (`Variante:Bestand`).
- Für Bilder im Produkt optional direkt eine Datei im Dateiexplorer wählen (`Bilddatei`).
- Das Bild wird lokal gespeichert und als Kachelbild verwendet.
- Wenn das Bildfeld leer bleibt, nutzt die Kachel automatisch das bandtypische Farbschema.
- In der `Bestandsliste` kannst du den aktuellen Bestand pro Variante direkt setzen.
- Unter `Rabattcodes` kannst du Codes erstellen (Prozent oder Fixbetrag), die im Warenkorb eingelöst werden können.
- Über `Dashboard` im Admin kannst du Verkaufszahlen auswerten.
- Änderungen werden im Browser per `localStorage` gespeichert und erscheinen direkt als Kachel auf der Bestellseite (wenn Bestand > 0).
- Unter `Daten sichern` kannst du alle Admin-Daten als JSON exportieren und wieder importieren.
- Damit kannst du die Datei z. B. über Google Drive zwischen Geräten synchron halten.
- Die Seite hat eine Zugangssperre per Passwort (Standard: `1234`).
- Unter `Admin` -> `Sicherheit` kannst du das Seitenpasswort ändern.

## Rabattcodes
- Auf der Bestellseite im Warenkorb den Code eingeben und `Anwenden` klicken.
- Der Rabatt wird als eigene Zeile angezeigt und die Gesamtsumme entsprechend angepasst.

## Dashboard
- Im Admin auf `Dashboard` klicken.
- Filterbar nach Zeitraum, Kategorie und Artikel.
- Kennzahlen: Umsatz, verkaufte Artikel, Bestellungen, Rabattsumme.
- Liste zeigt, welche Artikel/Varianten wie oft verkauft wurden und welchen Umsatz sie erzeugt haben.
