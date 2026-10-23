# Test: Redigera syssla (#55)

Testar `GET /api/households/:id/tasks/:taskId` och `PATCH /api/households/:id/tasks/:taskId`. Fallen utan session finns i de generella testfallen i [README.md](README.md).

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
  -d '{"title":"Damma","description":"Damma hyllorna","reoccurInDays":7,"worth":2}'
```

Skapa en syssla i **Kompisar** (som Erik) och spara `id` som `<syssla-kompisar>`:

```bash
curl -b erik.txt -X POST localhost:3000/api/households/<kompisar>/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Dammsuga","description":"Vardagsrummet","reoccurInDays":7,"worth":4}'
```

## Testfall – GET och behörighet

| Fall                        | Konto | Hushåll      | Syssla              | GET                                                              | PATCH (`{"title":"Nytt"}`)       |
| --------------------------- | ----- | ------------ | ------------------- | ---------------------------------------------------------------- | -------------------------------- |
| 1. Ägare                    | anna  | Familjen     | `<syssla-familjen>` | `200` med `id`, `title`, `description`, `reoccurInDays`, `worth` | `200` med uppdaterad `title`     |
| 2. Aktiv medlem, inte ägare | erik  | Familjen     | `<syssla-familjen>` | `200` med sysslan                                                | `403 Endast ägaren får redigera` |
| 3. Pending-medlem           | maja  | Kompisar     | `<syssla-kompisar>` | `403 Inte medlem`                                                | `403 Inte medlem`                |
| 4. Inte medlem              | anna  | Kompisar     | `<syssla-kompisar>` | `403 Inte medlem`                                                | `403 Inte medlem`                |
| 5. Hushållet finns inte     | anna  | `finns-inte` | `<syssla-familjen>` | `404 Hushållet finns inte`                                       | `404 Hushållet finns inte`       |
| 6. Sysslan finns inte       | anna  | Familjen     | `finns-inte`        | `404 Sysslan finns inte`                                         | `404 Sysslan finns inte`         |
| 7. Syssla i annat hushåll   | anna  | Familjen     | `<syssla-kompisar>` | `404 Sysslan finns inte`                                         | `404 Sysslan finns inte`         |

## Testfall – PATCH (deluppdatering och validering)

Körs som `anna` mot `Familjen` och `<syssla-familjen>`:

| Fall                             | Body                                                                  | Förväntat svar                                        |
| -------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------- |
| 8. Ändra bara ett fält (`worth`) | `{"worth":6}`                                                         | `200`, `worth: 6`, övriga fält oförändrade            |
| 9. Ändra alla fält + trim        | `{"title":"  Städa  ","description":"","reoccurInDays":14,"worth":8}` | `200`, `title: "Städa"`, `description: ""`, `14`, `8` |
| 10. Tom body                     | `{}`                                                                  | `400 Otillåten input`                                 |
| 11. Titel bara mellanslag        | `{"title":"   "}`                                                     | `400 Titel får inte vara tom`                         |
| 12. Beskrivning inte text        | `{"description":123}`                                                 | `400 Otillåten input`                                 |
| 13. Återkommer 0                 | `{"reoccurInDays":0}`                                                 | `400 Antal återkommande dagar får inte vara noll`     |
| 14. Återkommer 32                | `{"reoccurInDays":32}`                                                | `400 Nummer måste vara mellan 1-31`                   |
| 15. Återkommer 2.5               | `{"reoccurInDays":2.5}`                                               | `400 Återkommer måste vara ett heltal`                |
| 16. Värde 3                      | `{"worth":3}`                                                         | `400 Endast 1,2,4,6,8 går att välja`                  |
| 17. Arkiverad syssla (GET/PATCH) | `{"title":"Test"}` (efter arkivering nedan)                           | `404 Sysslan finns inte` på både GET och PATCH        |

## Kommandon

**GET:**

```bash
curl -i -b anna.txt localhost:3000/api/households/<familjen>/tasks/<syssla-familjen>
```

**PATCH:**

```bash
curl -i -b anna.txt -X PATCH localhost:3000/api/households/<familjen>/tasks/<syssla-familjen> \
  -H "Content-Type: application/json" \
  -d '{"worth":6}'
```

**Fall 17 (Arkiverad syssla):**

```bash
npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => console.log(await db.task.update({ where: { id: '<syssla-familjen>' }, data: { isArchived: true } })))"
```
