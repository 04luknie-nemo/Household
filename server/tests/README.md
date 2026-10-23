# Manuella tester med curl

Gemensam guide för testfilerna i den här mappen. Här finns inloggning, testdata och de testfall som gäller alla routes. Varje route har sina egna testfall i en egen fil.

| Fil                                                  | Issue | Route                                            |
| ---------------------------------------------------- | ----- | ------------------------------------------------ |
| [households-create.md](households-create.md)         | #26   | `POST /api/households`                           |
| [households-join.md](households-join.md)             | #22   | `POST /api/households/join`                      |
| [households-detail.md](households-detail.md)         | #28   | `GET` och `PATCH /api/households/:id`            |
| [households-list.md](households-list.md)             | #31   | `GET /api/households`                            |
| [households-tasks.md](households-tasks.md)           | #53   | `POST /api/households/:id/tasks`                 |
| [households-tasks-list.md](households-tasks-list.md) | #56   | `GET /api/households/:id/tasks`                  |
| [households-tasks-edit.md](households-tasks-edit.md) | #55   | `GET` och `PATCH /api/households/:id/tasks/:taskId` |
| [households-profile.md](households-profile.md)       | #51   | `GET` och `PATCH /api/households/:id/members/me` |
| [households-tasks-complete.md](households-tasks-complete.md) | #63   | `POST /api/households/:id/tasks/:taskId/complete` |

## Starta servern

Kör från `server/` (se `setup/README.md` första gången):

```bash
npm run dev
```

Öppna en ny terminal och kör alla kommandon nedan från `server/`.

## Flaggor

| Flagga                                | Gör                                               |
| ------------------------------------- | ------------------------------------------------- |
| `-X POST`                             | Väljer metod. Utan den skickar curl `GET`.        |
| `-H "Content-Type: application/json"` | Säger att body är JSON. Krävs för POST och PATCH. |
| `-d '{...}'`                          | Body som skickas.                                 |
| `-c fil.txt`                          | Sparar inloggningscookien i filen.                |
| `-b fil.txt`                          | Skickar med cookien från filen, alltså inloggad.  |
| `-i`                                  | Visar statuskoden och headers i svaret.           |

Filer som heter `cookies*.txt` ignoreras av git.

## 1. Tre användare

Varje användare får en egen cookiefil. A blir ägare, B går med och C står utanför hushållet.

```bash
curl -c cookies.txt -X POST localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Anna","email":"anna@example.com","password":"hemligt123"}'

curl -c cookies-b.txt -X POST localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Bo","email":"bo@example.com","password":"hemligt123"}'

curl -c cookies-c.txt -X POST localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Cia","email":"cia@example.com","password":"hemligt123"}'
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

## 3. B går med

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

Byt `status: 'active'` mot till exempel `status: 'left'` eller `isOwner: true` vid behov.

Visa alla medlemmar i hushållet:

```bash
npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => console.log(await db.householdMember.findMany({ where: { householdId: '<id>' } })))"
```

## Börja om

Töm databasen och skapa den på nytt. Gör om avsnitt 1–3 efteråt:

```bash
npx prisma db push --force-reset
```

## Generella testfall

Gäller alla routes under `/api/households`. Utan cookie ska varje route svara `401`.

| Route                                                     | Förväntat svar |
| --------------------------------------------------------- | -------------- |
| `POST /api/households`                                    | `401`          |
| `POST /api/households/join`                               | `401`          |
| `GET /api/households` (#31)                               | `401`          |
| `GET /api/households/<id>` (#28)                          | `401`          |
| `PATCH /api/households/<id>` (#28)                        | `401`          |
| `POST /api/households/<id>/tasks` (#53)                   | `401`          |
| `GET /api/households/<id>/tasks` (#56)                    | `401`          |
| `GET /api/households/<id>/tasks/<taskId>` (#55)           | `401`          |
| `PATCH /api/households/<id>/tasks/<taskId>` (#55)         | `401`          |
| `GET /api/households/<id>/members/me` (#51)               | `401`          |
| `PATCH /api/households/<id>/members/me` (#51)             | `401`          |
| `POST /api/households/<id>/tasks/<taskId>/complete` (#63) | `401`          |

```bash
curl -i -X POST localhost:3000/api/households \
  -H "Content-Type: application/json" -d '{"name":"Test"}'

curl -i -X POST localhost:3000/api/households/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"<kod>","avatarId":2}'

curl -i localhost:3000/api/households

curl -i localhost:3000/api/households/<id>

curl -i -X PATCH localhost:3000/api/households/<id> \
  -H "Content-Type: application/json" -d '{"name":"Nytt namn"}'

curl -i -X POST localhost:3000/api/households/<id>/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Damma","description":"","reoccurInDays":7,"worth":2}'

curl -i localhost:3000/api/households/<id>/tasks

curl -i localhost:3000/api/households/<id>/tasks/<taskId>

curl -i -X PATCH localhost:3000/api/households/<id>/tasks/<taskId> \
  -H "Content-Type: application/json" \
  -d '{"title":"Diska"}'

curl -i localhost:3000/api/households/<id>/members/me

curl -i -X PATCH localhost:3000/api/households/<id>/members/me \
  -H "Content-Type: application/json" \
  -d '{"nickname":"Anna"}'
  
curl -i -X POST localhost:3000/api/households/<id>/tasks/<taskId>/complete
```

Bodyn till sysslor måste vara giltig. Annars svarar valideringen `400` innan sessionen kontrolleras.

En ny route under `/api/households` läggs till i tabellen.
