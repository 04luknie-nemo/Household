# Kom igång

Projektet består av två delar som installeras var för sig. Kör aldrig `npm install` i rotmappen.

- `server/` – Hono + Prisma (SQLite) + Better Auth
- `mobile/` – Expo-appen

Den här mappen innehåller mallar för miljövariablerna. De riktiga `.env`-filerna innehåller hemligheter och skickas aldrig till GitHub, så varje person skapar sina egna utifrån mallarna.

| Mall | Kopieras till | Krävs |
|---|---|---|
| `server.env.example` | `server/.env` | Ja |
| `mobile.env.example` | `mobile/.env.local` | Bara för GitHub-inloggning på iPhone |

Auth-delen följer Better Auths dokumentation:
- [Installation](https://better-auth.com/docs/installation) – miljövariabler, databas och serveruppsättning
- [Expo-integration](https://better-auth.com/docs/integrations/expo) – klient, `trustedOrigins` och Expo-pluginet

## 1. Server

Kör från rotmappen:

```bash
cp setup/server.env.example server/.env
cd server
npm install
```

Fyll i `server/.env`:

- `BETTER_AUTH_SECRET` – minst 32 tecken, generera med `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` – från din egen GitHub OAuth App (se nedan)

Skapa databasen och starta:

```bash
npm run db:generate
npm run db:push
npm run dev
```

Servern kör på `http://localhost:3000`. Testa med `http://localhost:3000/api/auth/ok`.

## 2. GitHub OAuth App

Varje person skapar en egen app, eftersom callback-adressen skiljer sig mellan datorer.

1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Homepage URL: `http://localhost:3000`
3. Authorization callback URL: `<BETTER_AUTH_URL>/api/auth/callback/github`
4. Kopiera Client ID och generera ett Client secret till `server/.env`

Du kan lägga in flera callback-adresser (localhost, din IP, tunneln). GitHub godkänner den som matchar `BETTER_AUTH_URL`.

## 3. Mobilappen

```bash
cd mobile
npm install
npx expo start
```

Tryck `w` för webb, eller skanna QR-koden med Expo Go. Appen hittar serverns adress automatiskt.

Lägg till nya paket med `npx expo install <paket>`, inte `npm install`.

## Vilken adress ska användas?

`BETTER_AUTH_URL` (server) och callback-adressen i GitHub måste vara samma.

| Testar på | `BETTER_AUTH_URL` | `mobile/.env.local` |
|---|---|---|
| Webb | `http://localhost:3000` | behövs inte |
| Android (emulator/telefon) | `http://<din-ip>:3000` | behövs inte |
| iPhone, e-post/lösenord | valfri | behövs inte |
| iPhone, GitHub-inloggning | tunneladressen | `EXPO_PUBLIC_API_URL=<tunneladressen>` |

### Tunnel för iPhone

iOS kräver `https` för GitHub-inloggning. Starta en tunnel i en egen terminal:

```bash
npx cloudflared tunnel --protocol http2 --url http://localhost:3000
```

```bash
cp setup/mobile.env.example mobile/.env.local
```

Adressen byts varje gång tunneln startas. Uppdatera då `BETTER_AUTH_URL`, `mobile/.env.local` och GitHub-appen, starta om servern och kör `npx expo start --clear`.
