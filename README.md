# Hushållet

En app som gör det lättare att samsas kring och bli påmind om sysslor i hemmet.

Målgrupp: familjer, sambos och släktingar. Produktägare: David Jensen.

Byggd med React Native, Expo och TypeScript.

## Kom igång

Se [setup/README.md](setup/README.md) för installation, miljövariabler och GitHub-inloggning.

## Inlämning

1. Starta servern och appen enligt [setup/README.md](setup/README.md). `npm run db:seed` fyller databasen med testdata.
2. Logga in med ett testkonto från [Testkonton](setup/README.md#testkonton). Alla har lösenordet `test1234`.
3. Anna, Erik, Sara och Johan är aktiva i två hushåll var och väljer hushåll vid första inloggningen. Maja väntar på godkännande i Kompisar.

Kryssrutorna i kravlistan nedan visar vad som är klart i main. Avvikelser från skisserna dokumenteras i [#73](https://github.com/04luknie-nemo/Household/issues/73).

Appikonen och splashen syns bara i en dev build (`npx expo run:android`), inte i Expo Go.

## Medverkande

- Lukas Niemi ([04luknie-nemo](https://github.com/04luknie-nemo))
- Christian Olausson ([Olausson44](https://github.com/Olausson44))
- Martin ([Coolastelammetcodes](https://github.com/Coolastelammetcodes))
- Mattias ([MattiasMeza](https://github.com/MattiasMeza))
- Shahad ([shahadAlroomi](https://github.com/shahadAlroomi))

Produktägare: David Jensen.

## Arbetssätt med AI

Gruppen använder AI-assistenter i projektet. Se [docs/AI-ARBETSSATT.md](docs/AI-ARBETSSATT.md) för hur vi delar upp arbetet och granskar kod.

## Krav

Krav markerade med \* är obligatoriska (20 st). G: 20 krav. VG: 32 krav samt CI.

### Kravlista

- [x] En logga, splashscreen och appikon ska designas och användas. \*
- [x] Applikationen ska byggas med RN, Expo och TS. \*
- [x] Designen av appen ska utgå ifrån befintliga skisser. Undantag diskuteras med produktägaren, godkänns och dokumenteras. \*
- [x] Information ska kommuniceras till och från en server.

### Hushåll

- [x] Ett hushåll ska ha ett namn och en genererad (enkel) kod så andra kan gå med i hushållet. Namnet ska gå att ändra. \*
- [x] Alla användare i ett hushåll ska kunna se vilka som tillhör ett hushåll.
- [ ] En ägare av ett hushåll ska kunna se förfrågningar om att gå med i hushållet.
- [ ] En ägare ska kunna acceptera eller neka förfrågningar.
- [ ] En ägare ska kunna göra andra till ägare.
- [ ] En ägare ska kunna pausa en användare. Under pausade perioder tas användaren inte med i statistiken.
- [ ] Om en användare har pausats under en del av en period i statistiken ska graferna normaliseras.

### Konto

- [x] En användare ska kunna registrera och logga in sig. \*
- [x] En användare ska kunna skapa ett nytt hushåll. \*
- [x] En användare ska kunna gå med i ett hushåll genom att ange hushållets kod. \*
- [ ] När en användare har valt att gå med i ett hushåll behöver en ägare först godkänna användaren.
- [ ] En användare ska kunna lämna ett hushåll.

### Profil

- [x] En användare ska kunna ange sitt namn. \*
- [x] En användare ska kunna välja en avatar (emoji-djur och färg) från en fördefinierad lista. \*
- [x] Valda avatarer ska inte kunna väljas av andra användare i hushållet. \*
- [x] Avataren ska användas i appen för att visa vad användaren har gjort. \*
- [ ] En användare ska kunna ställa in appens utseende (mörkt, ljust, auto).
- [x] Om en användare tillhör två eller fler hushåll ska den kunna byta mellan hushållen.

### Sysslor

- [x] En ägare ska kunna lägga till sysslor att göra i hemmet. \*
- [x] En syssla ska ha ett namn, en beskrivning, hur ofta den ska göras (dagar) och en vikt som beskriver hur energikrävande den är. \*
- [ ] En användare ska kunna lägga till en ljudinspelning och en bild för att beskriva sysslan.
- [ ] En ägare ska kunna redigera en syssla. \*
- [ ] En ägare ska kunna ta bort en syssla.
- [ ] När en syssla tas bort ska användaren få en varning om att statistiken för sysslan också tas bort, och få valet att arkivera sysslan istället.

### Dagsvyn

- [x] Alla sysslor ska listas i en dagsvy och ge en översikt kring vad som behöver göras. \*
- [x] Utöver namnet ska vem/vilka som gjort sysslan visas, hur många dagar sedan den gjordes senast och om den är försenad. \*
- [x] När en användare väljer en syssla visas beskrivningen, och med ett enkelt tryck går sysslan att markera som gjord. \*

### Statistik

- [x] En användare ska kunna se fördelningen av gjorda sysslor mellan användarna i sitt hushåll. \*
- [x] Varje statistikvy ska visa den totala fördelningen (med vikterna inräknade) och fördelningen för varje enskild syssla. \*
- [x] Det ska finnas en statistikvy över "nuvarande vecka". \*
- [x] Det ska finnas en statistikvy över "förra veckan".
- [x] Det ska finnas en statistikvy över "förra månaden".
- [x] Om det inte finns statistik för en vy ska vyn inte visas.

### Schemaläggning

- [ ] En ägare ska kunna tilldela och ta bort sysslor från användare i hushållet.
- [ ] Användare ska kunna se de tilldelade sysslorna i sitt gränssnitt.
- [ ] En ägare ska kunna skapa grupper av sysslor som automatiskt tilldelas användarna och roteras baserat på ett intervall i dagar.

### Avatarer

🦊 🐷 🐸 🐥 🐙 🐬 🦉 🦄
