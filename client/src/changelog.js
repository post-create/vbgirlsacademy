// What has been added or changed, newest first — shown under
// Indstillinger -> Versionshistorik. Written for the coaches, not as a
// commit log: one entry per release day, plain Danish, one line per change.
//
// kind: "nyt" (something new), "forbedret" (an existing thing works better),
// "rettet" (a fault that is fixed). Add a new entry at the top whenever a
// change goes live; `date` is the day it was released (YYYY-MM-DD).
export const CHANGELOG = [
  {
    date: "2026-11-01",
    items: [
      {
        kind: "nyt",
        text: "Kampscore: klik på en spiller for at se udviklingen fra kamp til kamp. Der er en graf for kampscoren (din 1-5 vurdering) og for hver af de fem statistikker: pasningsfuldførelse, high intensity runs, km dækket, driblinger og taklinger. Datoen står under hvert punkt, og modstander og række ses ved at pege på punktet. Mangler en statistik fra en kamp, vises der ikke et nul, og datoen udelades i den graf.",
      },
      {
        kind: "nyt",
        text: "Versionshistorik under Indstillinger, så du kan se, hvad der er tilføjet og ændret.",
      },
      {
        kind: "nyt",
        text: "På spillerens side vises alle spillerens selvevalueringer som en graf for hvert mål og hver periode, så udviklingen er let at se. Datoen står under hvert punkt, og det præcise tidspunkt ses ved at pege på punktet. Trænerens aktuelle vurdering af målet vises som en rød linje i grafen.",
      },
      {
        kind: "forbedret",
        text: "Spillerne skal vurdere alle deres udviklingsmål og trykke Gem én gang for at sende selvevalueringen. Før blev værdien gemt hver gang de klikkede, og de kunne nøjes med ét mål, så historikken fik svar, de aldrig mente at give.",
      },
      {
        kind: "nyt",
        text: "Under Udviklingsmål på spillerens side står spillerens seneste egenvurdering (værdi, dato og tid) lige under trænerens fremskridt. Afviger den med mere end 2, markeres det.",
      },
      {
        kind: "nyt",
        text: "I Spillertrup markeres spillerens kort med en gul advarsel, når trænerens aktuelle vurdering af et mål og spillerens seneste selvevaluering er mere end 2 fra hinanden. Kortet viser, hvilke mål det gælder.",
      },
      {
        kind: "forbedret",
        text: "Tekstfelterne i kampplanen (fx Opbygningsspil, Målsætning for holdet og individuelle mål) vokser, så hele teksten kan ses uden at scrolle i feltet. Det virker på både pc og mobil.",
      },
    ],
  },
  {
    date: "2026-10-30",
    items: [
      {
        kind: "nyt",
        text: "Bane med opstilling i kampplanen (Position & opstilling og opstilling 2). Træk spillere mellem pladser, reserver og resten af truppen. På pc ligger spillerlisten ved siden af banen. På mobil kan banen kun ses, så der rettes i tabellen.",
      },
      {
        kind: "nyt",
        text: "Formationer under Indstillinger: 1-4-4-2, 1-4-2-3-1, 1-3-4-3 og 1-3-4-1-2 er lagt ind, og du kan selv oprette og rette formationer.",
      },
      {
        kind: "nyt",
        text: "Spillerne ser opstillingen som bane på delelinket (begge opstillinger).",
      },
      {
        kind: "nyt",
        text: "Note under hvert individuelt mål i kampplanen. Noten vises lige under målet på print og delelink.",
      },
      {
        kind: "nyt",
        text: "Spillere kan sættes inaktive. De står nederst i Spillertrup og kan ikke vælges i kampplanen eller andre steder, men deres historik bevares.",
      },
    ],
  },
  {
    date: "2026-10-21",
    items: [
      {
        kind: "rettet",
        text: "Statistikfiler, hvor kolonnerne er i en anden rækkefølge end før, kan igen uploades. Kolonnerne genkendes nu på deres navn.",
      },
    ],
  },
  {
    date: "2026-10-02",
    items: [
      {
        kind: "nyt",
        text: "Delelink til kampplanen, som spillerne kan åbne uden login.",
      },
    ],
  },
  {
    date: "2026-09-30",
    items: [
      {
        kind: "forbedret",
        text: "Kampplanens afsnit kan foldes sammen og flyttes rundt, og printet tilpasser skriftstørrelsen, så teksten passer på siden.",
      },
    ],
  },
  {
    date: "2026-09-28",
    items: [
      {
        kind: "nyt",
        text: "Division/række kan vælges på kampplanen (Division, Liga 1, Liga 2).",
      },
      {
        kind: "forbedret",
        text: "Kampscore viser én række pr. spiller med gennemsnit af tracking-statistikken, vægtet efter rækken og antal kampe.",
      },
    ],
  },
  {
    date: "2026-09-25",
    items: [
      {
        kind: "forbedret",
        text: "Udskrevet spillerrapport: stående forside og scoreside, vandrette søjler pr. kriterium i stedet for radardiagrammer, større tekst i udviklingsplanen og tydeligere tabeller.",
      },
    ],
  },
  {
    date: "2026-09-20",
    items: [
      {
        kind: "forbedret",
        text: "Spillere har nu én primær og én sekundær position (nummer 1-11) i stedet for frie positionstags.",
      },
    ],
  },
  {
    date: "2026-09-17",
    items: [
      {
        kind: "nyt",
        text: "Kampstatistik kan slettes igen fra en kampplan.",
      },
      {
        kind: "forbedret",
        text: "14 nye felter fra tracking-eksporten indlæses, fx assists, mål, hjørnespark og kampens spiller.",
      },
    ],
  },
  {
    date: "2026-09-16",
    items: [
      {
        kind: "nyt",
        text: "Upload af kampstatistik fra tracking-eksporten. Rækkerne kobles til spillerne via trøjenummer, og statistikken bruges i de AI-genererede udviklingsplaner.",
      },
      {
        kind: "forbedret",
        text: "Individuelt mål i kampplanen kan vælges fra spillerens egne mål eller skrives frit, og gælder også reserver.",
      },
      {
        kind: "forbedret",
        text: "Spillersiden og Træneroverblik er mere overskuelige: kriterierne og målene kan foldes sammen, og tilbage-knappen sidder fast øverst og husker, hvor på listen du var.",
      },
    ],
  },
  {
    date: "2026-09-15",
    items: [
      {
        kind: "nyt",
        text: "Generér med Claude: AI laver et udkast til spillerens udviklingsplan ud fra en fast prompt.",
      },
    ],
  },
  {
    date: "2026-09-13",
    items: [
      {
        kind: "nyt",
        text: "Trænerlogin med adgangskode, som sættes og ændres under Trænere.",
      },
      {
        kind: "nyt",
        text: "Udviklingsplan pr. spiller, som kan gemmes og printes, med langsigtede udviklingsmål.",
      },
      {
        kind: "nyt",
        text: "Alle spillerens selvevalueringer gemmes nu, i stedet for at den seneste overskriver de tidligere. På spillerkortet vises seneste selvevaluering, og de seneste fire pr. mål står på printet.",
      },
    ],
  },
];
