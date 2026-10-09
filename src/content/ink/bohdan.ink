// Bohdan – Nilfgaard, voják
VAR accused_mira = false

Bohdan, stráž Impéria. Vezu zprávy – a otázky. #reveal:name
Redanie nás obviňuje z vraždy kurýra. Je to výmysl. #cut
* [Mají svědky v černém plášti.]
    Svědky si koupíte za pár grošů. #aff:self:-2 #aff:k1:-1
* [V Poslu píšou, že vaši u hranice nebyli.]
    Přesně tak! Četl jste nás. #aff:self:+2 #aff:k2:+2
* [Pašeráci z Fereldenu?]
    To je možné. Ferelden své stezky nehlídá. #aff:k3:-2 #aff:k2:+1 #aff:self:+1
- Jsem z Nilfgaardu a pyšně to říkám. #reveal:faction
* [Tady se o politice nemluví.]
    Dobrá. Ale ta Mira z Redanie – jestli tu je – lže jako dýchá. #aff:mira:-2 #aff:self:+1 #aff:k1:-1
    ~ accused_mira = true

* [Mluvte, poslouchám.]
    Mír visí na vlásku. Dávejte pozor, komu nalejete. #cut #aff:self:+2 #aff:k2:+1
* [Míru máme všichni dost.]
    Pak jste slepý, anebo bohatý. #aff:self:-2 #aff:k2:-1
- Smlouva bez pečeti je hadr. A hadr zapaluje války. #cut
* [Pomůžete pečeť najít?]
    Najít? Spíš zjistit, kdo ji zlomil. #aff:self:+1 #aff:k2:+1
* [Ať se království domluví bez vás.]
    Bez nás se domluví noži. #aff:self:-1 #aff:k1:-1 #aff:k3:-1
- Nalejte. Pak půjdu dál – nebo zůstanu, podle vás. #bartender
-> END
