# Histopathologie-Atlas

Statische, für GitHub Pages vorbereitete Ausgabe des Histopathologie-Atlas.
Der vollständige Kursdatensatz und sämtliche für Atlas und Prüfungsmodus
benötigten Bilder liegen im Ordner `public/atlas`.

## Auf GitHub Pages veröffentlichen

1. Ein neues, leeres GitHub-Repository anlegen.
2. Den gesamten Inhalt dieses Ordners in den Standard-Branch `main` hochladen.
3. Im Repository unter **Settings → Pages → Build and deployment** als
   **Source** die Option **GitHub Actions** auswählen.

Danach erstellt und veröffentlicht der bereits enthaltene Workflow die App
automatisch. Der Workflow läuft auch für gepushte PR-Branches, damit diese über
GitHub Pages getestet werden können. Weitere Anpassungen am Repository-Namen
oder an Bildpfaden sind nicht erforderlich.

> **Wichtig:** Unter **Source** darf nicht **Deploy from a branch** ausgewählt
> werden. Dabei würde GitHub Pages den unverarbeiteten Quellcode ausliefern.
> Dessen `index.html` verweist auf `src/main.tsx`, das erst von Vite in
> browserfähiges JavaScript übersetzt werden muss. Das Ergebnis wäre eine leere
> Seite. Zum Wechseln des veröffentlichten Branches den gewünschten Branch
> pushen oder den Workflow dort über **Actions → Run workflow** starten.

## Lokal starten

Voraussetzungen: Node.js 22 oder neuer und pnpm.

```text
pnpm install
pnpm dev
```

Der geprüfte Produktions-Build wird mit `pnpm build` erstellt.

## Datenumfang

- 78 Präparate
- hochauflösende Übersichten
- annotierte Atlasübersichten
- annotierte Detailbilder und annotationsfreie Prüfungsbilder
- organsystembasierte Navigation und konfigurierbarer Prüfungsmodus

## Hinweis

Dieses unabhängige Lehrprojekt ist kein offizielles Angebot des
Universitätsklinikums Erlangen. Vor einer öffentlichen Veröffentlichung müssen
die erforderlichen Nutzungs- und Veröffentlichungsrechte für die enthaltenen
Kursbilder geklärt sein.
