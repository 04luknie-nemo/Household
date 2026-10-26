# Test: Förfrågningar att gå med i hushållet (#94)

Testar `GET /api/households/:id/requests`, `POST /api/households/:id/requests/:memberId/approve` och `DELETE /api/households/:id/requests/:memberId`. Fallen utan session finns i de generella testfallen i [README.md](README.md).

## Förutsättningar

Börja med en ny databas och följ avsnitt 1–3 i [README.md](README.md). Då gäller:

- A är ägare med status `active`.
- B har skickat en förfrågan och har status `pending`. B:s `member.id` från svaret är `<b-id>`.
- C är inte medlem i något hushåll.

Byt `<id>` mot hushållets id och `<kod>` mot hushållets kod.

A:s eget medlems-id behövs i fall 6. Hämta medlemslistan från #76 och ta `id` på raden med `isOwner: true`:

```bash
curl -b cookies.txt localhost:3000/api/households/<id>/members
```

## Kommandon

Byt cookiefil efter vem som testar: `cookies.txt` för A, `cookies-b.txt` för B och `cookies-c.txt` för C.

```bash
# Lista förfrågningar
curl -i -b cookies.txt localhost:3000/api/households/<id>/requests

# Godkänn
curl -i -b cookies.txt -X POST localhost:3000/api/households/<id>/requests/<medlem-id>/approve

# Neka
curl -i -b cookies.txt -X DELETE localhost:3000/api/households/<id>/requests/<medlem-id>
```

## Testfall

Kör i ordning. Fallen bygger på varandra.

| Fall | Vem | Anrop | Förväntat svar |
| --- | --- | --- | --- |
| 1. Hushållet finns inte | A | GET med `<id>` = `finns-inte` | `404` |
| 2. Inte medlem | C | GET | `403` |
| 3. Pending-medlem | B | GET | `403` |
| 4. Ägaren ser förfrågan | A | GET | `200` med en lista med B. Bara fälten `id`, `nickname`, `avatarId`, `createdAt`. |
| 5. Okänd förfrågan | A | approve med `<medlem-id>` = `finns-inte` | `404` |
| 6. Aktiv medlem går inte att godkänna | A | approve med A:s eget medlems-id | `404` |
| 7. B före godkännande | B | `GET /api/households/<id>` | `403` |
| 8. Ägaren godkänner | A | approve med `<b-id>` | `200` med medlemmen, `status: "active"` |
| 9. B efter godkännande | B | `GET /api/households/<id>` | `200` |
| 10. Redan godkänd | A | approve med `<b-id>` igen | `404` |
| 11. Aktiv medlem som inte är ägare | B | GET | `403` |
| 12. C skickar en förfrågan | C | `POST /api/households/join` med `<kod>` | `201`. Spara `member.id` som `<c-id>`. |
| 13. Inte ägare försöker neka | B | DELETE med `<c-id>` | `403` |
| 14. Ägaren nekar | A | DELETE med `<c-id>` | `204` utan innehåll |
| 15. Listan är tom | A | GET | `200` med `[]` |
| 16. C kan fråga igen | C | `POST /api/households/join` med `<kod>` | `201`. Raden togs bort i fall 14. Spara nya `member.id` som `<c-id>`. |
| 17. Fel hushåll | A | Se nedan | `404` |

**12 och 16. C går med:**

```bash
curl -i -b cookies-c.txt -X POST localhost:3000/api/households/join \
  -H "Content-Type: application/json" -d '{"inviteCode":"<kod>"}'
```

**17. Fel hushåll:** A skapar ett andra hushåll och använder dess id, `<id2>`, med C:s förfrågan från det första hushållet. A är ägare i båda, så svaret ska vara `404` och inte `403`:

```bash
curl -b cookies.txt -X POST localhost:3000/api/households \
  -H "Content-Type: application/json" -d '{"name":"Andra"}'

curl -i -b cookies.txt -X POST localhost:3000/api/households/<id2>/requests/<c-id>/approve
```
