# Statistik denna vecka (#64)

Route: `GET /api/households/:id/stats?period=week`.
Följ [README](README.md) för server, användare och cookies. Kör kommandona
från `server/` i Bash/Git Bash (i PowerShell: använd `curl.exe` och anpassa radbrytningarna).
Använd ett nytt testhushåll så att befintliga markeringar inte påverkar resultatet.
A och B ska vara active, C står utanför. Spara A:s medlems-id som `<a>` och B:s som `<b>`.

Veckan börjar måndag 00:00 i **serverns lokala tidszon**, precis som dagsvyn.
Kör servern och seed-kommandona i samma tidszon, exempelvis Europe/Stockholm.
I Bash: `TZ=Europe/Stockholm npm run dev`. I PowerShell: sätt
`$env:TZ = "Europe/Stockholm"` innan `npm run dev` respektive `npx tsx`.

## 1. Tom vecka

```bash
curl -i -b cookies.txt "localhost:3000/api/households/<id>/stats?period=week"
```

Förväntat: 200 och `{"total":[],"perTask":[]}`.

## 2. Två medlemmar med olika sysslor

Kör från `server/`, där cookiefilerna från README ska ligga. A ska vara
**ägare och active**, eftersom bara ägaren får skapa sysslor. B ska också vara
active och ha en egen inloggning i `cookies-b.txt`.

`<id>`, `<mat>` och `<stada>` är platshållare som du ersätter manuellt,
inte text som ska skickas till servern. Ersätt även vinkelparenteserna.
`<id>` är hushållets id från steget där du skapade hushållet i README.

**Skapa sysslorna.** Kör ett kommando i taget och läs svaret innan du fortsätter:

```bash
# Skapa sysslor
curl -i -b cookies.txt -X POST "localhost:3000/api/households/<id>/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title":"Laga mat","description":"","reoccurInDays":1,"worth":4}'
  
curl -i -b cookies.txt -X POST "localhost:3000/api/households/<id>/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title":"Städa","description":"","reoccurInDays":7,"worth":2}'
```

Varje kommando ska ge status **201** och ett JSON-svar. Här är ett förkortat
exempel på svaret när Laga mat har skapats (dina id:n blir andra):

```json
// {
//   "id": "11111111-1111-4111-8111-111111111111",
//   "householdId": "22222222-2222-4222-8222-222222222222",
//   "title": "Laga mat",
//   "worth": 4
// }
```

1. Kopiera värdet efter **`"id"`** i svaret för **Laga mat** och anteckna det
   som `mat`. Det är sysslans id, inte `householdId`.
2. Kopiera på samma sätt `"id"` från svaret för **Städa** och anteckna det
   som `stada`.
3. Ersätt `<mat>` och `<stada>` med respektive värde i kommandona nedan
   och i resten av testfilen. Ersätt `<id>` med hushållets id.

Med exempelvärdena ovan blir URL:en för att markera Laga mat som färdig:

```text
<!-- http://localhost:3000/api/households/22222222-2222-4222-8222-222222222222/tasks/11111111-1111-4111-8111-111111111111/complete -->
```

Använd dina egna värden, inte exempelvärdena. Att ”spara id” betyder här att
anteckna och klistra in värdet; du behöver inte skapa någon fil eller terminalvariabel.

**Markera sysslorna som färdiga och hämta statistiken.** De två första anropen
är avsiktligt likadana: varje anrop registrerar en ny gång som A har lagat mat.
Det tredje använder B:s cookie så att städningen registreras på B.

```bash
# Markera som färdigt: A lagar mat två gånger och B städar en gång
curl -i -b cookies.txt -X POST "localhost:3000/api/households/<id>/tasks/<mat>/complete"
curl -i -b cookies.txt -X POST "localhost:3000/api/households/<id>/tasks/<mat>/complete"
curl -i -b cookies-b.txt -X POST "localhost:3000/api/households/<id>/tasks/<stada>/complete"

# Hämta veckans statistik
curl -i -b cookies.txt "localhost:3000/api/households/<id>/stats?period=week"
```

Varje POST ska ge 201. Routen i `households-tasks-complete.ts` hämtar `memberId`
från den inloggade medlemmens session och `taskId` från URL:en. Ingen body behövs.
Statistiken läser samma sparade `CompletedTask`-poster via relationerna `member` och `task`.

Förväntat: A har 8 poäng och B har 2 i `total`, med respektive avatarId och nickname.
`perTask` innehåller Laga mat med A:8 och Städa med B:2. Upprepade markeringar räknas var för sig.
Skapa gärna en tredje syssla utan markering: den ska inte finnas i svaret.
En medlem utan markering ska inte heller finnas i svaret.

## 3. Samma syssla gjord av båda

```bash
curl -i -b cookies-b.txt -X POST "localhost:3000/api/households/<id>/tasks/<mat>/complete"
curl -i -b cookies-b.txt "localhost:3000/api/households/<id>/stats?period=week"
```

Förväntat: A:8, B:6 totalt. Laga mat har två poster: A:8 och B:4.
Städa har fortfarande bara B:2. En aktiv medlem som inte är ägare får också 200.

## 4. Förra veckan, måndagsgränsen och framtiden

Lägg till en markering en millisekund före måndag och en i framtiden:

```bash
npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => { const monday=new Date(); monday.setDate(monday.getDate()-((monday.getDay()+6)%7)); monday.setHours(0,0,0,0); console.log(await db.completedTask.createMany({data:[{memberId:'<a>',taskId:'<mat>',createdAt:new Date(monday.getTime()-1)},{memberId:'<a>',taskId:'<mat>',createdAt:new Date(Date.now()+86400000)}]})); })"
curl -i -b cookies.txt "localhost:3000/api/households/<id>/stats?period=week"
```

Förväntat: oförändrat från fall 3. Lägg sedan till exakt måndag 00:00:

```bash
npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => { const monday=new Date(); monday.setDate(monday.getDate()-((monday.getDay()+6)%7)); monday.setHours(0,0,0,0); console.log(await db.completedTask.create({data:{memberId:'<a>',taskId:'<mat>',createdAt:monday}})); })"
```

Förväntat vid nytt GET: A:12 och B:6 totalt, Laga mat A:12 och B:4.

## 5. Arkiverade sysslor och tidigare medlemmar

```bash
npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => { await db.task.update({where:{id:'<mat>'},data:{isArchived:true}}); await db.householdMember.update({where:{id:'<b>'},data:{status:'left'}}); })"
curl -i -b cookies.txt "localhost:3000/api/households/<id>/stats?period=week"
```

Förväntat: samma poäng som i fall 4. Arkivering och att B lämnar tar inte bort historiken.
B:s eget GET ger däremot 403.

## 6. Fel och behörigheter

```bash
curl -i "localhost:3000/api/households/<id>/stats?period=week"
curl -i -b cookies-c.txt "localhost:3000/api/households/<id>/stats?period=week"
curl -i -b cookies.txt "localhost:3000/api/households/finns-inte/stats?period=week"
curl -i -b cookies.txt "localhost:3000/api/households/<id>/stats?period=month"
curl -i -b cookies.txt "localhost:3000/api/households/<id>/stats?period=lastWeek"
curl -i -b cookies.txt "localhost:3000/api/households/<id>/stats"
```

Förväntat i ordning: 401, 403, 404, 400, 400, 400.
Även `period=` och `period=Week` ger 400.
Använd README avsnitt 4 för att sätta B till `pending`, sedan `left`:
GET med cookies-b.txt ska ge 403 i båda fallen. Återställ B till `active`: 200.

## 7. Isolering mellan hushåll

Skapa ett annat hushåll med en syssla och markera den som gjord.
Statistiken för det första hushållet ska vara oförändrad.
