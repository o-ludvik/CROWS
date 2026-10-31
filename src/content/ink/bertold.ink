// PLACEHOLDER STORY
// Bertold – Kamenec (k2), kapitán kamenecké stráže. Veze "dopis lukovinského kancléře", který prošel vraní poštou.
// Chce: potvrzení, že dopis je pravý (= záminka proti Lukovině), a vědět o mostě víc než Lukovina.
// Dny: 2 (fronta, první host dne), 3 (lounge s `when`: jen když ho hráč navedl na převoz).
// Mechaniky: hlavní slot konfliktních zdrojů (letter: genuine z Velesie+Kamence vs. forged z Lukoviny+Jitky) –
//   volba šíří verzi jednoho království, mění afinity a noviny dne 3; slot bridge_cause s `*` a s ferry_saw,
//   který má jen Hana v lounge → hráč ji pozve uprostřed rozhovoru (předběhnutí). VAR letter_verdict a suspects_ferry čtou
//   days.json, scrolls.json (podmíněné články) a summary.json.
VAR stress = 0
VAR aff_self = 0
VAR letter_verdict = ""
VAR suspects_ferry = false
VAR knows_saw = false

-> END

=== day2 ===
Kapitán Bertold, stráž Kamence. Nejsem tu na pivo. #reveal:name #reveal:faction #stress:+1
Vezu dopis, který prošel vaší vraní poštou. Psal ho prý lukovinský kancléř. #quest:crows
„Lukovina za most platit nebude. Ať se Kamenec udusí vlastním stříbrem.“ #cut:letter:genuine #quest:crows
Takže, hostinský: je ten dopis pravý?
* [Pravý. I Velesský hlásník ho otiskl. #slot:letter:genuine]
    Jak jsem si myslel. Lukovina chce válku. Dostane ji. #aff:self:+2 #aff:k2:+2 #aff:k3:-2 #stress:+2
    ~ letter_verdict = "genuine"
* [Podvrh. Pečeť má špatný vosk. #slot:letter:forged]
    Špatný vosk? … To tvrdí Lukovinští. Ale zapamatuju si to. #aff:self:-1 #aff:k2:-1 #aff:k3:+2 #stress:+1
    ~ letter_verdict = "forged"
* [Vrány dopisy nosí. Nečtou je.]
    Takže nevíte nic. Užitečné. #aff:self:-1 #stress:+1
- Ještě něco. Dole ve vsi se povídá, že tu včera přespala dcera mostného. #quest:bridge
Jestli tu ještě je, chci s ní mluvit. A jestli něco ví, chci to vědět já – dřív než Lukovina.
Tak co se stalo s tím mostem?
* [Nařezali ho. Takovou pilu má jen dílna u převozu. #slot:bridge_cause:ferry_saw]
    Dílna u převozu… u toho lukovinského převozníka? Tu si v noci prohlédnu. #aff:self:+2 #aff:k3:-1 #stress:-1
    ~ suspects_ferry = true
* [Lano bylo nařezané. Pilou. #slot:bridge_cause:sawn]
    Pilou. Takže úmysl. Ale čí? #aff:self:+1
    ~ knows_saw = true
* [Lukovinští ho nechali shnít. #slot:bridge_cause:k3_rot]
    To říká i naše rada. Dobře. #aff:self:+1 #aff:k3:-1 #aff:k2:+1
* [Tohle stojí v novinách. #slot:bridge_cause:*]
    Noviny čtu taky. Chci něco, co v nich není. #aff:self:-1 #stress:+1
* [Nevím, kapitáne.]
    Pak mi nejste k ničemu. #aff:self:-2 #stress:+1
- -> END

=== followup_day3 ===
Byl jsem v noci u převozu. Dílna zamčená, okno ne. #quest:bridge
Pila tam visí. Chybí jí tři zuby. #cut:bridge_cause:ferry_saw #quest:bridge
Šebor má dneska přijít k vám. Až přijde, chci být u toho.
* [Dobře. Ale v mé hospodě nikoho nezatýkejte.]
    Uvidíme, co řekne. #aff:self:+1 #stress:+1
* [Nechte to na mně. Promluvím s ním sám.]
    Jak chcete. Ale dveře budu hlídat. #aff:self:+1 #aff:k2:+1
- -> END
