# Test: Göra en medlem till ägare (#103)

Testar `POST /api/households/:id/members/:memberId/owner`. Fallen utan session finns i de generella testfallen i [README.md](README.md).

## Förutsättningar

Börja med en ny databas och följ avsnitt 1–3 i [README.md](README.md). Spara B:s `member.id` från svaret som `<b-id>`. Gör sedan B till aktiv medlem med kommandot i avsnitt 4. Då gäller:

- A (Anna) är ägare med status `active`.
- B (Bo) är aktiv medlem men inte ägare.
- C (Cia) är inte medlem i något hushåll.

Byt `<id>` mot hushållets id och `<kod>` mot hushållets kod.

## Kommandon

Byt cookiefil efter vem som testar: `cookies.txt` för A, `cookies-b.txt` för B och `cookies-c.txt` för C.

```bash
# Gör en medlem till ägare
curl -i -b cookies.txt -X POST localhost:3000/api/households/<id>/members/<medlem-id>/owner

# Byt namn på hushållet (#28), kräver ägare
curl -i -b cookies-b.txt -X PATCH localhost:3000/api/households/<id> \
  -H "Content-Type: application/json" -d '{"name":"Bos hushåll"}'
```

## Testfall

Kör i ordning. Fallen bygger på varandra.

| Fall                              | Vem | Anrop                                       | Förväntat svar                                                                             |
| --------------------------------- | --- | ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1. Hushållet finns inte           | A   | POST med `<id>` = `finns-inte` och `<b-id>` | `404`                                                                                      |
| 2. Inte medlem                    | C   | POST med `<b-id>`                           | `403`                                                                                      |
| 3. Aktiv medlem som inte är ägare | B   | POST med `<b-id>`                           | `403`                                                                                      |
| 4. B byter namn före              | B   | PATCH `/api/households/<id>`                | `403`                                                                                      |
| 5. Okänd medlem                   | A   | POST med `<medlem-id>` = `finns-inte`       | `404`                                                                                      |
| 6. Anna gör Bo till ägare         | A   | POST med `<b-id>`                           | `200` med medlemmen, `isOwner: true`. Bara fälten `id`, `nickname`, `avatarId`, `isOwner`. |
| 7. Bo byter namn efteråt          | B   | PATCH `/api/households/<id>`                | `200` med det nya namnet                                                                   |
| 8. Redan ägare                    | A   | POST med `<b-id>` igen                      | `200` med medlemmen, `isOwner: true`. Inget ändras.                                        |
| 9. C skickar en förfrågan         | C   | `POST /api/households/join` med `<kod>`     | `201`. Spara `member.id` som `<c-id>`.                                                     |
| 10. Pending-medlem                | A   | POST med `<c-id>`                           | `404`                                                                                      |
| 11. Pending-medlem försöker själv | C   | POST med `<c-id>`                           | `403`                                                                                      |
| 12. Medlem som har lämnat         | A   | Se nedan                                    | `404`                                                                                      |
| 13. Fel hushåll                   | A   | Se nedan                                    | `404`                                                                                      |

**9. C går med:**

```bash
curl -i -b cookies-c.txt -X POST localhost:3000/api/households/join \
  -H "Content-Type: application/json" -d '{"inviteCode":"<kod>"}'
```

**12. Medlem som har lämnat:** sätt C:s status till `left` med kommandot i avsnitt 4 i [README.md](README.md), med `<c-id>` och `status: 'left'`. Kör sedan:

```bash
curl -i -b cookies.txt -X POST localhost:3000/api/households/<id>/members/<c-id>/owner
```

**13. Fel hushåll:** A skapar ett andra hushåll och använder dess id, `<id2>`, med B från det första hushållet. A är ägare i båda, så svaret ska vara `404` och inte `403`:

```bash
curl -b cookies.txt -X POST localhost:3000/api/households \
  -H "Content-Type: application/json" -d '{"name":"Andra"}'

curl -i -b cookies.txt -X POST localhost:3000/api/households/<id2>/members/<b-id>/owner
```
