// Eliška – Ferelden, učenkyně
VAR believes_murder = false
VAR stress = 0
VAR aff_self = 0
VAR aff_k1 = 0
VAR aff_k2 = 0
VAR aff_k3 = 0

Jsem Eliška, učenka z Fereldenu. Zkoumám stopy nad průsmykem. #reveal:name
O kurýrovi píšou všichni jinak. Já měřím skály. #cut
* [Kronika tvrdí, že to byl blesk.]
    Stopa po blesku je čerstvá – to ano. #reveal:faction #aff:self:+2 #aff:k3:+2 #stress:-1
* [A co ti pašeráci s olejem?]
    Pašeráci jsou výhodný příběh pro Nilfgaard. #aff:k2:-2 #aff:k3:+1 #aff:self:+1 #stress:+1
* [Blesk nezlomí pečeť smlouvy.]
    …To je pravda. Pečeť zlomil člověk. #aff:self:-1 #aff:k1:+1 #aff:k2:+1 #cut #stress:+2
    ~ believes_murder = true
* { stress >= 3 && aff_k3 >= 0 } [Nemám čas na akademické hádky – vražda, nebo ne?]
    Vražda. Ano. Teď už to řeknu nahlas. #aff:self:+1 #aff:k3:+1 #stress:+2 #cut
    ~ believes_murder = true

- Půjdu zítra nahoru měřit znovu – jestli mě vojáci pustí.
* [Ferelden chce klid. To je správně.]
    Ano. Válka spálí i moje poznámky. #reveal:faction #aff:self:+2 #aff:k3:+2 #stress:-2
* [Redanie má svědky.]
    Svědci vidí to, co jim řeknou. #aff:k1:-1 #aff:self:+1 #aff:k3:+1 #stress:+1
* [Nilfgaard popírá všechno.]
    Impéria vždycky popírají. #aff:k2:-1 #aff:self:+1 #stress:+1
* { aff_self >= 2 && stress < 4 } [Vaše měření může zachránit průsmyk.]
    To doufám. Díky, že to řeknete. #aff:self:+2 #aff:k3:+1 #stress:-1 #cut
- Jestli tu bude Mira, řekněte jí, ať mi popis těch luceren. #aff:mira:+1
A Bohdana ať držíte dál ode mě – voják a měření se nesnese. #aff:bohdan:-1 #cut
* [Pomůžu, jak budu moct.]
    Pak jste vzácný hostinský. #aff:self:+2 #aff:k3:+1 #stress:-1
* [Já jsem jen u piva.]
    I pivo je dnes politika. #aff:self:-1 #stress:+1
* { stress <= 0 } [Sedněte si ke krbu. Poznámky počkají.]
    …Ano. Na chvíli. #aff:self:+1 #stress:-2
- Na zdraví – a ať pečeť někde leží celá. #bartender #aff:self:+1
-> END
