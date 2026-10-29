# Test: Ta bort och arkivera syssla (#102)

Testar `POST /api/households/:id/tasks/:taskId/archive` och `DELETE /api/households/:id/tasks/:taskId`. Fallen utan session finns i de generella testfallen i [README.md](README.md).

## Förutsättningar

Fallen använder seed-datan, så kör `npm run db:seed` på en tom databas först (se `setup/README.md`). Alla testkonton har lösenordet `test1234`.

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

Hämta hushållens och sysslornas id:

```bash
npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => console.log(await db.household.findMany({ select: { id: true, name: true } })))"

npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => console.log(await db.task.findMany({ select: { id: true, title: true, isArchived: true } })))"
```

Byt `<familjen>` och `<kompisar>` mot hushållens id. Byt `<diska>`, `<laga-mat>`, `<kylskåpet>` och `<handla>` mot id:n för Diska, Laga mat, Rensa kylskåpet (arkiverad i seed-datan) och Handla (i Kompisar).

## Kommandon

```bash
# Arkivera
curl -i -b anna.txt -X POST localhost:3000/api/households/<familjen>/tasks/<syssla>/archive

# Ta bort
curl -i -b anna.txt -X DELETE localhost:3000/api/households/<familjen>/tasks/<syssla>

# Dagsvyn (#56)
curl -b anna.txt localhost:3000/api/households/<familjen>/tasks

# Statistik denna vecka (#64)
curl -b anna.txt "localhost:3000/api/households/<familjen>/stats?period=week"
```

## Testfall

Kör i ordning. Fallen bygger på varandra. Kör dagsvyn och statistiken före fall 1 och spara svaren för att jämföra.

| Fall                                  | Konto | Anrop                                                | Förväntat svar                                                      |
| ------------------------------------- | ----- | ---------------------------------------------------- | ------------------------------------------------------------------- |
| 1. Hushållet finns inte               | Anna  | Arkivera och ta bort med `<familjen>` = `finns-inte` | `404` på båda                                                       |
| 2. Inte medlem                        | Maja  | Arkivera `<diska>` och ta bort `<laga-mat>`          | `403` på båda                                                       |
| 3. Pending-medlem                     | Maja  | Arkivera `<handla>` i `<kompisar>`                   | `403`                                                               |
| 4. Aktiv medlem som inte är ägare     | Erik  | Arkivera `<diska>` och ta bort `<laga-mat>`          | `403` på båda                                                       |
| 5. Sysslan finns inte                 | Anna  | Arkivera och ta bort med `<syssla>` = `finns-inte`   | `404` på båda                                                       |
| 6. Syssla i ett annat hushåll         | Anna  | Arkivera och ta bort `<handla>` i `<familjen>`       | `404` på båda                                                       |
| 7. Redan arkiverad i seed-datan       | Anna  | Arkivera och ta bort `<kylskåpet>`                   | `404` på båda                                                       |
| 8. Arkivera                           | Anna  | Arkivera `<diska>`                                   | `200` med `{"id":"…","isArchived":true}`                            |
| 9. Dagsvyn efter arkivering           | Anna  | Dagsvyn                                              | Diska saknas                                                        |
| 10. Statistiken efter arkivering      | Anna  | Statistik denna vecka                                | Samma som före fall 1. Diska finns kvar i `perTask`.                |
| 11. Arkivera igen                     | Anna  | Arkivera `<diska>`                                   | `404`                                                               |
| 12. Markera arkiverad som gjord (#63) | Anna  | `POST .../tasks/<diska>/complete`                    | `404`                                                               |
| 13. Ta bort arkiverad                 | Anna  | Ta bort `<diska>`                                    | `404`                                                               |
| 14. Ta bort                           | Anna  | Ta bort `<laga-mat>`                                 | `200` med `{"id":"…"}`                                              |
| 15. Dagsvyn efter borttagning         | Anna  | Dagsvyn                                              | Laga mat saknas                                                     |
| 16. Statistiken efter borttagning     | Anna  | Statistik denna vecka                                | Laga mat saknas i `perTask` och poängen för den är borta ur `total` |
| 17. Ta bort igen                      | Anna  | Ta bort `<laga-mat>`                                 | `404`                                                               |
| 18. Hämta borttagen (#55)             | Anna  | `GET .../tasks/<laga-mat>`                           | `404`                                                               |
| 19. Andra hushåll orörda              | Erik  | Dagsvyn för `<kompisar>`                             | Handla och Ta ut soporna finns kvar                                 |
