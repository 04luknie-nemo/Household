# Manuella tester: hushåll

Testar `POST /api/households` med curl. Kör från `server/` medan servern är igång (`npm run dev`).

`-c cookies.txt` sparar inloggningscookien i en fil och `-b cookies.txt` skickar med den. Filen ignoreras av git.

## 1. Registrera en testanvändare

```bash
curl -c cookies.txt -X POST localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Testare","email":"test@example.com","password":"hemligt123"}'
```

Finns användaren redan, logga in i stället:

```bash
curl -c cookies.txt -X POST localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"hemligt123"}'
```

## 2. Testfall

| Test | Kommando | Förväntat svar |
| --- | --- | --- |
| Inte inloggad | se A | `401 Inte inloggad` |
| Skapa hushåll | se B | `201` med `id`, `name`, `inviteCode` (6 tecken), `createdAt` |
| Namnet trimmas | se C | `201` med `"name":"Testhushållet"` |
| Bara mellanslag | se D | `400 Otillåten input` |
| Namn saknas | se E | `400 Otillåten input` |

**A. Inte inloggad**

```bash
curl -X POST localhost:3000/api/households \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
```

**B. Skapa hushåll**

```bash
curl -b cookies.txt -X POST localhost:3000/api/households \
  -H "Content-Type: application/json" \
  -d '{"name":"Mitt hushåll"}'
```

**C. Namnet trimmas**

```bash
curl -b cookies.txt -X POST localhost:3000/api/households \
  -H "Content-Type: application/json" \
  -d '{"name":"  Testhushållet  "}'
```

**D. Bara mellanslag**

```bash
curl -b cookies.txt -X POST localhost:3000/api/households \
  -H "Content-Type: application/json" \
  -d '{"name":"   "}'
```

**E. Namn saknas**

```bash
curl -b cookies.txt -X POST localhost:3000/api/households \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 3. Kontrollera att ägaren skapades

Byt `<id>` mot hushållets id från svaret i B:

```bash
npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => console.log(await db.householdMember.findMany({ where: { householdId: '<id>' } })))"
```

Förväntat: en rad med `isOwner: true`, `status: 'active'`, `avatarId: 1` och användarens namn som `nickname`.
