# Test: Markera syssla som gjord (#63)

Testar `POST /api/households/:id/tasks/:taskId/complete`. Fallet utan session finns i de generella testfallen i [README.md](README.md).

## Förutsättningar

Fallen använder seed-datan, så kör `npm run db:seed` först (se `setup/README.md`). Alla testkonton har lösenordet `test1234`.

| Konto        | Familjen (`ABC234`) | Kompisar (`DEF567`) |
| ------------ | ------------------- | ------------------- |
| anna@test.se | Ägare, active       | Inte medlem         |
| erik@test.se | Medlem, active      | Ägare, active       |
| maja@test.se | Inte medlem         | Medlem, pending     |

Logga in med en cookiefil per konto:

```bash
curl -c anna.txt -X POST localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"anna@test.se","password":"test1234"}'

curl -c erik.txt -X POST localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"erik@test.se","password":"test1234"}'

curl -c maja.txt -X POST localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"maja@test.se","password":"test1234"}'
```

Hämta hushållens id:

```bash
npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => console.log(await db.household.findMany({ select: { id: true, name: true } })))"
```

Byt `<familjen>` och `<kompisar>` nedan mot id:n.

Skapa en syssla i **Familjen** (som Anna) och spara `id` som `<syssla-familjen>`:

```bash
curl -b anna.txt -X POST localhost:3000/api/households/<familjen>/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Diska","description":"Plocka ur och i","reoccurInDays":2,"worth":2}'
```

Skapa en syssla i **Kompisar** (som Erik) och spara `id` som `<syssla-kompisar>`:

```bash
curl -b erik.txt -X POST localhost:3000/api/households/<kompisar>/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Dammsuga","description":"Vardagsrummet","reoccurInDays":7,"worth":4}'
```

## Testfall

Kör i ordning. Alla anrop är `POST` utan body.

| Fall                       | Konto | Hushåll      | Syssla              | Förväntat svar                                        |
| -------------------------- | ----- | ------------ | ------------------- | ----------------------------------------------------- |
| 1. Ägare markerar          | anna  | Familjen     | `<syssla-familjen>` | `201` med `id`, `memberId`, `taskId` och `createdAt`  |
| 2. Vanlig medlem markerar  | erik  | Familjen     | `<syssla-familjen>` | `201` med Eriks `memberId`                            |
| 3. Samma medlem två gånger | erik  | Familjen     | `<syssla-familjen>` | `201` med nytt `id` men samma `memberId` och `taskId` |
| 4. Pending-medlem          | maja  | Kompisar     | `<syssla-kompisar>` | `403 Inte medlem`                                     |
| 5. Inte medlem             | anna  | Kompisar     | `<syssla-kompisar>` | `403 Inte medlem`                                     |
| 6. Hushållet finns inte    | anna  | `finns-inte` | `<syssla-familjen>` | `404 Hushållet finns inte`                            |
| 7. Sysslan finns inte      | anna  | Familjen     | `finns-inte`        | `404 Sysslan finns inte`                              |
| 8. Syssla i annat hushåll  | anna  | Familjen     | `<syssla-kompisar>` | `404 Sysslan finns inte`                              |
| 9. Arkiverad syssla        | anna  | Familjen     | `<syssla-familjen>` | `404 Sysslan finns inte`                              |

## Kommandon

Fall 1 (Ägare markerar):

```bash
curl -i -b anna.txt -X POST localhost:3000/api/households/<familjen>/tasks/<syssla-familjen>/complete
```

Fall 2 och 3 (Vanlig medlem markerar två gånger):

```bash
curl -i -b erik.txt -X POST localhost:3000/api/households/<familjen>/tasks/<syssla-familjen>/complete
```

Fall 4–8: byt cookiefil (`anna.txt`, `erik.txt`, `maja.txt`), hushållets id och sysslans id enligt tabellen.

Fall 9 (Arkiverad syssla): arkivera först `<syssla-familjen>` i databasen och kör sedan samma kommando som i fall 1:

```bash
npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => console.log(await db.task.update({ where: { id: '<syssla-familjen>' }, data: { isArchived: true } })))"

curl -i -b anna.txt -X POST localhost:3000/api/households/<familjen>/tasks/<syssla-familjen>/complete
```

## Kontrollera i databasen

```bash
npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => console.log(await db.completedTask.findMany({ where: { taskId: '<syssla-familjen>' } })))"
```

Förväntat: 3 rader (1 från Anna i fall 1, och 2 från Erik i fall 2 och 3).
