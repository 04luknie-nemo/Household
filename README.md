# Hushållet

En app som gör det lättare att samsas kring och bli påmind om sysslorna i hemmet. För familjer, sambos och släktingar.

## Vad appen gör

- **Hushåll:** skapa ett hushåll och bjud in andra med en kod på sex tecken. Ägaren godkänner nya medlemmar och kan göra andra till ägare.
- **Profil:** välj ett smeknamn och ett djur som avatar, unikt i varje hushåll. Tillhör du flera hushåll byter du med ett tryck.
- **Sysslor:** varje syssla har ett namn, en beskrivning, hur ofta den ska göras och en vikt för hur jobbig den är. Ägaren kan redigera, arkivera eller ta bort den.
- **Dagsvyn:** se vad som behöver göras i dag, vem som gjort det, hur många dagar sedan och vad som är försenat. Markera en syssla som gjord med ett tryck.
- **Statistik:** cirkeldiagram visar hur arbetet fördelas, med vikterna inräknade, för denna vecka, förra veckan och förra månaden.

Avatarer: 🦊 🐷 🐸 🐥 🐙 🐬 🦉 🦄

## Teknik

- **App:** React Native, Expo SDK 58, TypeScript och expo-router.
- **Server:** Hono, Prisma, SQLite och Better Auth.

## Snabbstart

Kräver Node.js 22 och två terminaler. Kör aldrig `npm install` i rotmappen. GitHub-inloggning behövs inte, testkontona räcker.

Terminal 1, servern:

```bash
cp setup/server.env.example server/.env
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Klistra in strängen efter `BETTER_AUTH_SECRET=` i `server/.env`. Låt `GITHUB_CLIENT_ID` och `GITHUB_CLIENT_SECRET` vara tomma. Servern varnar för dem men startar ändå.

```bash
cd server
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Servern svarar på `http://localhost:3000/api/auth/ok`.

Terminal 2, appen:

```bash
cd mobile
npm install
npx expo start
```

Tryck `w` för webben, eller skanna QR-koden med Expo Go (SDK 58). Telefonen och datorn måste vara på samma nätverk.

Logga in med `anna@test.se` och lösenordet `test1234`. Välj Familjen. Fler konton finns under [Testkonton](setup/README.md#testkonton).

## Kom igång på djupet

Se [setup/README.md](setup/README.md) för miljövariabler, Android, iPhone och GitHub-inloggning.

## Utveckling

Koden formateras med Prettier, och CI kör lint, TypeScript och Prettier på varje pull request. Se [docs/AI-ARBETSSATT.md](docs/AI-ARBETSSATT.md) för hur gruppen delar upp arbetet och använder AI.

## Medverkande

- Lukas Niemi ([04luknie-nemo](https://github.com/04luknie-nemo))
- Christian Olausson ([Olausson44](https://github.com/Olausson44))
- Martin ([Coolastelammetcodes](https://github.com/Coolastelammetcodes))
- Mattias ([MattiasMeza](https://github.com/MattiasMeza))
- Shahad ([shahadAlroomi](https://github.com/shahadAlroomi))

Produktägare: David Jensen.

## Skoluppgift

Appen byggdes som en skoluppgift. Kravlistan, vilka krav som är uppfyllda, hur appen testas och avvikelserna från skisserna står i [docs/INLAMNING.md](docs/INLAMNING.md).
