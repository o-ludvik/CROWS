// [placeholder] Mira – Království A
VAR told_secret = false

Jmenuji se Mira. Cestou mě bolí nohy, dejte mi něco teplého. #reveal:name
Slyšel jste o tom požáru? Prý to byli lidé z Béčka. #cut
* [Taky jsem to četl.]
    Vidíte! Celý svět to ví. #aff:self:+2 #aff:k2:-1
* [Noviny lžou.]
    Hm. To jste divný hostinský. #aff:self:-1
* [Nevím, co si o tom myslet.]
    Opatrný muž. To se u průsmyku cení.
- Jdu domů, do Áčka. Tam je aspoň klid. #reveal:faction
* [Byla jste u toho?]
    Mezi námi... já tam byla. Viděla jsem jen kouř a lucerny. #cut
    ~ told_secret = true
* [Šťastnou cestu.]
    Děkuji. #aff:self:+1
- -> END
