// Radek – Redanie, obchodník
VAR aff_self = 0
VAR aff_k1 = 0
VAR aff_k2 = 0
VAR aff_k3 = 0
VAR stress = 0
VAR aff_vlasta = 0

Radek, obchodník. Pivo, prosím – a klid, jestli se dá. #reveal:name
{ aff_self < 0:
    Doufám, že tentokrát nebude rozředěné. #aff:self:+1 #stress:+1
- else:
    Prý tu točíte nejlepší pivo na hřebenu. #aff:self:+1 #stress:-1
}
Kurýra jsem neznal, ale pečeť smlouvy – tu ano. Bez ní se zboží nehne. #cut
* [Redanie viní Nilfgaard.]
    { aff_k2 < 0:
        A správně. Z Nilfgaardu nikdy nic dobrého nepřišlo. #aff:self:+2 #aff:k2:-2 #aff:k1:+1 #stress:+1
    - else:
        Možná. Ale důkazů je málo. #aff:self:+1 #aff:k2:-1 #stress:+1
    }
* [Věřím, že to nebyla vaše strana.]
    Konečně rozumný člověk. #aff:self:+2 #aff:k1:+2 #stress:-1
* [Ferelden mluví o blesku.]
    Blesk nezlomí pečeť. To udělá nůž. #aff:self:+1 #aff:k3:-1 #aff:k1:+1 #stress:+2
* { stress >= 4 } [Nemám čas na obchody – pečeť, nebo válka?]
    Válka. Jestli pečeť nenajdeme. #aff:self:+1 #aff:k1:+1 #stress:+2 #cut
- Jsem z Redanie, a nestydím se za to. #reveal:faction
Kdyby tu byla Vlasta z Nilfgaardu, možná by řekla víc o těch sudích u cesty. #aff:vlasta:+1 #cut
* [Vlastu znám – aspoň z řečí.]
    Pak víte, že není jen pašerák. #aff:vlasta:+1 #aff:self:+1 #stress:-1
* [O pašeráky nestojím.]
    Moudré. Ale olej u stezky někdo nechal. #aff:self:-1 #aff:k2:-1 #stress:+1
* [Řekněte jí, ať přijde – jestli přijde.]
    Předám, uvidím-li ji. #aff:vlasta:+2 #aff:k2:+1 #aff:self:+1 #stress:+1
* { aff_k1 >= 1 && stress < 5 } [Redanie potřebuje klidný průsmyk – pomůžu.]
    Pak jsme spojenci, aspoň na dnešek. #aff:self:+2 #aff:k1:+2 #stress:-2
* { stress <= -2 } [Sedněte, pijte. Zboží počká.]
    Hostinský, který rozumí obchodu. #aff:self:+2 #stress:-1
- Na zdraví, hostinský. Ať vás zítřek nezaskočí. #bartender #aff:self:+1
-> END
