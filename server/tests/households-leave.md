# Server: lämna hushåll (#104)

Route: `POST /api/households/:id/leave`

## 1. Utan session – 401

```bash
curl -i -X POST localhost:3000/api/households/<id>/leave
```

Förväntat svar: `401 Unauthorized`.

## 2. Hushållet finns inte – 404

```bash
curl -i -b cookies.txt -X POST localhost:3000/api/households/ogiltigt-id/leave
```

Förväntat svar: `404 Not Found`.

## 3. Användaren är inte aktiv medlem – 403

Ändra användarens medlemsstatus till `pending` eller `left` enligt instruktionerna i `tests/README.md`.

```bash
curl -i -b cookies-b.txt -X POST localhost:3000/api/households/<id>/leave
```

Förväntat svar: `403 Forbidden`.

## 4. Lämna hushållet – 204

Logga in som en aktiv medlem, till exempel Sara, och lämna hushållet:

```bash
curl -i -b cookies-b.txt -X POST localhost:3000/api/households/<id>/leave
```

Förväntat svar: `204 No Content`.

Kontrollera att hushållet inte längre finns i Saras lista:

```bash
curl -i -b cookies-b.txt localhost:3000/api/households
```

Kontrollera också att Sara inte längre kan öppna hushållet:

```bash
curl -i -b cookies-b.txt localhost:3000/api/households/<id>
```

Förväntat svar: `403 Forbidden`.

## 5. Ensam ägare med andra aktiva medlemmar – 409

Logga in som den enda ägaren i ett hushåll där minst en annan aktiv medlem finns.

```bash
curl -i -b cookies.txt -X POST localhost:3000/api/households/<id>/leave
```

Förväntat svar: `409 Conflict`.

Meddelandet ska vara:

`Gör någon annan till ägare först`

## 6. Historik och statistik finns kvar

Efter att Sara har lämnat hushållet ska hennes tidigare sysslor och hushållets statistik finnas kvar.

Kontrollera statistiken som en annan aktiv medlem:

```bash
curl -i -b cookies.txt "localhost:3000/api/households/<id>/stats?period=week"
```

Förväntat resultat: hushållet och tidigare statistik finns kvar.
