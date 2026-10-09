// Vlasta – Nilfgaard, pašerák / šedá zóna
VAR saw_oil = false

Vlasta. Jen nocleh a polévku – a žádné otázky navíc. #reveal:name
* [Odkud jdete?]
    Ze severu. Víc vám neřeknu. #aff:self:-2 #aff:k2:-1
* [Polévka bude hned.]
    Děkuji. To je řeč, kterou umím. #aff:self:+2 #aff:k2:+1
* [Kurýr u průsmyku – víte něco?]
    Vím, že je mrtvý. A že všichni chtějí vina. #aff:self:+1 #cut
- Cestou jsem viděla na stezce sudy s olejem. #cut
~ saw_oil = true
* [Pašeráci?]
    Možná. Neměla jsem chuť se ptát. #aff:self:+1 #aff:k3:-1
* [To není moje starost.]
    Moudré. Přežijete dýl. #aff:self:+2
* [Redanie říká, že pochodně byly nilfgaardské.]
    Redanie říká, co se jí hodí. Olej je olej. #aff:self:+1 #aff:k1:-2 #aff:k2:+1
- Jsem z Nilfgaardu, jestli vás to zajímá – oficiálně. #reveal:faction #aff:k2:+1
* [Radek z Redanie se po vás ptal.]
    Radek… ten starý lišák. Pozdravte ho, až přijde. #aff:radek:+2 #aff:self:+1 #aff:k1:+1
* [Oficiálně, nebo opravdu?]
    U průsmyku je to totéž. #aff:self:-1 #cut
* [Budete spát tu?]
    Jestli mě nevyhodíte do mrazu. #aff:self:+1
- Polévku dojedím a zmizím z očí. #bartender
-> END
