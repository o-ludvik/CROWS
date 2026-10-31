// PLACEHOLDER STORY
// Hana – Lukovina (k3), dcera mostného. Byla u mostu, když praskl, a ví, že lano bylo nařezané pilou.
// Chce: přežít a aby jí někdo uvěřil. Bojí se, že Lukovinu (a ji) obviní ze shnilých lan.
// Dny: 1 (fronta), 2 (lounge: follow-up s `when` jen pokud řekla o pile; jinak "tichá" verze),
//   3 (lounge, jen pokud ji hráč 2. den pozval a dal jí postel).
// Mechaniky: hlavní svědek tématu bridge_cause (#cut:bridge_cause:sawn a ferry_saw), frakce odhalená až později
//   (výstřižky mají do té doby "?"), gated volba přes stress, odchod z lounge 2. den = zmizí (noviny dne 3 + závěr),
//   předběhnutí: Bertold se na ni 2. den ptá (aff_bertold > -99 = Bertold už je v hospodě).
VAR stress = 0
VAR aff_self = 0
VAR aff_bertold = -99
VAR told_saw = false
VAR gave_ferry_saw = false
VAR will_testify = false
VAR stands_with_you = false

-> END

=== day1 ===
Hana. Jen Hana. Nemáte tu místo u kamen? Celá se třesu. #reveal:name
* [Sedněte si. Co se vám stalo?]
    Byla jsem včera u mostu. Když praskl. #quest:bridge #aff:self:+1
* [Kamna jsou pro hosty, kteří platí.]
    Zaplatím. Mám pár grošů. #aff:self:-2 #stress:+1
    Byla jsem u mostu, když praskl. #quest:bridge
- Všichni teď říkají, že to Lukovina nechala shnít. Že mostný nic nedělal.
To není pravda. Lana jsme natírali dehtem každé jaro. #cut #quest:bridge
* [Kdo jste, Hano? Odkud jste?]
    -> who
* {stress < 6} [Věřím vám. Co jste viděla?]
    -> saw
* [Noviny píšou něco jiného.]
    Noviny nebyly u mostu. Já ano. #aff:self:-1 #stress:+1
    -> partial

= who
Jsem dcera mostného. Z Lukoviny. Teď víte, proč se bojím. #reveal:faction #aff:self:+1 #stress:+1
-> saw

= saw
Lano nepřetrhla voda ani sekera. Bylo nařezané pilou – rovně, do půlky. Viděla jsem ten řez. #cut:bridge_cause:sawn #quest:bridge #aff:self:+1
~ told_saw = true
A v noci předtím svítila lucerna dole u převozu. Převozník nikdy nesvítí, olej je drahý. #cut #quest:bridge
-> ask

= partial
Lano… bylo divné. Víc vám neřeknu, dokud nebudu vědět, komu to řeknete. #cut #quest:bridge
-> ask

= ask
* [Řeknu to, komu bude potřeba.]
    Tak to radši nikomu. Zatím. #aff:self:-1 #stress:+1
* [Zůstane to mezi námi.]
    Děkuju. Potřebuju se dneska vyspat pod střechou. #aff:self:+2 #aff:k3:+1 #stress:-1
- -> END

=== followup_day2 ===
Nemohla jsem spát. Ráno jsem šla k mostu – k tomu, co z něj zbylo. #quest:bridge
Přinesla jsem kus lana. Podívejte se na ten řez: rovný, čistý. A v něm uvízlé zuby z pily.
Takovou pilu má jen dílna u převozu. Pan Šebor si ji nechal kovat v Kamenci. #cut:bridge_cause:ferry_saw #quest:bridge
~ gave_ferry_saw = true
* {aff_bertold > -99} [Musíte to říct kapitánovi z Kamence. Je tady.]
    Kapitánovi? Ten mě zavře dřív, než dořeknu větu. #stress:+1
    Ale dobře. Když u toho budete vy. #aff:self:+1 #aff:bertold:+1
    ~ will_testify = true
* [Schovejte to. Ještě nevíme, komu věřit.]
    Schovám. Ale dlouho to neudržím. Šebor ví, že jsem tam byla. #aff:self:+1 #stress:+1
* [Šebor? Ten z převozu? To je vážné obvinění.]
    Já vím. Proto to říkám jen vám. #aff:self:-1
- Jestli se mi něco stane, hostinský… ten kus lana je pod mou postelí. #cut #quest:bridge
-> END

=== followup_day2_quiet ===
Ještě jsem tady. Nevěděla jsem, kam jít. #quest:bridge
Včera jsem vám neřekla všechno. Lano bylo nařezané. Pilou. #cut:bridge_cause:sawn #quest:bridge
~ told_saw = true
* [Proč jste to neřekla hned?]
    Protože jste se tvářil, jako byste mi nevěřil. #aff:self:-1 #stress:+1
* [Děkuju, že to říkáte teď.]
    Někomu jsem to říct musela. #aff:self:+2
- Dneska jdu domů. Přes převoz. Jiná cesta není. #stress:+1
-> END

=== followup_day3 ===
Dneska jsem poprvé spala celou noc. #aff:self:+1
{will_testify: Kapitán si ode mě vzal ten kus lana. Prý se podívá do dílny u převozu.}
{gave_ferry_saw == false:
    Ještě jedna věc… ty zuby v řezu. Takovou pilu má jen dílna u převozu. #cut:bridge_cause:ferry_saw #quest:bridge
    ~ gave_ferry_saw = true
}
Šebor má prý dneska přijít sem. Platí tu vždycky stříbrem – kamenckým. #cut #quest:bridge
* [Pomůžete mi ho usvědčit?]
    Když budete chtít, budu stát vedle vás. #aff:self:+2 #aff:k3:+1
    ~ stands_with_you = true
* [Měla byste odejít, než přijde.]
    Máte pravdu. Ale už nechci utíkat. #aff:self:+1 #stress:+1
- -> END
