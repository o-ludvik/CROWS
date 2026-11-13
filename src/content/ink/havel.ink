// Havel, „Starý mládenec“ – Čeřava (k3). Pijan a vtipálek, ke každému laskavý; hráči radí, jak to v hospodě chodí.
// Chce: pivo, společnost a aby se nový hostinský nedopustil Matoušových chyb. Tetku miluje dráždit, Samaela nesnese.
// Dny: 1 (fronta, první host hry), 2 (lounge; tajná verze, pokud spal na pokoji s Radomilem), 3 (lounge, pokud přespal i 2. noc).
// Mechaniky: úvod (výstřižky, nástěnka, usazení, lounge – řečeno ve fikci), #item (placatka), #cut:old_innkeeper:took_bribes,
//   follow-up podmíněný spolubydlením (opil Radomila → #cut:soldiers:army), #aff:<guestId> na Tetku.
VAR aff_self = 0
VAR aff_tetka = -99
VAR told_bribes = false
VAR overheard = false
VAR warned_cerava = false

-> END

=== day1 ===
Á, nový hostinský! Havel, Starý mládenec. Ženu jsem nikdy neměl, zato žízeň pořád. #reveal:name
Jsem z Čeřavy, z vesnice pod průsmykem. Sedávám tu u pultu třicet let. #reveal:faction
* [Vítejte. Co si dáte?]
    Pivo. A k tomu radu zdarma. #aff:self:+1
* [Třicet let? To už tu patříte k nábytku.]
    Ha! Akorát že nábytek nepije. #aff:self:+2
- Každé ráno vlítnou tím kulatým oknem vrány. Z každého království jedna. Ty svitky na stole – to jsou noviny.
Rada první: co je důležité, to si vystřihněte. A co se k sobě hodí, přišpendlete na nástěnku a svažte šňůrkou. #cut
Rada druhá: každá vrána krákorá tak, jak jí pán zapískal. #cut
* [Co se stalo s mým předchůdcem?]
    Se starým Matoušem? Zavřeli ho. Před měsícem.
    Bral měšce od Varhoře, hostinský. Viděl jsem je pod pultem, těžké jako kočky. #cut:old_innkeeper:took_bribes
    ~ told_bribes = true
* [Nějaké novinky z cest?]
    Cesta do Pravny je zavalená. Prý skála. Skála, která spadne zrovna tam, kudy vede jediná cesta… #cut
- Rada třetí, nejdůležitější: kdo sedí s kým a kdo spí s kým na pokoji, to si lidi pamatujou déle než pivo. #cut
* [Díky, Havle. Budu si to pamatovat.]
    Nebudete. Nikdo si nic nepamatuje. Proto máte tu nástěnku. #aff:self:+1
* [Radši se starejte o svůj džbán.]
    Já se o něj starám celý život. #aff:self:-1
- Na, placatka. Pro kuráž. Dneska ji budete potřebovat. #item:havel_flask
-> END

=== followup_day2 ===
Dobré ráno! Spal jsem jak dřevo. Jak poleno. Jak celý les.
Rada na dnešek: kdo tu přespí a má co říct, čeká ráno vedle u krbu. Když si ho nezavoláte, přijde k pultu sám – až na konec. #cut
{aff_tetka > -99: Mimochodem, Tetka včera povídala, že spím ve stoje jako kůň. Kéž by. #aff:tetka:+1}
* [Dneska přijde někdo z hor, říkají. Obr.]
    Obr? Tak to se schovám pod stůl. Mám tam zásoby. #aff:self:+1
* [Neměl byste už jít domů?]
    Domů? Tady je víc domova než doma. #aff:self:-1
- -> END

=== followup_day2_secret ===
Hostinský… pojďte blíž. Ten váš Varhořan se mnou spal na pokoji.
Nalil jsem mu z placatky. Pak ještě jednou. A pak začal mluvit.
Řekl: „Zítra tu bude celý pluk. Lopaty máme jen na vozech navrch, aby to bylo vidět.“ #cut:soldiers:army
~ overheard = true
To nejsou dělníci, hostinský. To je vojsko.
* [Tohle nikomu neříkejte.]
    Já? Já neříkám nic nikomu. Jen vám. A pivu. #aff:self:+1
* [Jste si jistý? Byl jste opilý.]
    Opilý jsem byl. Ale on taky. A opilí lžou hůř než střízliví. #aff:self:-1
- -> END

=== followup_day3 ===
Tak a dost. Dneska jdu domů do Čeřavy.
{overheard: Pořád mi v hlavě zní ten pluk.} U nás se nikdo do ničeho míchat nechce. Ale já jsem Čeřava taky, ne?
* [Řekněte doma, co víte. Ať to slyší rada.]
    Starý opilec před radou… No dobře. Kvůli vám. #aff:self:+2 #aff:k3:+1
    ~ warned_cerava = true
* [Jděte domů a odpočiňte si.]
    To umím nejlíp. #aff:self:+1
- Kdyby se něco dělo, víte, kde mě najít. U pultu, samozřejmě.
-> END
