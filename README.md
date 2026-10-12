# Hushållet

En app som gör det lättare att samsas kring och bli påmind om sysslor i hemmet.

Målgrupp: familjer, sambos och släktingar. Produktägare: David Jensen.

Byggd med React Native, Expo och TypeScript.

## Kom igång

Fylls i när Expo-projektet och backend är på plats.

## Arbetssätt med AI

Projektet byggs med Claude som assistent. Se [docs/AI-ARBETSSATT.md](docs/AI-ARBETSSATT.md) för hur vi delar upp arbetet och granskar kod.

## Krav

Krav markerade med * är obligatoriska (20 st). G: 20 krav. VG: 32 krav samt CI.

### Kravlista

- [ ] En logga, splashscreen och appikon ska designas och användas. *
- [ ] Applikationen ska byggas med RN, Expo och TS. *
- [ ] Designen av appen ska utgå ifrån befintliga skisser. Undantag diskuteras med produktägaren, godkänns och dokumenteras. *
- [ ] Information ska kommuniceras till och från en server.

### Hushåll

- [ ] Ett hushåll ska ha ett namn och en genererad (enkel) kod så andra kan gå med i hushållet. Namnet ska gå att ändra. *
- [ ] Alla användare i ett hushåll ska kunna se vilka som tillhör ett hushåll.
- [ ] En ägare av ett hushåll ska kunna se förfrågningar om att gå med i hushållet.
- [ ] En ägare ska kunna acceptera eller neka förfrågningar.
- [ ] En ägare ska kunna göra andra till ägare.
- [ ] En ägare ska kunna pausa en användare. Under pausade perioder tas användaren inte med i statistiken.
- [ ] Om en användare har pausats under en del av en period i statistiken ska graferna normaliseras.

### Konto

- [ ] En användare ska kunna registrera och logga in sig. *
- [ ] En användare ska kunna skapa ett nytt hushåll. *
- [ ] En användare ska kunna gå med i ett hushåll genom att ange hushållets kod. *
- [ ] När en användare har valt att gå med i ett hushåll behöver en ägare först godkänna användaren.
- [ ] En användare ska kunna lämna ett hushåll.

### Profil

- [ ] En användare ska kunna ange sitt namn. *
- [ ] En användare ska kunna välja en avatar (emoji-djur och färg) från en fördefinierad lista. *
- [ ] Valda avatarer ska inte kunna väljas av andra användare i hushållet. *
- [ ] Avataren ska användas i appen för att visa vad användaren har gjort. *
- [ ] En användare ska kunna ställa in appens utseende (mörkt, ljust, auto).
- [ ] Om en användare tillhör två eller fler hushåll ska den kunna byta mellan hushållen.

### Sysslor

- [ ] En ägare ska kunna lägga till sysslor att göra i hemmet. *
- [ ] En syssla ska ha ett namn, en beskrivning, hur ofta den ska göras (dagar) och en vikt som beskriver hur energikrävande den är. *
- [ ] En användare ska kunna lägga till en ljudinspelning och en bild för att beskriva sysslan.
- [ ] En ägare ska kunna redigera en syssla. *
- [ ] En ägare ska kunna ta bort en syssla.
- [ ] När en syssla tas bort ska användaren få en varning om att statistiken för sysslan också tas bort, och få valet att arkivera sysslan istället.

### Dagsvyn

- [ ] Alla sysslor ska listas i en dagsvy och ge en översikt kring vad som behöver göras. *
- [ ] Utöver namnet ska vem/vilka som gjort sysslan visas, hur många dagar sedan den gjordes senast och om den är försenad. *
- [ ] När en användare väljer en syssla visas beskrivningen, och med ett enkelt tryck går sysslan att markera som gjord. *

### Statistik

- [ ] En användare ska kunna se fördelningen av gjorda sysslor mellan användarna i sitt hushåll. *
- [ ] Varje statistikvy ska visa den totala fördelningen (med vikterna inräknade) och fördelningen för varje enskild syssla. *
- [ ] Det ska finnas en statistikvy över "nuvarande vecka". *
- [ ] Det ska finnas en statistikvy över "förra veckan".
- [ ] Det ska finnas en statistikvy över "förra månaden".
- [ ] Om det inte finns statistik för en vy ska vyn inte visas.

### Schemaläggning

- [ ] En ägare ska kunna tilldela och ta bort sysslor från användare i hushållet.
- [ ] Användare ska kunna se de tilldelade sysslorna i sitt gränssnitt.
- [ ] En ägare ska kunna skapa grupper av sysslor som automatiskt tilldelas användarna och roteras baserat på ett intervall i dagar.

### Avatarer

🦊 🐷 🐸 🐥 🐙 🐬 🦉 🦄
