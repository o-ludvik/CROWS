// PLACEHOLDER STORY
// Šebor – Lukovina (k3), převozník přes Vranku. Nařízl most, aby lidé museli platit za převoz, a vybral truhly
//   kamenecké karavany (věděl od Mikuláše, kdy pojede). Platí kameneckým stříbrem.
// Chce: aby se mluvilo o shnilých lanech a ne o převozu.
// Dny: 3 (fronta, poslední host dema).
// Mechaniky: vyvrcholení linky Most přes Vranku – slot bridge_cause s konkrétními tvrzeními (ferry_saw = konfrontace,
//   sawn = znervózní) i s fallbackem `*`; #bartender řádek; úplatek vs. odhalení rozhoduje závěr (summary.json).
VAR stress = 0
VAR aff_self = 0
VAR nervous = false
VAR exposed = false
VAR bribed = false

-> END

=== day3 ===
Šebor, převozník z Vranky. Teď, když není most, mám práce nad hlavu. #reveal:name #quest:bridge
Platím stříbrem. Kameneckým, jak vidíte – lidi teď platí čímkoli. #cut #quest:bridge
Prý se tu vyptávají na ten most. Smutná věc. Shnilá lana, říkám já. #cut:bridge_cause:k3_rot #quest:bridge
* [Odkud jste?]
    Z Lukoviny, samozřejmě. Převoz je lukovinský odjakživa. #reveal:faction
* [Shnilá lana? Ne každý to říká.]
    Lidi říkají ledacos. #stress:+1
- Tak co vy, hostinský? Proč podle vás spadl most?
* [Někdo ho nařezal. A ta pila visí ve vaší dílně. #slot:bridge_cause:ferry_saw]
    -> confront
* [Lano bylo nařezané pilou. #slot:bridge_cause:sawn]
    Pilou? Pily má v sedle každý druhý. Mě z toho nevinte. #aff:self:-1 #stress:+2
    ~ nervous = true
    -> close
* [Tohle psaly noviny. #slot:bridge_cause:*]
    Vidíte. Noviny vědí víc než my dva. #aff:self:+1
    -> close
* [Nevím a nechci vědět.]
    Moudrý hostinský. Takových je málo. #aff:self:+2
    -> close

= confront
Pila s vylomenými zuby, pane Šebore. A truhly vybrané klíčem. #bartender
…Kolik chcete? #stress:+3 #aff:self:-2
* [Nic. Vrátíte stříbro a odpovíte kapitánovi.]
    Dobře. Dobře. Ale kramář Mikuláš mi prodal, kdy pojede karavana. Jestli padnu já, padne i on. #cut:crow_reader:mikulas #quest:crows #aff:k2:+2 #aff:k3:+1 #aff:k1:+1
    ~ exposed = true
* [Polovinu stříbra. A zapomenu, co jsem viděl.]
    Rozumný člověk. #aff:self:+3 #stress:+2
    ~ bribed = true
- -> close

= close
Nalijte mi. Dlouhý den.
-> END
