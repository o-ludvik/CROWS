// Bratr Ignác, špitálník – Čeřava (k3). Rytíř řádu, který hlídá pakt. Slyšel o hostinském z doby války.
// Chce: vědět, jestli nový hostinský skončí jako Matouš. Nabídne zanést hlášení radě v Čeřavě.
// Dny: 2 (fronta), 3 (lounge, pokud přespal).
// Mechaniky: slot old_innkeeper (konfliktní zdroje: Havel + Pravenské listy vs. Varhořský hlásník vs. Tetka),
//   den 3: slot soldiers = hlášení radě (VAR report čte konec hry).
VAR aff_self = 0
VAR believes = ""
VAR report = ""

-> END

=== day2 ===
Pokoj tomuto domu. Jsem bratr Ignác ze špitálu u Brodu. #reveal:name
Říká se o vás, hostinský, že u vás kdysi našli život tři špehové z cizích zemí.
* [Říká se toho hodně.]
    Říká. Proto jsem tady – chci slyšet, co je pravda. #aff:self:+1
* [To je stará historie.]
    Historie se ráda opakuje.
- Jsem z Čeřavy. Náš řád hlídá pakt už pět set let. #reveal:faction
Pakt říká: údolí zůstane prázdné a žádné vojsko jím neprojde. Hostinský je jeho strážce. #cut
Povězte mi – proč zatkli vašeho předchůdce?
* [Bral úplatky od Varhoře. #slot:old_innkeeper:took_bribes]
    Tak jsem to slyšel i já. Smutné. #aff:self:+2
    ~ believes = "bribes"
* [Pravna ho zavřela, aby rozdmýchala neklid. #slot:old_innkeeper:pravna_plot]
    To píšou varhořské listy. Zeptejte se, kdo z toho má užitek. #aff:self:-1
    ~ believes = "plot"
* [Otrávil vrány. #slot:old_innkeeper:poisoned_crows]
    To je od Tetky, že? #aff:self:-1
* [Tohle stojí v novinách. #slot:old_innkeeper:*]
    Které noviny? Každé píšou něco jiného.
* [Nevím. A soudit nebudu.]
    Moudré. Ale jednou budete muset. #aff:self:+1
- Matouš začal malým měšcem. Pak už nemohl přestat. #cut
Kdyby k vám přišel někdo s měšcem… vzpomeňte si na něj.
-> END

=== followup_day3 ===
Vyrážím do Čeřavy, na radu. Napíšu, co mi řeknete.
Co je v údolí, hostinský?
* [Vojsko. Varhořský pluk. #slot:soldiers:army]
    Napíšu to. Pakt má ještě strážce. #aff:self:+2 #aff:k3:+1 #aff:k2:+1 #aff:k1:-2
    ~ report = "army"
* [Dělníci, kteří opravují cesty. #slot:soldiers:road_workers]
    Napíšu to… když to tak říkáte. #aff:self:-1
    ~ report = "workers"
* [Stráž proti pravenským lupičům. #slot:soldiers:pravna_raiders]
    To je vážné obvinění Pravny. Napíšu, že je od vás. #aff:self:-1 #aff:k2:-2
    ~ report = "raiders"
* [Tohle stojí v novinách. #slot:soldiers:*]
    Rada čte noviny sama. Chtěl jsem slyšet vás. #aff:self:-1
    ~ report = "other"
* [Nic nepište.]
    Mlčení je taky odpověď.
    ~ report = "none"
- -> END
