// Pravdomluv, pán pravdy – Varhoř (k1). Opilec, který přichází vždy poslední a nastavuje hostinskému zrcadlo.
// Chce: aby hostinský přemýšlel, čemu věří. Dá se vždycky odbýt.
// Dny: 2 a 3 (fronta, poslední).
// Mechaniky: zrcadlo informací – slot road (den 2) a soldiers (den 3), čte synchronizované aff_k1..3 (skryté měřáky
//   se projeví jen v jeho řečech), #bartender řádek, pozdní #reveal:faction.
VAR aff_self = 0
VAR aff_k1 = 0
VAR aff_k2 = 0
VAR aff_k3 = 0
VAR said_army = false

-> END

=== day2 ===
Hik. Dobrý večer, hostinský. Pravdomluv. Jméno jako řemeslo. #reveal:name
Koukám, že máte na stole spoustu papírků. Kolik z nich je pravda? #cut
* [Jste opilý. Jděte spát.]
    Opilý jsem. Ale počítat umím. #aff:self:-1
    -> END
* [Snad většina.]
    Snad! Snad je nejhezčí slovo v jazyce.
- Tak mi řekněte jedno: co se stalo s cestou do Pravny?
* [Spadla skála. #slot:road:landslide]
    Skála. Ta je vždycky po ruce, když se něco nehodí. #aff:self:-1
* [Vyhodila ji do vzduchu Varhoř. #slot:road:sabotage]
    Odvážné. Máte k tomu důkaz, nebo jen pravenské noviny?
* [Na kamenech jsou stopy od prachu. #slot:road:powder]
    Stopy! Konečně někdo, kdo se dívá na kameny, a ne na pečetě. #aff:self:+2
* [Pravňáci si ji podkopali sami. #slot:road:pravna_mine]
    To je od Tetky. Ta to má z druhé ruky – od kozy. #aff:self:-1
* [Tohle stojí v novinách. #slot:road:*]
    V novinách stojí všechno. I opak všeho.
* [Nevím.]
    Upřímné. To je vzácné. #aff:self:+1
- Na zdraví. Zítra přijdu zas. Já přijdu vždycky poslední.
-> END

=== day3 ===
Hik. Říkal jsem, že přijdu poslední.
{aff_k1 >= 3: Ve Varhoři o vás mluví hezky. To by mě znepokojovalo.}
{aff_k1 <= -3: Ve Varhoři o vás mluví ošklivě. Spěte s jedním okem otevřeným.}
{aff_k2 >= 2: Pravna vám začíná věřit. Neztraťte to.}
{aff_k3 >= 2: I v Čeřavě, kde se nikdo o nic nestará, se o vás mluví.}
Jsem z Varhoře, hostinský. Proto vím, jak se tam lže. #reveal:faction
Tři dny, hromada výstřižků. Kolik z nich šlo od vašeho pultu dál? #cut
Poslední otázka. Kdo táboří v údolí?
* [Vojsko. #slot:soldiers:army]
    Tak to víte. A co s tím uděláte, to už není otázka pro opilce. #aff:self:+2
    ~ said_army = true
* [Dělníci. #slot:soldiers:road_workers]
    Dělníci. Tak dobrou noc, hostinský. A zamkněte. #aff:self:-1
* [Poutníci. #slot:soldiers:pilgrims]
    Poutníci! Pánbůh s nimi. A s vámi taky. #aff:self:-1
* [Stráž proti lupičům z Pravny. #slot:soldiers:pravna_raiders]
    Tohle jsem doma slyšel tisíckrát. Pokaždé před válkou. #aff:self:-2
* [Tohle stojí v novinách. #slot:soldiers:*]
    V kterých?
* [Dejte mi pokoj.]
    Dám. Ale pravda vám ho nedá.
- Možná má pravdu. #bartender
-> END
