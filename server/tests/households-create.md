# Test: Skapa hushåll (#26)

Testar `POST /api/households`. Följ först avsnitt 1 i [README.md](README.md). Användare A räcker för de här testerna. Fallet utan session finns i de generella testfallen i README.md.

## Testfall

| Fall | Förväntat svar |
| --- | --- |
| 1. Skapa hushåll | `201` med `id`, `name`, `inviteCode` (6 tecken), `createdAt` |
| 2. Namnet trimmas | `201` med `"name":"Testhushållet"` |
| 3. Bara mellanslag | `400 Otillåten input` |
| 4. Namn saknas | `400 Otillåten input` |
| 5. Namnet är inte text | `400 Otillåten input` |

**1. Skapa hushåll**

```bash
curl -b cookies.txt -X POST localhost:3000/api/households \
  -H "Content-Type: application/json" \
  -d '{"name":"Mitt hushåll"}'
```

**2. Namnet trimmas**

```bash
curl -b cookies.txt -X POST localhost:3000/api/households \
  -H "Content-Type: application/json" \
  -d '{"name":"  Testhushållet  "}'
```

**3. Bara mellanslag**

```bash
curl -b cookies.txt -X POST localhost:3000/api/households \
  -H "Content-Type: application/json" \
  -d '{"name":"   "}'
```

**4. Namn saknas**

```bash
curl -b cookies.txt -X POST localhost:3000/api/households \
  -H "Content-Type: application/json" \
  -d '{}'
```

**5. Namnet är inte text**

```bash
curl -b cookies.txt -X POST localhost:3000/api/households \
  -H "Content-Type: application/json" \
  -d '{"name":123}'
```

## Kontrollera att ägaren skapades

Byt `<id>` mot hushållets id från svaret i fall 1:

```bash
npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => console.log(await db.householdMember.findMany({ where: { householdId: '<id>' } })))"
```

Förväntat: en rad med `isOwner: true`, `status: 'active'`, `avatarId: 1` och användarens namn som `nickname`.
