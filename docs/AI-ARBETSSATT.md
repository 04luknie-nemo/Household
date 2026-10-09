# Arbetssätt med AI

Det här dokumentet beskriver hur vi använder Claude (AI-assistent) i projektet. Målet är att alla i gruppen ska kunna förklara varje rad i koden. Om vi inte kan det har AI:n gjort för mycket.

## Roller

| Gruppen | Claude |
| --- | --- |
| Skriver skärmar, komponenter och logik | Förklarar mönster och begrepp innan vi skriver |
| Bestämmer datastruktur, namn och flöden | Granskar vår kod och pekar på problem |
| Granskar och godkänner all kod från Claude | Föreslår testfall vi missat |
| | Skriver boilerplate när vi ber om det: konfiguration, CI, setup |

## Tre nivåer av hjälp

Den som frågar väljer nivå för varje uppgift och säger det i början.

1. Förklara. Claude förklarar utan att skriva lösningen. Korta exempel på ett mönster är okej.
2. Granska. Vi skriver koden. Claude kommenterar men skriver inte om den.
3. Ta över. Claude skriver koden. Vi granskar den enligt checklistan nedan innan den mergas.

Nivå 1 och 2 är standard. Nivå 3 använder vi för kod vi redan förstår, eller när vi vill se ett förslag att jämföra med.

## Arbeta i små etapper

En etapp är en sak, till exempel "ägare kan godkänna en förfrågan". Varje etapp följer samma steg:

1. Vi beskriver vad som ska byggas.
2. Claude ställer frågor om regler och kantfall.
3. Koden skrivs, av oss eller av Claude beroende på nivå.
4. Koden hamnar på en egen gren och i en pull request.
5. Granskning av minst en annan person i gruppen.
6. Lint, typecheck och tester går igenom i GitHub Actions.
7. Merge till main.

En etapp ska gå att granska på cirka 15 minuter. Blir den större delar vi upp den.

## När Claude tar över

- Claude skapar en egen gren, aldrig direkt mot main.
- Claude öppnar en pull request och beskriver vad som ändrats och varför.
- Någon i gruppen granskar varje fil innan merge.
- Claude lägger till en rad i AI-loggen nedan.

## Checklista vid granskning av AI-kod

- [ ] Jag kan förklara vad varje rad gör.
- [ ] Jag kan förklara varför lösningen ser ut så här, och inte på ett annat sätt.
- [ ] Koden följer den struktur gruppen har bestämt.
- [ ] TypeScript utan any.
- [ ] Inga nya paket har lagts till utan att vi vet varför.
- [ ] Lint, typecheck och tester går igenom i GitHub Actions.

Om en punkt inte stämmer frågar vi Claude tills den gör det, eller skriver om koden själva.

## Bra frågor att ställa

- "Förklara utan kod hur vi borde lösa X."
- "Visa ett kort exempel på mönstret, inte vår lösning."
- "Granska min kod, peka på problem men skriv inte om den."
- "Ställ frågor tills jag själv ser felet."
- "Vilka testfall saknas?"

## AI-logg

Här loggas varje gång Claude skriver kod som hamnar i repot.

| Datum | Etapp | Nivå | Vad Claude gjorde | Granskad av |
| --- | --- | --- | --- | --- |
| 2026-10-09 | Projektstart | Ta över | Skrev README, CLAUDE.md, AGENTS.md och det här dokumentet | |
