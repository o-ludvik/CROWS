// Eliška – Ferelden, učenkyně
VAR believes_murder = false

Jsem Eliška, učenka z Fereldenu. Zkoumám stopy nad průsmykem. #reveal:name
O kurýrovi píšou všichni jinak. Já měřím skály. #cut
* [Kronika tvrdí, že to byl blesk.]
    Stopa po blesku je čerstvá – to ano. #reveal:faction #aff:self:+2 #aff:k3:+2
* [A co ti pašeráci s olejem?]
    Pašeráci jsou výhodný příběh pro Nilfgaard. #aff:k2:-2 #aff:k3:+1 #aff:self:+1
* [Blesk nezlomí pečeť smlouvy.]
    …To je pravda. Pečeť zlomil člověk. #aff:self:-1 #aff:k1:+1 #aff:k2:+1 #cut
    ~ believes_murder = true

- Půjdu zítra nahoru měřit znovu – jestli mě vojáci pustí.
* [Ferelden chce klid. To je správně.]
    Ano. Válka spálí i moje poznámky. #reveal:faction #aff:self:+2 #aff:k3:+2
* [Redanie má svědky.]
    Svědci vidí to, co jim řeknou. #aff:k1:-1 #aff:self:+1 #aff:k3:+1
* [Nilfgaard popírá všechno.]
    Impéria vždycky popírají. #aff:k2:-1 #aff:self:+1
- Jestli tu bude Mira, řekněte jí, ať mi popis těch luceren. #aff:mira:+1
A Bohdana ať držíte dál ode mě – voják a měření se nesnese. #aff:bohdan:-1 #cut
* [Pomůžu, jak budu moct.]
    Pak jste vzácný hostinský. #aff:self:+2 #aff:k3:+1
* [Já jsem jen u piva.]
    I pivo je dnes politika. #aff:self:-1
- Na zdraví – a ať pečeť někde leží celá. #bartender #aff:self:+1
-> END
