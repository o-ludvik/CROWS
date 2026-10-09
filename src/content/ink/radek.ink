// [placeholder] Radek – Království A, uses affinity sync
VAR aff_self = 0
VAR aff_k2 = 0

Radek, dřevař. Pivo, prosím. #reveal:name
{ aff_self < 0:
    Doufám, že tentokrát nebude rozředěné.
- else:
    Prý tu točíte nejlepší pivo na hřebenu.
}
Lesy u průsmyku jsme dlouho kácely my, chlapi z Áčka. #reveal:faction
Ten požár nebyl od nás. Nikdo z nás tam ten den nebyl. #cut
* [Vaši sousedé tvrdí opak.]
    Sousedi tvrdí ledacos. #aff:self:-2
    { aff_k2 < 0: A z Béčka nikdy nic dobrého nepřišlo. }
* [Věřím vám.]
    Konečně rozumný člověk. #aff:self:+2 #aff:k1:+1
- Kdyby tu byla Vlasta z Béčka, potvrdila by vám to. #aff:vlasta:+1
Na zdraví. #bartender
-> END
