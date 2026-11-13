// Tetka – Pravna (k2), místní drbna. Nepamatuje si vlastní jméno; zná každou polopravdu v okolí.
// Chce: posluchače. Havla nesnáší.
// Dny: 1 (fronta), 2 (lounge; „rumor“ verze, pokud spala na pokoji s Radomilem a ten jí nakukal pravenské lupiče), 3 (lounge, pokud přespala i 2. noc).
// Mechaniky: drby, které odporují vránám (#cut:road:pravna_mine, soldiers:pilgrims, old_innkeeper:poisoned_crows),
//   slot old_innkeeper (hráč volí, čí verzi jí dá šířit), dezinformace šířená přes spolubydlení (#cut:soldiers:pravna_raiders),
//   aff_havel (Havel už je v hospodě) a #aff:havel.
VAR aff_self = 0
VAR aff_havel = -99
VAR believes = ""
VAR spreads_raiders = false

-> END

=== day1 ===
Pánbůh dej, hostinský! Jak se jmenuju? Ále, to už nevím ani já. Všichni mi říkají Tetka. #reveal:name
Víte, co se povídá? Že starý Matouš otrávil vrány! Proto ho zavřeli. #cut:old_innkeeper:poisoned_crows
* [Otrávil vrány? Kdo to říkal?]
    Švagrová. Nebo sousedka švagrové. Nebo její koza. #aff:self:+1
* [To je hloupost.]
    Hloupost je nevěřit Tetce. #aff:self:-1
- A ta cesta do Pravny! Spadla, protože pod ní Pravňáci kopali stříbro. Sami si ji podkopali! #cut:road:pravna_mine
Já jsem z Pravny, tak to vím. #reveal:faction
A v údolí táboří poutníci. Jdou ke Svaté studánce, stovky jich! Takovou zbožnost jsem neviděla. #cut:soldiers:pilgrims
No a vy, hostinský? Víte, proč toho starého zavřeli?
* [Bral úplatky od Varhoře. #slot:old_innkeeper:took_bribes]
    Úplatky? Hm. To je skoro stejně dobré jako ty vrány. #aff:self:+1
    ~ believes = "bribes"
* [Pravna ho prý zavřela, aby rozdmýchala neklid. #slot:old_innkeeper:pravna_plot]
    Moje Pravna? No… to musím říct všem! #aff:self:+2 #aff:k2:-1
    ~ believes = "plot"
* [Prý otrávil vrány. #slot:old_innkeeper:poisoned_crows]
    Vidíte! Říkala jsem to! #aff:self:+2
    ~ believes = "crows"
* [Tohle stojí v novinách. #slot:old_innkeeper:*]
    V novinách? Tak to bude pravda. Noviny nelžou, to ví každý. #aff:self:+1
* [Nevím, Tetko. A vy to taky nevíte.]
    Já vím všechno. Jenom ne napoprvé. #aff:self:-1
- {aff_havel > -99: Jen ať si ke mně nesedá ten ožrala Havel. Smrdí jak sud. #aff:havel:-1}
No nic, kde je tu teplo?
-> END

=== followup_day2 ===
Ráno moudřejší večera, hostinský! Víte, co se mi zdálo?
Že dneska přijde z hor obr. Varhořský vrah s rukama jak lopaty! #cut
* [Nešiřte to, Tetko. Jsou to jen sny.]
    Sny jsou taky zprávy. Jen je nosí jiné vrány. #aff:self:-1
* [Kdo vám to řekl?]
    Nikdo. Zdálo se mi to. Ale sedí to, ne? #aff:self:+1
- -> END

=== followup_day2_rumor ===
Hostinský! Ten pán z Varhoře mi v noci všechno vysvětlil.
V údolí nejsou poutníci. To je stráž proti pravenským lupičům! Pravna chce přepadnout Varhoř! #cut:soldiers:pravna_raiders
* [To vám řekl Varhořan. Co jiného by asi řekl?]
    Hm… To je pravda. Každý chválí svůj rybník. #aff:self:+1
* [Tak to řekněte všem.]
    Však já už jsem to řekla. Pradleně, kováři a dvěma vránám. #aff:k2:-1
    ~ spreads_raiders = true
- -> END

=== followup_day3 ===
Já si vzpomněla, jak se jmenuju! … Ne. Zase to uteklo.
{believes == "plot": Po celém kraji se teď vypráví, že Matouše zavřela Pravna. Ode mě, samozřejmě.}
{believes == "bribes": Všem povídám, že Matouš bral úplatky. Kovář se divil, že to vím zrovna od hostinského.}
* [Měla byste méně mluvit, Tetko.]
    A kdo by pak mluvil? #aff:self:-1
* [Díky za společnost.]
    Přijdu zas. Vždycky přijdu. #aff:self:+1
- -> END
