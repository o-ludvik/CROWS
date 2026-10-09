// Mira – Redanie, svědkyně od průsmyku
VAR told_secret = false

Jmenuji se Mira. Cestou mě bolí nohy – a hlavu ještě víc. #reveal:name
Slyšel jste o tom kurýrovi? Prý ho zabili Nilfgaardští. #cut
* [Taky jsem to četl v Hlasateli.]
    Vidíte! Celý hřeben to ví. #aff:self:+2 #aff:k2:-2
* [Noviny lžou, co se jim hodí.]
    Hm. To jste divný hostinský. #aff:self:-2 #aff:k1:-1
* [Nevím, co si o tom myslet.]
    Opatrný muž. To se u průsmyku cení. #aff:self:+1
- Jdu domů, do Redanie. Tam je aspoň klid – zatím. #reveal:faction
* [Byla jste u průsmyku, když to stalo?]
    Mezi námi… já tam byla. Viděla jsem lucerny a někoho v černém. Pečeť jsem neviděla. #cut #aff:self:+1 #aff:k1:+1
    ~ told_secret = true

* [Šťastnou cestu, ať vás minou vojáci.]
    Děkuji. Potřebuju to slyšet. #aff:self:+2 #aff:k1:+1
* [Nilfgaard má také své důvody.]
    Důvody? Kurýr leží v příkopu! #aff:self:-3 #aff:k2:+1 #aff:k1:-1
- Jestli tu bude ten voják Bohdan, nechte mě sedět daleko. #aff:bohdan:-1
On by mě hned obvinil z všeho. #cut
* [Tady se hosté nesoudí.]
    Tak jste jediný rozumný člověk na hřebenu. #aff:self:+2 #aff:k1:+1
* [Každý má svou verzi.]
    I vy. Jen ať ta vaše nikoho nezabije. #aff:self:-1
- Dejte mi teplé, ať můžu dál. #bartender
-> END
