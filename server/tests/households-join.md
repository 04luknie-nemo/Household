# Test: Gå med i ett hushåll med inbjudningskod (#22)

Testar `POST /api/households/join`. Fallet utan session finns i de generella testfallen i [README.md](README.md).

## Förutsättningar

- Servern körs lokalt på port 3000.
- Följ avsnitt 1 och 2 i [README.md](README.md): användare A, B och C finns och A har skapat ett hushåll. Byt `<kod>` nedan mot hushållets `inviteCode`.

Kör fallen i ordning. A har avatar 1 som ägare.

## 1. Giltig inbjudningskod

Skicka en giltig `inviteCode` och ett ledigt `avatarId` mellan 1 och 8.

```bash
curl -b cookies-b.txt -X POST localhost:3000/api/households/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"<kod>","avatarId":2}'
```

Förväntat resultat:

- HTTP `201 Created`.
- Ett medlemskap skapas för den inloggade användaren.
- `isOwner` är `false`.
- `status` är `pending`.
- `nickname` hämtas från användarens namn.

Spara `member.id` från svaret som `<b-id>`.

## 2. Ogiltig inbjudningskod

Skicka en kod som inte finns.

```bash
curl -i -b cookies-c.txt -X POST localhost:3000/api/households/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"ZZZZZZ","avatarId":3}'
```

Förväntat resultat:

- HTTP `404 Not Found`.
- Meddelandet är `Hushållet hittades inte`.

## 3. InviteCode saknas

Skicka en tom JSON-body utan `inviteCode`.

```bash
curl -i -b cookies-c.txt -X POST localhost:3000/api/households/join \
  -H "Content-Type: application/json" \
  -d '{}'
```

Förväntat resultat:

- HTTP `400 Bad Request`.
- Inget medlemskap skapas.
- Ett felmeddelande anger att `inviteCode` krävs.

## 4. Ogiltigt avatarId

Skicka exempelvis `avatarId: 99`.

```bash
curl -i -b cookies-c.txt -X POST localhost:3000/api/households/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"<kod>","avatarId":99}'
```

Förväntat resultat:

- HTTP `400 Bad Request`.
- Inget medlemskap skapas.

## 5. Avatar upptagen

Försök gå med med en avatar som redan används i hushållet. B har avatar 2.

```bash
curl -i -b cookies-c.txt -X POST localhost:3000/api/households/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"<kod>","avatarId":2}'
```

Förväntat resultat:

- HTTP `409 Conflict`.
- Inget extra medlemskap skapas.

## 6. Dubbelt medlemskap

Försök gå med i samma hushåll igen med samma användare. B väntar redan på godkännande.

```bash
curl -i -b cookies-b.txt -X POST localhost:3000/api/households/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"<kod>","avatarId":3}'
```

Förväntat resultat:

- HTTP `409 Conflict`.
- Meddelandet är `Du är redan medlem eller väntar på godkännande`.
- Inget duplicerat medlemskap skapas.

## 7. Ägaren skriver in sin egen kod

```bash
curl -i -b cookies.txt -X POST localhost:3000/api/households/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"<kod>"}'
```

Förväntat resultat:

- HTTP `409 Conflict`.
- A är fortfarande ägare med status `active`. Kontrollera med `GET /api/households`.

## 8. Gemener, mellanslag och automatisk avatar

Skriv koden med små bokstäver och mellanslag runt, till exempel `" abc234 "` om koden är `ABC234`. Skicka inget `avatarId`.

```bash
curl -i -b cookies-c.txt -X POST localhost:3000/api/households/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":" <kod med gemener> "}'
```

Förväntat resultat:

- HTTP `201 Created`, samma som fall 1.
- `avatarId` är `3`, den lägsta lediga avataren. A har 1 och B har 2.

## 9. Gå med igen efter att ha lämnat

Ändra B:s status till `left` enligt avsnitt 4 i [README.md](README.md). Låt sedan B gå med igen utan `avatarId`.

```bash
curl -i -b cookies-b.txt -X POST localhost:3000/api/households/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"<kod>"}'
```

Förväntat resultat:

- HTTP `201 Created`.
- `member.id` är samma som `<b-id>`. Ingen ny rad skapas.
- `status` är `pending` och `isOwner` är `false`.
- `avatarId` är fortfarande `2`. Avataren var reserverad medan B hade lämnat.
