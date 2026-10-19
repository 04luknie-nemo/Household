# Manuella tester med curl

Gemensam guide för testfilerna i den här mappen. Varje testfil hänvisar hit för inloggning och testdata.

## Starta servern

Kör från `server/` (se `setup/README.md` första gången):

```bash
npm run dev
```

Öppna en ny terminal och kör alla kommandon nedan från `server/`.

## Flaggor

| Flagga | Gör |
| --- | --- |
| `-X POST` | Väljer metod. Utan den skickar curl `GET`. |
| `-H "Content-Type: application/json"` | Säger att body är JSON. Krävs för POST och PATCH. |
| `-d '{...}'` | Body som skickas. |
| `-c fil.txt` | Sparar inloggningscookien i filen. |
| `-b fil.txt` | Skickar med cookien från filen, alltså inloggad. |
| `-i` | Visar statuskoden och headers i svaret. |

Filer som heter `cookies*.txt` ignoreras av git.

## 1. Två användare

Många tester behöver två användare, till exempel en ägare och en som inte är medlem. Varje användare får en egen cookiefil.

Användare A:

```bash
curl -c cookies.txt -X POST localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Anna","email":"anna@example.com","password":"hemligt123"}'
```

Användare B:

```bash
curl -c cookies-b.txt -X POST localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Bo","email":"bo@example.com","password":"hemligt123"}'
```

Finns användaren redan, logga in i stället:

```bash
curl -c cookies.txt -X POST localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"anna@example.com","password":"hemligt123"}'
```

## 2. Ett hushåll

A skapar ett hushåll och blir ägare med status `active`:

```bash
curl -b cookies.txt -X POST localhost:3000/api/households \
  -H "Content-Type: application/json" \
  -d '{"name":"Testhushållet"}'
```

Spara `id` och `inviteCode` från svaret. De används i testfilerna som `<id>` och `<kod>`.

## 3. Gå med som B

```bash
curl -b cookies-b.txt -X POST localhost:3000/api/households/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"<kod>","avatarId":2}'
```

B blir medlem med status `pending`. Spara `member.id` från svaret som `<medlem-id>`.

## 4. Ändra status eller ägare för hand

Det finns inget sätt att godkänna medlemmar i appen än. Ändra direkt i databasen när ett test behöver en aktiv medlem eller en ny ägare:

```bash
npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => console.log(await db.householdMember.update({ where: { id: '<medlem-id>' }, data: { status: 'active' } })))"
```

Byt `status: 'active'` mot till exempel `isOwner: true` vid behov.

Visa alla medlemmar i hushållet:

```bash
npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => console.log(await db.householdMember.findMany({ where: { householdId: '<id>' } })))"
```

## Börja om

Töm databasen och skapa den på nytt:

```bash
npx prisma db push --force-reset
```
