// Vlasta – Nilfgaard, pašerák / šedá zóna
VAR saw_oil = false
VAR stress = 0
VAR aff_self = 0
VAR aff_k1 = 0
VAR aff_k2 = 0
VAR aff_radek = 0

Vlasta. Jen nocleh a polévku – a žádné otázky navíc. #reveal:name
* [Odkud jdete?]
    Ze severu. Víc vám neřeknu. #aff:self:-2 #aff:k2:-1 #stress:+1
* [Polévka bude hned.]
    Děkuji. To je řeč, kterou umím. #aff:self:+2 #aff:k2:+1 #stress:-2
* [Kurýr u průsmyku – víte něco?]
    Vím, že je mrtvý. A že všichni chtějí vina. #aff:self:+1 #cut #stress:+1
* { stress >= 5 } [Mluvte, nebo vás vyhodím dřív, než dojíte.]
    Vidím, že vám praskají nervy. Olej u stezky. Hotovo. #aff:self:-2 #stress:+2 #cut
    ~ saw_oil = true
- Cestou jsem viděla na stezce sudy s olejem. #cut
~ saw_oil = true
* [Pašeráci?]
    Možná. Neměla jsem chuť se ptát. #aff:self:+1 #aff:k3:-1 #stress:+1
* [To není moje starost.]
    Moudré. Přežijete dýl. #aff:self:+2 #stress:-1
* [Redanie říká, že pochodně byly nilfgaardské.]
    Redanie říká, co se jí hodí. Olej je olej. #aff:self:+1 #aff:k1:-2 #aff:k2:+1 #stress:+2
* { aff_k2 >= 0 && stress < 4 } [Slyšel jsem, že olej patří Impériu.]
    Slyšel jste špatně. A nebo správně – podle toho, komu sloužíte. #aff:self:+1 #aff:k2:-1 #stress:+1 #cut
- Jsem z Nilfgaardu, jestli vás to zajímá – oficiálně. #reveal:faction #aff:k2:+1
* [Radek z Redanie se po vás ptal.]
    Radek… ten starý lišák. Pozdravte ho, až přijde. #aff:radek:+2 #aff:self:+1 #aff:k1:+1 #stress:-1
* [Oficiálně, nebo opravdu?]
    U průsmyku je to totéž. #aff:self:-1 #cut #stress:+1
* [Budete spát tu?]
    Jestli mě nevyhodíte do mrazu. #aff:self:+1 #stress:-1
* { aff_radek >= 1 || aff_k1 >= 1 } [Radek říká, že nejste jen pašerák.]
    On toho říká hodně. Tentokrát má skoro pravdu. #aff:self:+2 #aff:radek:+1 #stress:+1 #cut
- Polévku dojedím a zmizím z očí. #bartender
-> END
