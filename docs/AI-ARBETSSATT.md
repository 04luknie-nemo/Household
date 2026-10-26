# Arbetssätt med AI

Det här dokumentet beskriver hur vi använder AI-assistenter i projektet. Det gäller oavsett verktyg: Claude, Copilot, Cursor, ChatGPT eller något annat. Målet är att alla i gruppen ska kunna förklara varje rad i koden. Om vi inte kan det har AI:n gjort för mycket.

## Roller

| Gruppen                                  | AI-assistenten                                                  |
| ---------------------------------------- | --------------------------------------------------------------- |
| Skriver skärmar, komponenter och logik   | Förklarar mönster och begrepp innan vi skriver                  |
| Bestämmer datastruktur, namn och flöden  | Granskar vår kod och pekar på problem                           |
| Granskar och godkänner all kod från AI:n | Föreslår testfall vi missat                                     |
|                                          | Skriver boilerplate när vi ber om det: konfiguration, CI, setup |

## Tre nivåer av hjälp

Den som frågar väljer nivå för varje uppgift och säger det i början.

1. Förklara. AI:n förklarar utan att skriva lösningen. Korta exempel på ett mönster är okej.
2. Granska. Vi skriver koden. AI:n kommenterar men skriver inte om den.
3. Ta över. AI:n skriver koden. Vi granskar den enligt checklistan nedan innan den mergas.

Nivå 1 och 2 är standard. Nivå 3 använder vi för kod vi redan förstår, eller när vi vill se ett förslag att jämföra med.

## Arbeta i små etapper

En etapp är en sak, till exempel "ägare kan godkänna en förfrågan". Varje etapp följer samma steg:

1. Vi beskriver vad som ska byggas.
2. AI:n ställer frågor om regler och kantfall.
3. Koden skrivs, av oss eller av AI:n beroende på nivå.
4. Koden hamnar på en egen gren och i en pull request.
5. Granskning av minst en annan person i gruppen.
6. Lint, typecheck och tester går igenom i GitHub Actions.
7. Merge till main.

En etapp ska gå att granska på cirka 15 minuter. Blir den större delar vi upp den.

### Föräldrar och sub-issues

När en issue blir för stor delar vi upp den i sub-issues, oftast en för servern och en för appen. Issuen som delas upp blir en förälder.

- En förälder är bara en platshållare. Den innehåller kraven och en lista över delarna, men ingen egen kod att skriva.
- Ingen jobbar direkt på en förälder. Den får ingen egen gren och ingen egen pull request.
- Grenen skapas från sub-issuen, och pull requesten skriver Closes för sub-issuen och "Del av" för föräldern.
- Föräldern stängs när alla delar är stängda.

## När AI:n tar över

- Koden hamnar på en egen gren, aldrig direkt mot main.
- Pull requesten beskriver vad som ändrats och varför, och att AI skrev koden.
- Någon i gruppen granskar varje fil innan merge.
- En rad läggs till i AI-loggen nedan, med PR-numret. Kan verktyget inte skriva i repot, lägger personen till raden själv.

## Verktyg och instruktionsfiler

Reglerna för AI-assistenter står i AGENTS.md i roten. Olika verktyg hittar dem på olika sätt:

| Verktyg                                    | Läser                                       |
| ------------------------------------------ | ------------------------------------------- |
| Claude Code                                | CLAUDE.md, som pekar på AGENTS.md           |
| GitHub Copilot, Cursor, Codex              | AGENTS.md                                   |
| Gemini CLI                                 | GEMINI.md, eller AGENTS.md om det ställs in |
| ChatGPT, Claude eller Gemini i webbläsaren | Ingenting i repot                           |

Använder du en webbchatt: klistra in innehållet i AGENTS.md i början av chatten, och lägg själv till raden i AI-loggen.

Ändra reglerna i AGENTS.md, inte i CLAUDE.md. Då gäller de för alla verktyg.

## Checklista vid granskning av AI-kod

- [ ] Jag kan förklara vad varje rad gör.
- [ ] Jag kan förklara varför lösningen ser ut så här, och inte på ett annat sätt.
- [ ] Koden följer den struktur gruppen har bestämt.
- [ ] TypeScript utan any.
- [ ] Inga nya paket har lagts till utan att vi vet varför.
- [ ] Lint, typecheck och tester går igenom i GitHub Actions.

Om en punkt inte stämmer frågar vi AI:n tills den gör det, eller skriver om koden själva.

## Bra frågor att ställa

- "Förklara utan kod hur vi borde lösa X."
- "Visa ett kort exempel på mönstret, inte vår lösning."
- "Granska min kod, peka på problem men skriv inte om den."
- "Ställ frågor tills jag själv ser felet."
- "Vilka testfall saknas?"

## AI-logg

Här loggas varje gång en AI-assistent skriver kod som hamnar i repot. Kolumnen PR länkar till pull requesten där koden granskades. Vem som granskade syns i PR:en på GitHub.

| Datum      | Etapp                                        | Verktyg               | Nivå                 | Vad AI:n gjorde                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | PR  |
| ---------- | -------------------------------------------- | --------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| 2026-10-09 | Projektstart                                 | Claude Code           | Ta över              | Skrev README, CLAUDE.md, AGENTS.md och det här dokumentet                                                                                                                                                                                                                                                                                                                                                                                                                                                      | #1  |
| 2026-10-12 | Arbetssätt                                   | Claude Code           | Ta över              | Gjorde AGENTS.md och arbetssättet oberoende av AI-verktyg                                                                                                                                                                                                                                                                                                                                                                                                                                                      | #3  |
| 2026-10-12 | Backend och inloggning                       | Claude i VS Code      | Ta över              | Skrev auth-client.ts, CORS och dotenv-ordningen i server/src/index.ts, setup/README.md och env-mallarna                                                                                                                                                                                                                                                                                                                                                                                                        | #4  |
| 2026-10-12 | Granskning av backend                        | Claude Code           | Granska              | Granskade PR #4, tog bort dubbel rubrik i README och lade till loggrader                                                                                                                                                                                                                                                                                                                                                                                                                                       | #4  |
| 2026-10-13 | Arbetssätt                                   | Claude Code           | Ta över              | Mergade main in i PR #3 och flyttade loggraderna till formatet med kolumnen Verktyg                                                                                                                                                                                                                                                                                                                                                                                                                            | #3  |
| 2026-10-13 | Prisma-modeller                              | Codex                 | Ta över              | Lade till Household, HouseholdMember, Role, Status, Emoji, Task, Todo och TodoExec med relationer i schema.prisma                                                                                                                                                                                                                                                                                                                                                                                              | #11 |
| 2026-10-13 | CI                                           | Claude Code           | Ta över              | Skrev mobile.yml, server.yml och eslint.config.js efter Expos mall. Testade server-stegen lokalt                                                                                                                                                                                                                                                                                                                                                                                                               | #12 |
| 2026-10-13 | Grundskal                                    | Claude Code           | Förklara och granska | Förklarade Stack, modal, Link och periodväljaren med korta mönsterexempel. Granskade koden och körde lint och tsc. Koden skrevs av Lukas                                                                                                                                                                                                                                                                                                                                                                       | #15 |
| 2026-10-13 | AI-logg                                      | Claude Code           | Ta över              | Bytte kolumnen Granskad av mot PR och fyllde i PR-nummer för alla rader                                                                                                                                                                                                                                                                                                                                                                                                                                        | #15 |
| 2026-10-14 | Navigering till login och register           | Claude Code           | Förklara och granska | Förklarade AuthProvider, Stack.Protected, headerRight, dismissTo och sidstrukturen för sysslor och hushåll med korta mönsterexempel. Granskade koden och körde lint och tsc. Föreslog household.tsx och navigeringen dit via rubriken i headern. Uppdaterade sidlistan i #14. Koden skrevs av Lukas                                                                                                                                                                                                            | #19 |
| 2026-10-15 | Datamodell                                   | Gemini CLI            | Förklara och granska | Gick igenom förändringarna från ER-diagrammet och kontrollerade Prisma-schemat                                                                                                                                                                                                                                                                                                                                                                                                                                 | #17 |
| 2026-10-15 | Seed och statusenum                          | Claude Code i VS Code | Förklara och granska | Förklarade varför db:push kräver server/.env, Prisma-enum och konstanter för statusar och avatarer. Granskade schema och seed, körde validate och tsc. Koden skrevs av Lukas                                                                                                                                                                                                                                                                                                                                   | –   |
| 2026-10-15 | Seed och avatarer                            | Claude Code           | Ta över              | Granskade grenen för #23, körde db:push, db:seed och tsc. Lade till en rad i setup/README.md om att db:seed inte gör något än, och kommentarer i båda avatars.ts om att hålla dem lika                                                                                                                                                                                                                                                                                                                         | –   |
| 2026-10-15 | Föräldraissues                               | Claude Code           | Ta över              | Skrev regeln om föräldrar och sub-issues i det här dokumentet och i AGENTS.md, på Lukas begäran                                                                                                                                                                                                                                                                                                                                                                                                                | #35 |
| 2026-10-15 | Seed och statusenum                          | Claude Code i VS Code | Förklara och granska | Förklarade varför db:push kräver server/.env, Prisma-enum och konstanter för statusar och avatarer. Granskade schema och seed, körde validate och tsc. Koden skrevs av Lukas                                                                                                                                                                                                                                                                                                                                   | #24 |
| 2026-10-15 | Skapa hushåll                                | Claude Code i VS Code | Förklara och granska | Förklarade Hono-routes, validator, Prisma nested writes, P2002 och sessionen från better-auth med korta mönsterexempel. Granskade invite-code.ts och households.ts och körde tsc. Hittade att Prisma-klienten inte var omgenererad. Testade routen med curl och skrev server/tests/households.md och cookies.txt i .gitignore. Routen skrevs av Lukas                                                                                                                                                          | #29 |
| 2026-10-19 | Färger och stilar                            | Claude Code           | Ta över              | Skapade #39 under #9. Hämtade färgerna från Figma-skärmbilderna och skrev mobile/src/constants/theme.ts med färger, textstilar, avstånd, hörnradie och gemensamma stilar för kort, fält, knappar, etiketter, dagssiffra, ikoncirkel och modalens bottenrad. Satte header och bakgrund i root-stack.tsx. Körde lint och tsc. På Lukas begäran                                                                                                                                                                   | #40 |
| 2026-10-19 | App: skapa hushåll och visa koden            | Claude Code i VS Code | Förklara och granska | Gav ledtrådar om text node-felet, mutate utan anrop, SecureStore på webben och dismissTo. Förklarade tunneln. Körde curl-testerna i server/tests/households.md samt tsc och lint i mobile. Koden skrevs av Lukas                                                                                                                                                                                                                                                                                               | #?  |
| 2026-10-19 | Guide för curl-tester                        | Claude Code           | Ta över              | Skrev server/tests/README.md med tre användare, hushåll, join, statusändring via npx tsx och generella testfall för 401. Delade upp testfallen i en fil per route: households-create.md (#26), households-join.md (#22), households-detail.md (#28) och households-list.md (#31). Lade till fall för namn som inte är text och fält som saknas. Ändrade cookies.txt till cookies\*.txt i .gitignore. Körde fallen för create, join och 401 mot en lokal server. Uppdaterade #28, #31 och #37. På Lukas begäran | #42 |
| 2026-10-20 | Aktivt hushåll (#36)                         | Codex                 | Ta över              | Synkroniserade AuthProvider med Better Auth, väntade på återställning av hushåll före navigering och skyddade hushållsval och cache vid sessions- och kontobyten. På gruppmedlems begäran                                                                                                                                                                                                                                                                                                                      |
| 2026-10-20 | Server: skapa syssla                         | Claude Code           | Ta över              | Granskade routen i households-tasks.ts i flera rundor och körde 19 testfall med curl mot en lokal server med seed-datan. Skrev server/tests/households-tasks.md och lade till routen i server/tests/README.md. Routen skrevs av Lukas                                                                                                                                                                                                                                                                          | #53 |
| 2026-10-20 | Server: dagsvy med alla sysslor              | Claude Code           | Förklara och granska | Förklarade Prisma select, filter, map och Set, datumräkning med startOfDay samt ?. och ??. Granskade routen i households-tasks-list.ts i flera rundor och gav ett utkast till server/tests/households-tasks-list.md. Körde tsc och alla 9 testfall med curl mot en lokal server. Rättade tabellerna i server/tests/README.md. Routen skrevs av Lukas                                                                                                                                                           | #56 |
| 2026-10-20 | Server: visa och ändra hushållets namn (#28) | Codex                 | Ta över              | Implementerade GET och PATCH i households-detail.ts med medlems- och ägarkontroll samt namnvalidering. 25 routekontroller med simulerad session och databas godkända. Genererade om Prisma-klienten. Tsc stoppas av saknad detail-import i households.ts, som lämnades orörd enligt instruktion.                                                                                                                                                                                                               | –   |
| 2026-10-21 | README för inlämningen                       | Claude Code           | Ta över              | Lade till avsnittet Inlämning i README.md och kryssade krav som är mergade i main: logga, splash och ikon (#48), skapa hushåll (#26, #27) och byta mellan hushåll (#36). Skapade #78, #79 och #80 och uppdaterade #32 med avataren. På Lukas begäran                                                                                                                                                                                                                                                           | #80 |
| 2026-10-21 | Prettier                                     | Claude Code           | Ta över              | Lade till .prettierrc.json, VS Code-inställningar för formatering vid sparning och prettier --check i mobile.yml och server.yml. Formaterade households.ts och households-list.ts. Skrev avsnittet Formatering i setup/README.md. På Lukas begäran                                                                                                                                                                                                                                                             | #82 |
| 2026-10-22 | Server: redigera syssla (#55)                | Gemini                | Förklara och granska | Förklarade validator, c.req.valid och Prisma select/update. Granskade routerna i households-tasks-edit.ts och testfilen households-tasks-edit.md samt körde tsc, prettier och curl-testerna mot lokal server                                                                                                                                                                                                                                                                                                   | –   |
| 2026-10-22 | Server: markera syssla som gjord (#63)       | Gemini                | Förklara och granska | Förklarade flödet, granskade routen i households-tasks-complete.ts och testfilen households-tasks-complete.md samt körde tsc, prettier och curl-testerna mot lokal server                                                                                                                                                                                                                                                                                                                                      | –   |
| 2026-10-22 | Layout i task-row                            | Codex                 | Förklara och granska | På Martins begäran: granskade frågan om lika stora kort med ui.card och avatarId på samma rad. Förklarade bredd, höjd och flexDirection med korta exempel i chatten. Ingen appkod ändrades.                                                                                                                                                                                                                                                                                                                    | #57 |
| 2026-10-22 | App: visa och ändra hushållets namn          | Claude Code           | Förklara och granska | Förklarade useContext mot useState, find mot map, queryKey och invalidateQueries, och att isOwner gäller den inloggade. Granskade household.tsx i flera rundor. Körde lint, tsc och prettier och testade skärmen i webbläsaren med seed-datan: ägaren ändrar namnet, tomt namn ger fel, medlemmen ser ingen penna och rubriken i headern uppdateras. Koden skrevs av Lukas                                                                                                                                     | #30 |
| 2026-10-22 | Server: statistik denna vecka                | Codex                 | Ta över              | Implementerade statistikroute med viktade poäng, veckogräns och behörighetskontroll. Skrev manuella curl-testfall och verifierade mot isolerad SQLite med simulerad session samt tsc. På Martins begäran. | #64 |
| 2026-10-23 | Server: seed-data med sysslor (#79)          | Gemini                | Förklara och granska | Förklarade hur relativa datum räknas med Date.now() och hur dubbletter undviks vid omkörning av seed. Granskade seed.ts och setup/README.md, körde db:seed två gånger, tsc och prettier samt kontrollerade GET /api/households/:id/tasks                                                                                                                                                                                                                                                                       | –   |
| 2026-10-26 | Dropdown-styling (del av #54) | Codex | Avgränsad kodhjälp | Justerade endast dropdown-menyerna för Återkommer och Värde: gemensam styling, placering, bredd och lagerordning. Behöll befintligt state, scrollning och val som stänger menyn samt lät bara en meny vara öppen åt gången. Övrig implementation i #54 ingick inte i AI-bidraget. | – |
