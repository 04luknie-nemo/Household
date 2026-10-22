### 3. InviteCode saknas

Skicka en tom JSON-body utan `inviteCode`.

```bash
curl -i -b cookies.txt -X POST localhost:3000/api/households/join \
  -H "Content-Type: application/json" \
  -d '{}'
```

Förväntat resultat:

- HTTP `400 Bad Request`.
- Inget medlemskap skapas.
- Ett felmeddelande anger att `inviteCode` krävs.
