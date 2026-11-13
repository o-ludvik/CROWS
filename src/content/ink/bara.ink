// Bára – Varhoř (k1), uprchlá žena desátníka Kubáta. Utekla z tábora v údolí, mužům nevěří.
// Chce: postel, kde ji nikdo nenajde, a nespát na pokoji s mužem.
// Dny: 1 (fronta, poslední), 2 (lounge; vděčná verze, pokud spala s Tetkou), 3 (lounge, pokud přespala i 2. noc).
// Mechaniky: lež o původu (#portrait:lie) a pozdní odhalení frakce, očitá svědkyně (#cut:soldiers:army) – jen když jí hráč získá důvěru,
//   jinak až v lounge 2. den (motivace pozvat ji k pultu uprostřed Samaelova rozhovoru), #item:spear_tip, spolubydlení.
VAR aff_self = 0
VAR trusts = false
VAR told_army = false
VAR hidden = false
VAR escaped = false

-> END

=== day1 ===
Dobrý večer. Jmenuju se Bára. Potřebuju jen postel. Na jednu noc. #reveal:name
Jsem z Čeřavy. Jdu k sestře. #portrait:lie
* [Z Čeřavy? Máte varhořský přízvuk.]
    …Tak vy posloucháte i přízvuky.
    Ano. Jsem z Varhoře. Utekla jsem. #reveal:faction #aff:self:-1
    -> why
* [Postel se najde. Co se vám stalo s okem?]
    Upadla jsem. #portrait:lie
    …Ne. Neupadla. #reveal:faction #aff:self:+1
    -> why
* [Na jednu noc to stojí groš.]
    Groš mám. Víc nic. #aff:self:-1
    -> ending

= why
Můj muž je desátník. Varhořský. Bije, když pije, a pije pořád. #cut
* [Tady jste v bezpečí.]
    To mi říkal každý chlap, kterého jsem potkala. Ale… díky. #aff:self:+1
    ~ trusts = true
    -> army
* [Jestli vás hledá, nechci tu potíže.]
    Nebojte. Ráno budu pryč. #aff:self:-2
    -> ending

= army
Utekla jsem z tábora v údolí. Říkají tomu stavba cesty.
Ale lopatu jsem tam neviděla ani jednu. Stovky mužů s kopím. Celý pluk. #cut:soldiers:army
~ told_army = true
-> ending

= ending
A prosím vás… ať nespím na pokoji s chlapem. #cut
-> END

=== followup_day2 ===
{told_army:
    Dobré ráno. Včera jsem vám říkala o pluku. Tady – tohle jsem vzala, když jsem utíkala. #item:spear_tip
    Hrot kopí. Prý na kopání cest. #cut:soldiers:army
- else:
    Dobré ráno. Včera jsem vám neřekla všechno.
    Utekla jsem z tábora v údolí. Nejsou tam dělníci, jsou tam vojáci. Celý pluk. #cut:soldiers:army
    ~ told_army = true
    Tady, hrot kopí. Ať mi věříte. #item:spear_tip
}
* [Pomůžu vám dostat se do bezpečí.]
    Nevím, jestli můžu věřit. Ale zkusím to. #aff:self:+2
    ~ trusts = true
* [Měla byste se vrátit domů.]
    Domů? K němu? #aff:self:-3
- -> END

=== followup_day2_tetka ===
Ta paní, co si nepamatuje jméno… celou noc mluvila. Prvně za rok jsem se smála. #aff:self:+1
-> followup_day2

=== followup_day3 ===
Hostinský, slyšela jsem vozy. Desátník Kubát jede s posly z Varhoře sem. #cut
* [Schovám vás ve sklepě, dokud neodjedou.]
    Ve sklepě… dobře. Mezi sudy mě hledat nebude. #aff:self:+2
    ~ hidden = true
* [Utečte do Čeřavy. Hned teď.]
    Půjdu. Kdyby se ptal, nikdy jste mě neviděli. #aff:self:+1
    ~ escaped = true
* [Možná by bylo lepší vrátit se k němu.]
    … #aff:self:-5
- -> END
