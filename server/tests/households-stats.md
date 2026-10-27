# Statistik denna vecka, förra veckan och förra månaden (#64, #101)

Route: `GET /api/households/:id/stats` med `period=week`, `period=lastWeek` eller `period=lastMonth`.
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

EXEMPEL
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

EXEMPEL
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
curl -i -b cookies.txt "localhost:3000/api/households/<id>/stats?period=lastweek"
curl -i -b cookies.txt "localhost:3000/api/households/<id>/stats"
```

Förväntat i ordning: 401, 403, 404, 400, 400, 400.
Även `period=` och `period=Week` ger 400.
Använd README avsnitt 4 för att sätta B till `pending`, sedan `left`:
GET med cookies-b.txt ska ge 403 i båda fallen. Återställ B till `active`: 200.

## 7. Isolering mellan hushåll

Skapa ett annat hushåll med en syssla och markera den som gjord.
Statistiken för det första hushållet ska vara oförändrad.

## 8. Förra veckan (#101)

Dessa fall testar `period=lastWeek`. För `lastMonth`, se avsnitt 9.

### Förbered ett separat testhushåll

Kör från `server/` med servern igång. Använd samma tidszon för servern och
kommandona nedan, enligt inledningen. A är inloggad i `cookies.txt`.
Skapa ett nytt hushåll så att markeringarna från fall 1–7 inte påverkar resultatet:

```bash
curl -i -b cookies.txt -X POST "localhost:3000/api/households" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test av förra veckan"}'
```

Spara svarets `id` som `<historik-id>`. Skapa sedan en syssla:

```bash
curl -i -b cookies.txt -X POST "localhost:3000/api/households/<historik-id>/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title":"Testsyssla","description":"","reoccurInDays":7,"worth":4}'
```

Spara sysslans `id` som `<historik-task>`. Hämta medlemskapet för A:

```bash
npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => console.log(await db.householdMember.findMany({ where: { householdId: '<historik-id>' } })))"
```

Spara medlemskapets `id` som `<historik-medlem>` (inte `userId`). Ersätt alla
platshållare inklusive vinkelparenteserna i följande kommandon.

### Tom period

```bash
curl -i -b cookies.txt "localhost:3000/api/households/<historik-id>/stats?period=lastWeek"
curl -i -b cookies.txt "localhost:3000/api/households/<historik-id>/stats?period=week"
```

Båda ska ge 200 och `{"total":[],"perTask":[]}`.

### Startgräns, slutgräns och uppdelning mellan veckorna

Kör följande **en gång**. Det skapar fyra markeringar på testsysslan:

- En millisekund före förra måndagen: ska inte räknas i någon av de två veckorna.
- Exakt förra måndagen 00:00: ska räknas i `lastWeek`.
- En millisekund före denna måndag: ska räknas i `lastWeek`.
- Exakt denna måndag 00:00: ska räknas i `week`, men inte i `lastWeek`.

```bash
npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => { const monday=new Date(); monday.setDate(monday.getDate()-((monday.getDay()+6)%7)); monday.setHours(0,0,0,0); const lastMonday=new Date(monday); lastMonday.setDate(lastMonday.getDate()-7); const dates=[new Date(lastMonday.getTime()-1),lastMonday,new Date(monday.getTime()-1),monday]; console.log(await db.completedTask.createMany({data:dates.map(createdAt=>({memberId:'<historik-medlem>',taskId:'<historik-task>',createdAt}))})); })"
curl -i -b cookies.txt "localhost:3000/api/households/<historik-id>/stats?period=lastWeek"
curl -i -b cookies.txt "localhost:3000/api/households/<historik-id>/stats?period=week"
```

Förväntat:

| Period | `total` | `perTask` |
| --- | --- | --- |
| `lastWeek` | A har 8 poäng | Testsyssla har A med 8 poäng |
| `week` | A har 4 poäng | Testsyssla har A med 4 poäng |

A har avatarId 1 som hushållets skapare. `total` ska också innehålla A:s nickname.
Inga andra medlemmar eller sysslor ska finnas i svaren. Kör inte seed-kommandot
igen i samma testhushåll: det lägger till ytterligare markeringar och dubblar poängen.

### Felkoder för lastWeek

```bash
curl -i "localhost:3000/api/households/<historik-id>/stats?period=lastWeek"
curl -i -b cookies-c.txt "localhost:3000/api/households/<historik-id>/stats?period=lastWeek"
curl -i -b cookies.txt "localhost:3000/api/households/finns-inte/stats?period=lastWeek"
curl -i -b cookies.txt "localhost:3000/api/households/<historik-id>/stats?period=lastweek"
```

Förväntat i ordning: 401, 403, 404, 400. C får inte vara medlem i testhushållet.
För pending/left-kontroller: använd B:s medlemskap i det ursprungliga hushållet
från fall 6. Sätt status via README avsnitt 4 och anropa:

```bash
curl -i -b cookies-b.txt "localhost:3000/api/households/<id>/stats?period=lastWeek"
```

Förväntat: 403 för både pending och left, 200 efter återställning till active.
Kör även de befintliga veckotesterna på ett nytt testhushåll för att kontrollera
att `week` fortfarande fungerar.

## 9. Förra månaden (#101)

Kör från `server/` med samma lokala tidszon som servern. A ska vara inloggad
via `cookies.txt`. Genomför fallen i ordning och inom samma kalendermånad.

### Förbered ett nytt testhushåll och en syssla

Använd ett nytt hushåll för att undvika markeringarna från veckotesterna:

```bash
curl -i -b cookies.txt -X POST "localhost:3000/api/households" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test av förra månaden"}'
```

Spara svarets `id` som `<manad-id>`. Skapa en syssla värd 4 poäng:

```bash
curl -i -b cookies.txt -X POST "localhost:3000/api/households/<manad-id>/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title":"Månadssyssla","description":"","reoccurInDays":7,"worth":4}'
```

Spara sysslans `id` som `<manad-task>`. Hämta A:s medlemskap:

```bash
npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => console.log(await db.householdMember.findMany({ where: { householdId: '<manad-id>' } })))"
```

Spara medlemskapets `id` som `<manad-medlem>` (inte `userId`). Ersätt
platshållarna inklusive vinkelparenteserna i alla följande kommandon.

### Tom period

```bash
curl -i -b cookies.txt "localhost:3000/api/households/<manad-id>/stats?period=lastMonth"
```

Förväntat: 200 och `{"total":[],"perTask":[]}`. Sysslan utan markeringar
ska inte finnas med i svaret.

### Markering mitt i förra månaden

Skapa en markering den 15:e förra månaden klockan 12:00:

```bash
npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => { const now=new Date(); console.log(await db.completedTask.create({data:{memberId:'<manad-medlem>',taskId:'<manad-task>',createdAt:new Date(now.getFullYear(),now.getMonth()-1,15,12)}})); })"
curl -i -b cookies.txt "localhost:3000/api/households/<manad-id>/stats?period=lastMonth"
```

Förväntat: 200. `total` innehåller bara A (avatarId 1, A:s nickname) med
4 poäng. `perTask` innehåller bara Månadssyssla med A och 4 poäng.

### Startgränsen inkluderas och slutgränsen exkluderas

Kör följande kommando **en gång**. Det lägger till fyra markeringar:

| Tidpunkt | Ska räknas i `lastMonth`? |
| --- | --- |
| En millisekund före den 1:a förra månaden 00:00 | Nej |
| Exakt den 1:a förra månaden 00:00 | Ja |
| En millisekund före den 1:a denna månad 00:00 | Ja |
| Exakt den 1:a denna månad 00:00 | Nej |

```bash
npx tsx -e "import('./prisma/db.ts').then(async ({ db }) => { const now=new Date(); const start=new Date(now.getFullYear(),now.getMonth()-1,1); const end=new Date(now.getFullYear(),now.getMonth(),1); const dates=[new Date(start.getTime()-1),start,new Date(end.getTime()-1),end]; console.log(await db.completedTask.createMany({data:dates.map(createdAt=>({memberId:'<manad-medlem>',taskId:'<manad-task>',createdAt}))})); })"
curl -i -b cookies.txt "localhost:3000/api/households/<manad-id>/stats?period=lastMonth"
```

Förväntat: A har **12 poäng** i både `total` och Månadssysslas `members`:
4 från den 15:e plus 8 från de två inkluderade gränsmarkeringarna. De två
markeringarna utanför intervallet får inte öka poängen. Inga andra poster
ska finnas med. Om kommandona körs flera gånger skapas dubbletter; börja då
om med ett nytt testhushåll.

Månaderna är kalenderbaserade, inte de senaste 30 dagarna. Körs testet i
januari ska markeringen den 15:e hamna i december föregående år och
slutgränsen vara den 1 januari innevarande år. Ändra inte datorns klocka
för testet; vid automatiserade datumtester kan tiden simuleras.

### Felkoder för lastMonth

C ska vara inloggad via `cookies-c.txt` och stå utanför månadstesthushållet.

```bash
curl -i "localhost:3000/api/households/<manad-id>/stats?period=lastMonth"
curl -i -b cookies-c.txt "localhost:3000/api/households/<manad-id>/stats?period=lastMonth"
curl -i -b cookies.txt "localhost:3000/api/households/finns-inte/stats?period=lastMonth"
curl -i -b cookies.txt "localhost:3000/api/households/<manad-id>/stats?period=lastmonth"
```

Förväntat i ordning: 401, 403, 404, 400.
För pending/left: använd B:s medlemskap i det ursprungliga hushållet från
fall 6, ändra status enligt README avsnitt 4 och kör:

```bash
curl -i -b cookies-b.txt "localhost:3000/api/households/<id>/stats?period=lastMonth"
```

Förväntat: 403 för pending och left, 200 efter återställning till active.
Kör även fallen för `week` och `lastWeek` för att kontrollera att de
fortfarande fungerar. En markering kan tillhöra både en vecka och en månad;
det är korrekt eftersom perioderna kan överlappa.
