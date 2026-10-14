// Bohdan – Nilfgaard, voják
VAR accused_mira = false
VAR stress = 0
VAR aff_self = 0
VAR aff_k1 = 0
VAR aff_k2 = 0
VAR aff_k3 = 0

Bohdan, stráž Impéria. Vezu zprávy – a otázky. #reveal:name
Redanie nás obviňuje z vraždy kurýra. Je to výmysl. #cut
* [Mají svědky v černém plášti.]
    Svědky si koupíte za pár grošů. #aff:self:-2 #aff:k1:-1 #stress:+2
* [V Poslu píšou, že vaši u hranice nebyli.]
    Přesně tak! Četl jste nás. #aff:self:+2 #aff:k2:+2 #stress:-1
* [Pašeráci z Fereldenu?]
    To je možné. Ferelden své stezky nehlídá. #aff:k3:-2 #aff:k2:+1 #aff:self:+1 #stress:+1
- Jsem z Nilfgaardu a pyšně to říkám. #reveal:faction
* [Tady se o politice nemluví.]
    Dobrá. Ale ta Mira z Redanie – jestli tu je – lže jako dýchá. #aff:mira:-2 #aff:self:+1 #aff:k1:-1 #stress:+1
    ~ accused_mira = true
* { stress >= 4 } [Nemám náladu na vaše obvinění.]
    Vidím, že jste unavený. Tím hůř – únava dělá chyby. #aff:self:-1 #stress:+2 #cut
* { aff_k2 >= 1 && stress < 5 } [Impérium má v tomto hospodě respekt.]
    Tak to má být. Pak vám řeknu víc. #aff:self:+2 #aff:k2:+1 #stress:-1

* [Mluvte, poslouchám.]
    Mír visí na vlásku. Dávejte pozor, komu nalejete. #cut #aff:self:+2 #aff:k2:+1 #stress:+1
* [Míru máme všichni dost.]
    Pak jste slepý, anebo bohatý. #aff:self:-2 #aff:k2:-1 #stress:+2
* { aff_k1 <= -2 } [Redanie už dávno ztratila čest.]
    Konečně to někdo řekne nahlas. #aff:self:+2 #aff:k1:-2 #aff:k2:+2 #stress:+1
- Smlouva bez pečeti je hadr. A hadr zapaluje války. #cut
* [Pomůžete pečeť najít?]
    Najít? Spíš zjistit, kdo ji zlomil. #aff:self:+1 #aff:k2:+1 #stress:+1
* [Ať se království domluví bez vás.]
    Bez nás se domluví noži. #aff:self:-1 #aff:k1:-1 #aff:k3:-1 #stress:+3
* { stress <= -1 } [Posaďte se. Válka počká na jedno pivo.]
    …Dobrá. Na chvíli. #aff:self:+2 #stress:-2
- Nalejte. Pak půjdu dál – nebo zůstanu, podle vás. #bartender
-> END
