# Test: Skapa syssla (#53)

Testar `POST /api/households/:id/tasks`. Fallet utan session finns i de generella testfallen i [README.md](README.md).

## Förutsättningar

Fallen använder seed-datan, så kör `npm run db:seed` först (se `setup/README.md`). Alla testkonton har lösenordet `test1234`.

| Konto | Familjen (`ABC234`) | Kompisar (`DEF567`) |
| --- | --- | --- |
| anna@test.se | Ägare, active | Inte medlem |
| erik@test.se | Medlem, active | Ägare, active |
| maja@test.se | Inte medlem | Medlem, pending |

Logga in med en cookiefil per konto:

```bash
curl -c anna.txt -X POST localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"anna@test.se","password":"test1234"}'
```

Gör samma sak för `erik@test.se` med `erik.txt` och `maja@test.se` med `maja.txt`.

Hämta hushållens id:

```bash
npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => console.log(await db.household.findMany({ select: { id: true, name: true } })))"
```

Byt `<familjen>` och `<kompisar>` nedan mot id:n.

## Testfall

Alla anrop är `POST` med `-H "Content-Type: application/json"`. Kolumnen Body visar bara det som skiljer sig från en giltig body:

```json
{ "title": "Damma", "description": "Hyllorna", "reoccurInDays": 7, "worth": 2 }
```

| Fall | Konto | Hushåll | Body | Förväntat svar |
| --- | --- | --- | --- | --- |
| 1. Ägare skapar | anna | Familjen | giltig | `201` med sysslan och `isArchived: false` |
| 2. Tom beskrivning | anna | Familjen | `"description": ""` | `201` |
| 3. Titeln trimmas | anna | Familjen | `"title": "  Laga mat  "` | `201` med `"title": "Laga mat"` |
| 4. Medlem men inte ägare | erik | Familjen | giltig | `403 Endast ägaren får skapa` |
| 5. Pending | maja | Kompisar | giltig | `403 Inte medlem` |
| 6. Inte medlem | anna | Kompisar | giltig | `403 Inte medlem` |
| 7. Hushållet finns inte | anna | `finns-inte` | giltig | `404 Hushållet finns inte` |
| 8. Titel bara mellanslag | anna | Familjen | `"title": "   "` | `400 Titel får inte vara tom` |
| 9. Titel saknas | anna | Familjen | utan `title` | `400 Otillåten input` |
| 10. Beskrivning saknas | anna | Familjen | utan `description` | `400 Otillåten input` |
| 11. Återkommer 0 | anna | Familjen | `"reoccurInDays": 0` | `400 Antal återkommande dagar får inte vara noll` |
| 12. Återkommer 32 | anna | Familjen | `"reoccurInDays": 32` | `400 Nummer måste vara mellan 1-31` |
| 13. Återkommer 2.5 | anna | Familjen | `"reoccurInDays": 2.5` | `400 Återkommer måste vara ett heltal` |
| 14. Återkommer som text | anna | Familjen | `"reoccurInDays": "7"` | `400 Återkommer måste vara ett heltal` |
| 15. Värde 3 | anna | Familjen | `"worth": 3` | `400 Endast 1,2,4,6,8 går att välja` |
| 16. Värde 0 | anna | Familjen | `"worth": 0` | `400 Endast 1,2,4,6,8 går att välja` |
| 17. Extra fält ignoreras | anna | Familjen | `"isArchived": true` | `201` med `isArchived: false` |

## Kommandon

Fall 1:

```bash
curl -i -b anna.txt -X POST localhost:3000/api/households/<familjen>/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Damma","description":"Hyllorna","reoccurInDays":7,"worth":2}'
```

Övriga fall: byt cookiefil (`anna.txt`, `erik.txt`, `maja.txt`), hushållets id och body enligt tabellen.

## Kontrollera i databasen

```bash
npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => console.log(await db.task.findMany({ select: { title: true, description: true, reoccurInDays: true, worth: true, isArchived: true } })))"
```

Förväntat: sysslorna från fall 1, 2, 3 och 17, alla med `isArchived: false`.
