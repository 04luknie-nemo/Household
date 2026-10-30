# Test: Lista hushållets sysslor (#56)

Testar `GET /api/households/:id/tasks`. Fallet utan session finns i de generella testfallen i [README.md](README.md).

## Förutsättningar

Börja med en ny databas och följ avsnitt 1–3 i [README.md](README.md). Då gäller:

- A är ägare med status `active` och avatar 1.
- B är medlem med status `pending` och avatar 2.
- C är inte medlem.

Skapa en syssla som A:

```bash
curl -b cookies.txt -X POST localhost:3000/api/households/<id>/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Diska","description":"","reoccurInDays":7,"worth":2}'
```

Spara `id` från svaret som `<syssla-id>`. Hämta A:s och B:s `<medlem-id>` med kommandot "Visa alla medlemmar" i avsnitt 4 i README.md.

## Kommando

Byt cookiefil efter vem som testar: `cookies.txt` för A, `cookies-b.txt` för B och `cookies-c.txt` för C.

```bash
curl -i -b cookies.txt localhost:3000/api/households/<id>/tasks
```

## Testfall

Kör i ordning.

| Fall                           | Vem | Förväntat svar                                                      |
| ------------------------------ | --- | ------------------------------------------------------------------- |
| 1. Hushållet finns inte        | A   | `404`                                                               |
| 2. Inte medlem                 | C   | `403`                                                               |
| 3. Pending-medlem              | B   | `403`                                                               |
| 4. Syssla aldrig gjord         | A   | `200`, `doneTodayBy: []`, `daysSinceLast: null`, `isOverdue: false` |
| 5. Gjord idag av två medlemmar | A   | `200`, `doneTodayBy` innehåller 1 och 2, en gång var                |
| 6. Gjord för 3 dagar sedan     | A   | `200`, `doneTodayBy: []`, `daysSinceLast: 3`, `isOverdue: false`    |
| 7. Försenad                    | A   | `200`, `daysSinceLast: 8`, `isOverdue: true`                        |
| 8. Arkiverad syssla            | A   | `200` med tom lista                                                 |

**1. Hushållet finns inte**: byt `<id>` mot `finns-inte`.

**5. Gjord idag**: gör B aktiv enligt avsnitt 4 i README.md. Skapa tre rader, två för A och en för B. Byt `<medlem-id>` mellan körningarna:

```bash
npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => console.log(await db.completedTask.create({ data: { taskId: '<syssla-id>', memberId: '<medlem-id>' } })))"
```

**6. Gjord för 3 dagar sedan**: flytta alla rader 3 dagar bakåt:

```bash
npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => console.log(await db.completedTask.updateMany({ where: { taskId: '<syssla-id>' }, data: { createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } })))"
```

**7. Försenad**: kör samma kommando med `8` i stället för `3`. Sysslan återkommer var 7:e dag.

**8. Arkiverad syssla**:

```bash
npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => console.log(await db.task.update({ where: { id: '<syssla-id>' }, data: { isArchived: true } })))"
```
