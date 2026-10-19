# Test: Lista mina hushåll (#31)

Testar `GET /api/households`. Fallet utan session finns i de generella testfallen i [README.md](README.md).

Routen byggs i #31. Den som gör issuen kör fallen och rättar förväntat svar om gruppen bestämmer något annat.

## Förutsättningar

Börja med en ny databas och följ avsnitt 1–3 i [README.md](README.md). Då gäller:

- A är ägare med status `active`.
- B är medlem med status `pending`.
- C är inte medlem i något hushåll.

## Kommando

Byt cookiefil efter vem som testar: `cookies.txt` för A, `cookies-b.txt` för B och `cookies-c.txt` för C.

```bash
curl -i -b cookies.txt localhost:3000/api/households
```

## Testfall

Kör i ordning.

| Fall | Vem | Förväntat svar |
| --- | --- | --- |
| 1. Inga hushåll | C | `200` med tom lista |
| 2. Ägare | A | `200`, hushållet med `isOwner: true` och `status: "active"` |
| 3. Pending | B | `200`, hushållet med `isOwner: false` och `status: "pending"` |
| 4. Två hushåll | A efter att ha skapat ett till hushåll | `200`, båda hushållen |
| 5. Left | B efter att status ändrats till `left` | `200` med tom lista |

**4. Två hushåll**: skapa ett hushåll till som A enligt avsnitt 2 i README.md, med ett annat namn.

**5. Left**: ändra B:s status enligt avsnitt 4 i README.md, med `status: 'left'`.
