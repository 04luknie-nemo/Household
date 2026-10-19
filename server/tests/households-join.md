# Test: Gå med i ett hushåll med inbjudningskod

## Förutsättningar

- Servern körs lokalt på port 3000.
- Följ avsnitt 1 och 2 i [README.md](README.md): användare A och B finns och A har skapat ett hushåll. Byt `<kod>` nedan mot hushållets `inviteCode`.
- Fall 5 och 7 behöver en tredje användare, C:

```bash
curl -c cookies-c.txt -X POST localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Cia","email":"cia@example.com","password":"hemligt123"}'
```

Kör fallen i ordning. A har avatar 1 som ägare.

## 1. Giltig inbjudningskod

Skicka `POST /api/households/join` med en giltig `inviteCode` och ett ledigt `avatarId` mellan 1 och 8.

```bash
curl -b cookies-b.txt -X POST localhost:3000/api/households/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"<kod>","avatarId":2}'
```

Förväntat resultat:

- HTTP 201 Created.
- Ett medlemskap skapas för den inloggade användaren.
- `isOwner` är `false`.
- `status` är `pending`.
- `nickname` hämtas från användarens namn.

## 2. Ogiltig inbjudningskod

Skicka en kod som inte finns.

```bash
curl -i -b cookies-b.txt -X POST localhost:3000/api/households/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"ZZZZZZ","avatarId":2}'
```

Förväntat resultat:

- HTTP 404 Not Found.
- Ett tydligt felmeddelande returneras.

## 3. Ingen session

Skicka förfrågan utan giltig session.

```bash
curl -i -X POST localhost:3000/api/households/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"<kod>","avatarId":2}'
```

Förväntat resultat:

- HTTP 401 Unauthorized.

## 4. Ogiltigt avatarId

Skicka exempelvis `avatarId: 99`.

```bash
curl -i -b cookies-c.txt -X POST localhost:3000/api/households/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"<kod>","avatarId":99}'
```

Förväntat resultat:

- HTTP 400 Bad Request.
- Inget medlemskap skapas.

## 5. Avatar upptagen

Försök gå med med en avatar som redan används i hushållet. B har avatar 2.

```bash
curl -i -b cookies-c.txt -X POST localhost:3000/api/households/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"<kod>","avatarId":2}'
```

Förväntat resultat:

- HTTP 409 Conflict.
- Inget extra medlemskap skapas.

## 6. Dubbelt medlemskap

Försök gå med i samma hushåll igen med samma användare.

```bash
curl -i -b cookies-b.txt -X POST localhost:3000/api/households/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"<kod>","avatarId":3}'
```

Förväntat resultat:

- HTTP 409 Conflict.
- Inget duplicerat medlemskap skapas.

## 7. Koden med gemener och mellanslag

Skriv koden med små bokstäver och mellanslag runt, till exempel `" abc234 "` om koden är `ABC234`.

```bash
curl -i -b cookies-c.txt -X POST localhost:3000/api/households/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":" <kod med gemener> ","avatarId":3}'
```

Förväntat resultat:

- HTTP 201 Created, samma som fall 1.
