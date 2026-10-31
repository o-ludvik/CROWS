// PLACEHOLDER STORY
// Mikuláš – Velesie (k1), veselý kramář s inkousty a pečetním voskem. Ve skutečnosti čte (a přepisuje) vraní poštu
//   a prodal převozníkovi Šeborovi, kdy pojede stříbrná karavana.
// Chce: pokoj blízko vraníku a koupit si vránu.
// Dny: 2 (fronta), 3 (lounge – když ho hráč nepozve, po zavření hospody odejde a uteče; dopad ve shrnutí).
// Mechaniky: falešná stopa crow_reader:k3_spies, slot crow_reader bez fallbacku (pasuje jen jeho jméno nebo jeho vlastní lež),
//   odchod z lounge s dopadem na závěr, spolubydlení s Jitkou odemyká její follow-up.
VAR stress = 0
VAR aff_self = 0
VAR knows_crows = false
VAR confessed = false
VAR bought_crow = false

-> END

=== day2 ===
Mikuláš, kramář! Inkousty, pera, pečetní vosk všech barev. Pro vás za polovic. #reveal:name
* [Nic nepotřebuju.]
    Každý něco potřebuje. Třeba klid. Ten vám prodat nemůžu. #aff:self:-1
* [Pečetní vosk? Jaké barvy?]
    Červený pro Velesii, modrý pro Kamenec, zelený pro Lukovinu. A černý – ten se teď nosí. #cut #quest:crows #aff:self:+1
- Slyšel jsem, že máte vrány. Krásná zvířata. Kolik dopisů denně odnesou? #quest:crows
* [To je moje věc.]
    Samozřejmě, samozřejmě. #aff:self:-1 #stress:+1
* [Tak deset. Proč?]
    Jen tak. Obchodník počítá všechno. #aff:self:+1 #stress:+1
    ~ knows_crows = true
- Mimochodem – ten dopis, co ho otiskli v Kamenci… Lukovinští špehové čtou poštu celého sedla, to ví každý. #cut:crow_reader:k3_spies #quest:crows
* [Odkud vlastně jste?]
    Z Velesie. Přes hory. Odevšad. #reveal:faction
* [Věříte všemu, co se povídá?]
    Věřím tomu, co se prodá. #aff:self:+1
- Dáte mi pokoj pod střechou? Blízko vraníku, ať je slyším. Uklidňují mě.
-> END

=== followup_day3 ===
Odcházím, hostinský. Obchody volají. Jen jednu věc – prodáte mi jednu vránu? Dobře zaplatím. #quest:crows
* [Kdo čte moji poštu, Mikuláši? #slot:crow_reader:mikulas]
    … #stress:+2
    Vidím, že jste mluvil s tou písařkou. Dobrá. Ano, četl jsem. A občas jsem něco dopsal. #aff:self:-3 #aff:k1:-1
    Platí mi dobře. A převozník Šebor platil nejlíp – chtěl vědět, kdy pojede stříbro. #cut #quest:bridge
    ~ confessed = true
* [Lukovinští špehové, jak jste říkal. #slot:crow_reader:k3_spies]
    Přesně tak! Vidíte, jak se vyplácí mít informace. #aff:self:+2 #aff:k3:-1
* [Vránu neprodám.]
    Škoda. Opravdu škoda. #aff:self:-1
* [Tady máte. Jednu.]
    Výborně. Uvidíte, že se vám to vyplatí. #aff:self:+2 #stress:+1
    ~ bought_crow = true
- -> END
