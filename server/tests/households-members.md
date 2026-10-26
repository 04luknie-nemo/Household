# Test: Medlemmar i hushållet (#76)

Testar `GET /api/households/:id/members`. Fallen utan session finns i de generella testfallen i [README.md](README.md).

Routen byggs i #76. Den som gör issuen kör fallen och rättar förväntat svar om gruppen bestämmer något annat.

## Förutsättningar

Börja med en ny databas och följ avsnitt 1–3 i [README.md](README.md). Då gäller:

- A är ägare med status `active`.
- B är medlem med status `pending`.
- C är inte medlem i något hushåll.

Byt `<id>` mot hushållets id.

## Kommando

Byt cookiefil efter vem som testar: `cookies.txt` för A, `cookies-b.txt` för B och `cookies-c.txt` för C.

```bash
curl -i -b cookies.txt localhost:3000/api/households/<id>/members
```

## Testfall

Kör i ordning.

| Fall | Vem | Förväntat svar |
| --- | --- | --- |
| 1. Hushållet finns inte | A | `404` |
| 2. Inte medlem | C | `403` |
| 3. Pending-medlem | B | `403` |
| 4. Aktiv medlem, inte ägare | B efter steg 4 nedan | `200` med medlemmarna |
| 5. Ägare | A | `200` med medlemmarna |
| 6. Sortering och fält | A | `200`, ägare först (`isOwner: true`), sedan i ordningen de gick med (`createdAt`). Bara fälten `id`, `nickname`, `avatarId`, `isOwner`. |

**1. Hushållet finns inte**: byt `<id>` mot `finns-inte`.

**4. Aktiv medlem**: gör B aktiv enligt avsnitt 4 i [README.md](README.md) med B:s `<medlem-id>` och kör med `cookies-b.txt`.
