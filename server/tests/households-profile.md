````md
# Server: min profil i hushållet (#51)

Tester för:

- GET /api/households/:id/members/me
- PATCH /api/households/:id/members/me

Följ först server/tests/README.md för att skapa tre användare
och ett testhushåll.

Använd:

- <id> = hushållets ID
- cookies.txt = användare A, aktiv medlem
- cookies-b.txt = användare B
- cookies-c.txt = användare C, utanför hushållet

Se till att A är active i hushållet. B kan användas för tester
med pending, active och left genom att ändra medlemsstatus i databasen.

## 1. GET – hämta profil

### 1.1 Aktiv medlem

```bash
curl -i -b cookies.txt localhost:3000/api/households/<id>/members/me
```
````

Förväntat: `200 OK`.

Svaret ska innehålla:

- nickname
- avatarId
- takenAvatarIds

takenAvatarIds ska innehålla avatar-ID:n som används av andra
aktiva medlemmar i hushållet, men inte användarens egen avatar.

### 1.2 Ingen session

```bash
curl -i localhost:3000/api/households/<id>/members/me
```

Förväntat: `401 Unauthorized`.

### 1.3 Hushållet finns inte

```bash
curl -i -b cookies.txt localhost:3000/api/households/ogiltigt-id/members/me
```

Förväntat: `404 Not Found`.

### 1.4 Användaren tillhör inte hushållet

```bash
curl -i -b cookies-c.txt localhost:3000/api/households/<id>/members/me
```

Förväntat: `403 Forbidden`.

### 1.5 Pending-medlem

Ändra B:s status till `pending` i databasen och kör:

```bash
curl -i -b cookies-b.txt localhost:3000/api/households/<id>/members/me
```

Förväntat: `403 Forbidden`.

### 1.6 Left-medlem

Ändra B:s status till `left` i databasen och kör:

```bash
curl -i -b cookies-b.txt localhost:3000/api/households/<id>/members/me
```

Förväntat: `403 Forbidden`.

## 2. PATCH – ändra profil

### 2.1 Ändra smeknamn

```bash
curl -i -b cookies.txt -X PATCH localhost:3000/api/households/<id>/members/me \
  -H "Content-Type: application/json" \
  -d '{"nickname":"Anna"}'
```

Förväntat: `200 OK`.

Svaret ska innehålla det uppdaterade smeknamnet och avatarId.

### 2.2 Ändra avatar

Välj ett giltigt avatar-ID som inte används av en annan medlem.

```bash
curl -i -b cookies.txt -X PATCH localhost:3000/api/households/<id>/members/me \
  -H "Content-Type: application/json" \
  -d '{"avatarId":4}'
```

Förväntat: `200 OK`.

### 2.3 Ändra både smeknamn och avatar

```bash
curl -i -b cookies.txt -X PATCH localhost:3000/api/households/<id>/members/me \
  -H "Content-Type: application/json" \
  -d '{"nickname":"Anna 2","avatarId":5}'
```

Förväntat: `200 OK`, om avatar 5 är ledig.

### 2.4 Tomt smeknamn

```bash
curl -i -b cookies.txt -X PATCH localhost:3000/api/households/<id>/members/me \
  -H "Content-Type: application/json" \
  -d '{"nickname":"   "}'
```

Förväntat: `400 Bad Request`.

### 2.5 För långt smeknamn

```bash
curl -i -b cookies.txt -X PATCH localhost:3000/api/households/<id>/members/me \
  -H "Content-Type: application/json" \
  -d '{"nickname":"Detta namn är alldeles för långt"}'
```

Förväntat: `400 Bad Request`.

### 2.6 Ogiltigt avatar-ID

```bash
curl -i -b cookies.txt -X PATCH localhost:3000/api/households/<id>/members/me \
  -H "Content-Type: application/json" \
  -d '{"avatarId":99}'
```

Förväntat: `400 Bad Request`.

### 2.7 Avatar som används av en annan medlem

Se till att en annan aktiv medlem i hushållet använder avatar 2. Försök sedan välja samma avatar:

```bash
curl -i -b cookies.txt -X PATCH localhost:3000/api/households/<id>/members/me \
  -H "Content-Type: application/json" \
  -d '{"avatarId":2}'
```

Förväntat: `409 Conflict`.

### 2.8 Ingen session

```bash
curl -i -X PATCH localhost:3000/api/households/<id>/members/me \
  -H "Content-Type: application/json" \
  -d '{"nickname":"Anna"}'
```

Förväntat: `401 Unauthorized`.

### 2.9 Hushållet finns inte

```bash
curl -i -b cookies.txt -X PATCH localhost:3000/api/households/ogiltigt-id/members/me \
  -H "Content-Type: application/json" \
  -d '{"nickname":"Anna"}'
```

Förväntat: `404 Not Found`.

### 2.10 Användaren tillhör inte hushållet

```bash
curl -i -b cookies-c.txt -X PATCH localhost:3000/api/households/<id>/members/me \
  -H "Content-Type: application/json" \
  -d '{"nickname":"Anna"}'
```

Förväntat: `403 Forbidden`.

### 2.11 Pending-medlem

Ändra B:s status till `pending` och kör:

```bash
curl -i -b cookies-b.txt -X PATCH localhost:3000/api/households/<id>/members/me \
  -H "Content-Type: application/json" \
  -d '{"nickname":"Bo"}'
```

Förväntat: `403 Forbidden`.

### 2.12 Left-medlem

Ändra B:s status till `left` och kör:

```bash
curl -i -b cookies-b.txt -X PATCH localhost:3000/api/households/<id>/members/me \
  -H "Content-Type: application/json" \
  -d '{"nickname":"Bo"}'
```

Förväntat: `403 Forbidden`.

### 2.13 Ogiltig JSON

```powershell
curl.exe -i -b cookies.txt -X PATCH "http://localhost:3000/api/households/<id>/members/me" `
  -H "Content-Type: application/json" `
  --data-binary "{"
```

Förväntat: `400 Bad Request`.

### 2.14 Tom request-body

```powershell
curl.exe -i -b cookies.txt -X PATCH "http://localhost:3000/api/households/<id>/members/me" `
  -H "Content-Type: application/json" `
  -d "{}"
```

Förväntat: `400 Bad Request`, med ett felmeddelande om att `nickname` och/eller `avatarId` måste anges.

```

```
