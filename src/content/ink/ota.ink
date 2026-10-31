// PLACEHOLDER STORY
// Ota Hrubý – Kamenec (k2), vozka stříbrné karavany, která spadla s mostem přes Vranku.
// Chce: viníka. Truchlí pro vozku Matěje a hledá, na koho to hodit.
// Dny: 1 (fronta, první host dne), 2 (lounge follow-up, pokud přespal), 3 (fronta, pokud ho hráč 1. noc nevyhodil).
// Mechaniky: slot bridge_cause BEZ fallbacku (výstřižek s jiným tvrzením se odmítne), #cut:<topic>:<claim> + #quest,
//   gated choices přes aff_self / stress, synchronizovaná VAR day, VAR blames čte days.json (rvačka na pokoji s Vojtěchem) a summary.json,
//   den 3: slot crow_reader – motivace pozvat Jitku z lounge uprostřed rozhovoru (předběhnutí).
VAR stress = 0
VAR aff_self = 0
VAR day = 0
VAR blames = ""
VAR promised_calm = false
VAR got_rope = false
VAR blames_reader = ""

-> END

=== day1 ===
Ota Hrubý. Vozka. Teda… byl jsem vozka, dokud jsem měl vůz. #reveal:name #stress:+1
Včera v noci spadl most přes Vranku. I s mým druhým vozem a s Matějem na kozlíku. #quest:bridge
* [To je mi líto. Co vám naleju?]
    Pálenku. A nic neříkejte, dokud ji nevypiju. #aff:self:+1
* [Slyšel jsem. Celé sedlo o tom mluví.]
    Mluví. Mluvit umí každý. Tahat Matěje z řeky nikdo. #aff:self:-1 #stress:+1
- Vezl jsem stříbro do Kamence. Výplatu pro horníky. Teď ho má Vranka. #reveal:faction
Lukovinští brali mostné deset let a lana nevyměnili ani jednou. #cut:bridge_cause:k3_rot #quest:bridge
Tak mi řekněte, hostinský – vy čtete noviny. Kdo za to může?
* [Velesští. Lukovinský posel píše o vorařích se sekerami. #slot:bridge_cause:k1_axe]
    Velesští! Ti by podřízli i vlastní matku, kdyby z ní byl vor. #aff:self:+2 #aff:k1:-2 #aff:k2:+1 #stress:+1
    ~ blames = "k1"
* [Lukovina. Lana byla shnilá. #slot:bridge_cause:k3_rot]
    Přesně tak. Deset let mýta a ani jeden nový provaz. #aff:self:+2 #aff:k3:-2 #aff:k2:+1
    ~ blames = "k3"
* [Váš lom. Ten den tam prý střílel prach. #slot:bridge_cause:k2_blasting]
    Cože? Já ten prach vozím, hostinský! Ten den se v lomu nestřílelo. #aff:self:-3 #aff:k2:-1 #stress:+3
    ~ blames = "k2"
* [Ještě je brzo soudit.]
    Brzo? Matěj leží v řece a vy mi říkáte brzo. #aff:self:-1 #stress:+2
* [Nevím. Ale zjistím to.]
    Tak to zjistěte rychle. Než to zjistí vojáci. #aff:self:+1 #stress:+1
- Dneska tu prý máte jen jeden stůl.
Jestli si ke mně přisedne někdo z Velesie, nevím, jestli udržím ruce na stole. #cut
* [Tady se nikdo nepere. Ani dneska.]
    Uvidíme. #aff:self:-1 #stress:+1
* {aff_self >= 1} [Kdyby bylo zle, přijďte si sednout k pultu.]
    …Díky. To je od vás slušné. #aff:self:+2 #stress:-1
    ~ promised_calm = true
* {stress >= 4} [Hlavně mi tu nic nerozbijte. Mám dost starostí.]
    Vy máte starosti? #aff:self:-2 #stress:+2
- -> END

=== followup_day2 ===
Jdu dolů do rokle. Musím najít vůz – a Matěje, jestli ho řeka vrátila. #quest:bridge
V noci jsem slyšel vaše vrány. Kdo posílá dopisy o půlnoci, hostinský? #cut #quest:crows
* [Nikdo. Vrány v noci nelétají.]
    Tyhle létaly. Slyšel jsem křídla nad střechou. #aff:self:-1 #stress:+1
* [Vezměte si ode mě lano a lucernu.]
    To je víc, než mi kdy dala Lukovina za mostné. Díky. #aff:self:+2 #aff:k2:+1 #stress:-1
    ~ got_rope = true
- Vrátím se. A pak si promluvíme o tom, kdo věděl, kdy pojedu.
-> END

=== day3 ===
{day >= 3: Tři dny jsem nespal, hostinský. Tři dny.}
{got_rope: Vaše lano mi zachránilo krk. Dolů do rokle je to dál, než vypadá.}
Našel jsem vůz, hostinský. Truhly ležely v bahně. #quest:bridge #stress:+1
Prázdné. A zámky celé – otevřené klíčem. #cut #quest:bridge
Někdo je vybral dřív, než most spadl. Někdo, kdo věděl, kdy pojedeme.
O té cestě jsem psal jen jednou. Vaší vránou. Z téhle hospody. #quest:crows #stress:+1
Tak kdo čte vaši poštu?
* [Ten kramář, Mikuláš. Viděli ho kopírovat pečeť. #slot:crow_reader:mikulas]
    Kramář… Ten se mě předevčírem ptal, kolik vezu. Najdu ho. #aff:self:+2 #aff:k2:+1 #aff:mikulas:-2
    ~ blames_reader = "mikulas"
* [Lukovinští špehové. #slot:crow_reader:k3_spies]
    Zase Lukovina. Jednou jim to někdo spočítá. #aff:self:+1 #aff:k3:-2 #stress:+1
    ~ blames_reader = "k3"
* [Vaši vlastní. Kamenečtí agenti. #slot:crow_reader:k2_spies]
    Naši? Kdo by kradl vlastní výplatu? #aff:self:-2 #aff:k2:-1 #stress:+2
    ~ blames_reader = "k2"
* [Nikdo. Vrány nikdo nečte.]
    Pak jsem asi blázen. #aff:self:-2 #stress:+2
* [Nevím. Ale dneska to zjistím.]
    Budu tady. Celý den. #aff:self:+1
- -> END
