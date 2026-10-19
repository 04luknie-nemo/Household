# Test: Visa och ändra hushållets namn (#28)

Testar `GET /api/households/:id` och `PATCH /api/households/:id`. Fallen utan session finns i de generella testfallen i [README.md](README.md).

Routerna byggs i #28. Den som gör issuen kör fallen och rättar förväntat svar om gruppen bestämmer något annat.

## Förutsättningar

Börja med en ny databas och följ avsnitt 1–3 i [README.md](README.md). Då gäller:

- A är ägare med status `active`.
- B är medlem med status `pending`.
- C är inte medlem.

Byt `<id>` mot hushållets id.

## Testfall

| Fall | Vem | GET | PATCH |
| --- | --- | --- | --- |
| 1. Hushållet finns inte | A | `404` | `404` |
| 2. Inte medlem | C | `403` | `403` |
| 3. Pending-medlem | B | `403` | `403` |
| 4. Aktiv medlem, inte ägare | B efter steg 4 nedan | `200` med `name` och `inviteCode` | `403` |
| 5. Ägare | A | `200` med `name` och `inviteCode` | `200` med nytt namn |
| 6. Tomt namn eller bara mellanslag | A | | `400` |
| 7. Namn saknas eller är inte text | A | | `400` |
| 8. Namn med mellanslag runt | A | | `200`, namnet trimmat |

## Kommandon

Byt cookiefil efter vem som testar: `cookies.txt` för A, `cookies-b.txt` för B och `cookies-c.txt` för C.

**GET**

```bash
curl -i -b cookies.txt localhost:3000/api/households/<id>
```

**PATCH**

```bash
curl -i -b cookies.txt -X PATCH localhost:3000/api/households/<id> \
  -H "Content-Type: application/json" \
  -d '{"name":"Nytt namn"}'
```

**1. Hushållet finns inte**: byt `<id>` mot `finns-inte`.

**4. Aktiv medlem**: gör B aktiv enligt avsnitt 4 i README.md med B:s `<medlem-id>` och kör GET och PATCH med `cookies-b.txt`.

**6–8. Namnet**: kör PATCH som A med de här bodies:

```bash
-d '{"name":"   "}'
-d '{}'
-d '{"name":123}'
-d '{"name":"  Nytt namn  "}'
```
