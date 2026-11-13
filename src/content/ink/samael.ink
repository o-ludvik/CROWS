// Samael, posel míru – Pravna (k2), přestrojený za obyčejného poutníka. Mlčenlivý obr, lidé se ho bojí.
// Chce: potvrzení, co je v údolí, a projít s tajným dopisem královny do Čeřavy. Havla nesnáší.
// Dny: 2 (fronta), 3 (lounge; „trust“ verze, pokud mu hráč 2. den potvrdil vojsko – nabídne předat hlášení radě).
// Mechaniky: frakce zůstává skrytá, dokud nedůvěřuje (výstřižky mají „?“), #cut:road:powder, slot soldiers
//   (výstřižek army má Bára / Havel / Pravenské listy – motivace pozvat Báru z lounge uprostřed rozhovoru), #item:samael_ring,
//   den 3: slot soldiers = co nahlásí radě (VAR report čte konec hry).
VAR aff_self = 0
VAR aff_havel = -99
VAR trusts = false
VAR report = ""

-> END

=== day2 ===
…Večer. Samael. #reveal:name
Pivo. A ticho.
* [Pivo a ticho. To umím.]
    …Dobře. #aff:self:+1
* [Takového obra tu dlouho nikdo neviděl.]
    Slyším to často. #aff:self:-1
- {aff_havel > -99: Ten stařík tam vzadu. Ať na mě nezírá. #aff:havel:-1}
Šel jsem přes hory. Cesta je zavalená.
Ta skála nespadla sama. Na kamenech jsou černé čmouhy a střepy ze sudů od prachu. #cut:road:powder
Jedna otázka, hostinský. Kdo táboří v údolí?
* [Vojsko. Celý varhořský pluk. #slot:soldiers:army]
    …To jsem potřeboval slyšet od někoho jiného než od sebe. #aff:self:+3 #aff:k2:+1
    ~ trusts = true
    -> mission
* [Dělníci, kteří opravují cestu. #slot:soldiers:road_workers]
    Dělníci. Ano. Tak to taky vyřídím. #aff:self:-2
* [Poutníci ke Svaté studánce. #slot:soldiers:pilgrims]
    Poutníci s kopími? Hm. #aff:self:-1
* [Stráž proti pravenským lupičům. #slot:soldiers:pravna_raiders]
    Pravenští lupiči. Tak tohle se o nás říká. #reveal:faction #aff:self:-3 #aff:k2:-1
* [Tohle stojí v novinách. #slot:soldiers:*]
    Noviny jsem četl. Ptám se vás. #aff:self:-1
* [Proč to chcete vědět?]
    To vám nepovím.
- -> END

= mission
Jsem z Pravny. Nesu dopis do Čeřavy – od královny. Prosí, aby Čeřava dodržela pakt. #reveal:faction #cut
Kdyby se mi něco stalo, tenhle prsten patří radě v Čeřavě. #item:samael_ring
-> END

=== followup_day3_trust ===
Ráno vyrážím do Čeřavy. Rada se sejde do večera.
Vyřídím i vaše slovo. Co mám říct o údolí?
* [Vojsko. Pluk s kopími. #slot:soldiers:army]
    Řeknu to. A řeknu, kdo mi to potvrdil. #aff:self:+2 #aff:k2:+2 #aff:k3:+1 #aff:k1:-2
    ~ report = "army"
* [Že jsou to dělníci. #slot:soldiers:road_workers]
    …Jak chcete. Je to vaše slovo. #aff:self:-3
    ~ report = "workers"
* [Tohle stojí v novinách. #slot:soldiers:*]
    Noviny rada čte sama. #aff:self:-1
    ~ report = "other"
* [Nic. Hostinský se do toho nemíchá.]
    Nestrannost. I ta něco stojí.
    ~ report = "none"
- -> END

=== followup_day3 ===
Odcházím. Domů, přes hory.
* [Šťastnou cestu.]
    …Díky.
* [Vyřiďte v Pravně, že se tu nic neděje.]
    Vyřídím, co uvidím. #aff:self:-1
- -> END
