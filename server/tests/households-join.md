# Test: Gå med i ett hushåll med inbjudningskod

## Förutsättningar

- Servern körs lokalt på port 3000.
- Följ avsnitt 1 i `households.md` för inloggning och cookies.
- Ett hushåll finns och dess `inviteCode` är känt.

## 1. Giltig inbjudningskod

Skicka `POST /api/households/join` med en giltig `inviteCode` och ett ledigt `avatarId` mellan 1 och 8.

Förväntat resultat:

- HTTP 201 Created.
- Ett medlemskap skapas för den inloggade användaren.
- `isOwner` är `false`.
- `status` är `pending`.
- `nickname` hämtas från användarens namn.

## 2. Ogiltig inbjudningskod

Skicka en kod som inte finns.

Förväntat resultat:

- HTTP 404 Not Found.
- Ett tydligt felmeddelande returneras.

## 3. Ingen session

Skicka förfrågan utan giltig session.

Förväntat resultat:

- HTTP 401 Unauthorized.

## 4. Ogiltigt avatarId

Skicka exempelvis `avatarId: 99`.

Förväntat resultat:

- HTTP 400 Bad Request.
- Inget medlemskap skapas.

## 5. Avatar upptagen

Försök gå med med en avatar som redan används i hushållet.

Förväntat resultat:

- HTTP 409 Conflict.
- Inget extra medlemskap skapas.

## 6. Dubbelt medlemskap

Försök gå med i samma hushåll igen med samma användare.

Förväntat resultat:

- HTTP 409 Conflict.
- Inget duplicerat medlemskap skapas.
