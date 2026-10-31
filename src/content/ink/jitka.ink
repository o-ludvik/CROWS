// PLACEHOLDER STORY
// Jitka – Lukovina (k3), písařka lukovinského kancléře. Jede do Kamence dokázat, že "kancléřův dopis" je podvrh.
// Chce: důkaz a postel daleko od Kamenečanů (napětí s Bertoldem u stolu i na pokoji).
// Dny: 2 (fronta), 3 (lounge: pokud spala na pokoji s Mikulášem, viděla ho v noci kopírovat pečeť;
//   jinak obyčejné rozloučení se stopou o černém vosku).
// Mechaniky: zdroj tvrzení letter:forged (proti Bertoldově verzi), gated volba přes aff_k3,
//   follow-up odemčený spolubydlením (roommates), zdroj crow_reader:mikulas → motivace pozvat ji během Otova rozhovoru 3. den.
VAR stress = 0
VAR aff_self = 0
VAR aff_k3 = 0
VAR saw_mikulas = false

-> END

=== day2 ===
Jitka, písařka. Jedu do Kamence vysvětlovat jeden dopis. #reveal:name #quest:crows
Kancléř Lukoviny ho nikdy nepsal. Pečetíme zeleným voskem – tenhle je černý. #cut:letter:forged #quest:crows
* [Odkud jste?]
    Z Lukoviny, samozřejmě. Z kancléřovy kanceláře. #reveal:faction #aff:self:+1
* [Kamenec vám to neuvěří.]
    Já vím. Proto potřebuju důkaz, ne vosk. #aff:self:-1 #stress:+1
- Ten dopis šel přes vaše vrány. Kdo k nim má přístup, hostinský? #quest:crows
* [Jen já. A klíč nosím u sebe.]
    Pak buď lžete, nebo vám někdo klíč půjčil. #aff:self:-1 #stress:+2
* [Hosté chodí kolem vraníku každý den.]
    Takže kdokoli. To je horší. #aff:self:+1 #stress:+1
* {aff_k3 >= 2} [Lukovině věřím. Pomůžu vám.]
    To se teď moc často neslyší. Děkuju. #aff:self:+2 #aff:k3:+1 #stress:-1
- Potřebuju se dneska vyspat. Někde, kde nebude nikdo z Kamence.
-> END

=== followup_day3_room ===
Musím vám něco říct. Potichu. #stress:+1
V noci jsem se probudila a ten kramář – Mikuláš – seděl u svíčky nad mými papíry. #quest:crows
Obkresloval kancléřovu pečeť. Do kousku černého vosku. #cut:crow_reader:mikulas #quest:crows
~ saw_mikulas = true
* [Jste si jistá?]
    Viděla jsem ho, jako vidím vás. Když jsem se pohnula, sfoukl svíčku. #aff:self:+1
* [Proč jste nekřičela?]
    Protože jsem sama v cizím hostinci a on má nůž na chleba. #aff:self:-1 #stress:+1
- Jestli je to on, kdo čte vaše vrány… pak ten dopis napsal on.
-> END

=== followup_day3 ===
Dobré ráno. Vyspala jsem se, díky. #aff:self:+1
Ještě jedna věc: černý vosk v sedle prodává jen jeden člověk. Ten kramář z Velesie. #cut #quest:crows
* [To ještě nic nedokazuje.]
    Ne. Ale je to stopa. #aff:self:-1
* [Dám si na něj pozor.]
    Já taky. #aff:self:+1
- -> END
