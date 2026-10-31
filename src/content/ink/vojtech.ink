// PLACEHOLDER STORY
// Vojtěch Smrk – Velesie (k1), vorař se sekerou u pasu. Lukovinský posel obviňuje velesské voraře.
// Chce: očistit jméno Velesie (a své).
// Dny: 1 (fronta, poslední – sedí u jediného stolu s Otou, kterého noviny staví proti němu),
//   2 (lounge, jen pokud spal na pokoji s Otou: rvačka, pokud Ota viní Velesii, jinak smír u placatky).
// Mechaniky: slot bridge_cause S fallbackem `*` (libovolný výstřižek k mostu), slot sawn (výstřižek od Hany ze stejného dne),
//   #aff:<guestId> (aff na Otu), první stopa linky Vraní pošta (#quest:crows), follow-upy podmíněné spolubydlením.
VAR stress = 0
VAR aff_self = 0
VAR accused = false
VAR knows_saw = false
VAR suspects_ferry = false

-> END

=== day1 ===
Vojtěch Smrk, vorař. Nalejte, než mi vyschne v krku. #reveal:name
Z Velesie, jestli se ptáte. A jestli se ptáte kvůli mostu, tak radši mlčte. #reveal:faction #quest:bridge
Lukovinský posel píše, že jsme to byli my. Prý vorařské sekery. #stress:+1
Sekeru nosí každý vorař! Tou se rubá dřevo, ne mosty. #cut #quest:bridge
* [Klid. Nikdo vás tu z ničeho neviní.]
    Ještě ne. Ale počkejte, až si přisedne ten kamenecký vozka. #aff:self:+1
* [Ta sekera u pasu vám zrovna nepomáhá.]
    Mám ji svlíknout jako košili? #aff:self:-2 #stress:+2
- Tak co, hostinský? Četl jste všechny tři plátky. Co si myslíte vy?
* [Lukovinský posel má pravdu. Vorařské sekery. #slot:bridge_cause:k1_axe]
    Tak takhle. I vy. #aff:self:-3 #aff:k1:-2 #aff:k3:+1 #stress:+3
    ~ accused = true
* [Kamenec. V lomu nad mostem se střílelo. #slot:bridge_cause:k2_blasting]
    No vidíte! Když lom bouchá, třese se celá rokle. #aff:self:+2 #aff:k1:+1 #aff:k2:-1 #aff:ota:-1
* [Lano bylo nařezané. Pilou, ne sekerou. #slot:bridge_cause:sawn]
    Pilou? … Tak to nebyl nikdo z nás. Vorař na laně pilu nepoužije. #aff:self:+2 #aff:k1:+1 #stress:-1
    ~ knows_saw = true
* [Tohle jsem četl. #slot:bridge_cause:*]
    Noviny. Každé píšou, co se hodí jejich pánovi. #aff:self:-1
* [Nevím. A vy byste neměl tolik křičet.]
    Křičím, protože mě nikdo neposlouchá. #aff:self:-1 #stress:+1
- Poslal jsem domů vránu, že jsem v pořádku. Odpověď přišla dneska ráno. #quest:crows
S rozlomenou pečetí. Někdo čte vaši poštu, hostinský. #cut #quest:crows #stress:+1
* [To není možné. Vrány mám pod zámkem.]
    Zámky. Na mostě byla taky lana. #aff:self:-1 #stress:+1
* [Díky, že mi to říkáte. Dám si pozor.]
    Dejte. Ve vaší hospodě se teď vyplácí mít oči i vzadu. #aff:self:+1
- -> END

=== followup_day2_brawl ===
Dobré ráno. Až na tohle oko. #stress:+2
Ten váš vozka mi v noci řekl, že jste mu sám potvrdil, že to byli Velesští. Tak jsme si to vyřídili. #aff:self:-2 #aff:ota:-2
* [Vy jste se pral v mém pokoji?]
    On začal. Já skončil. Zaplatím rozbitou židli. #aff:self:-1 #stress:+1
* [Mrzí mě to. Řekl jsem jen, co stálo v novinách.]
    Noviny. Vy a vaše noviny. #aff:self:+1
- Dneska odplouvám domů. Ve Velesii řeknu, jak se tu jedná s vorařem. #aff:k1:-1
-> END

=== followup_day2_room ===
Nebudete věřit, s kým jsem spal v jednom pokoji. S tím kameneckým vozkou. #aff:ota:+1
Do půlnoci jsme na sebe vrčeli. Pak vytáhl placatku. #stress:-1
Říkal, že ten den se v lomu nestřílelo. A já mu řekl, že vorařská sekera lano čistě nepřesekne. #cut #quest:bridge
Tak kdo, hostinský? Kdo má užitek z toho, že most nestojí? #quest:bridge
* [Ten, kdo teď vozí lidi přes vodu.]
    Převoz… Šebor. Za trojí mýto. #cut #quest:bridge #aff:self:+2
    ~ suspects_ferry = true
* [Nevím. A vy byste to měl nechat být.]
    Možná. Ale vozka jde dolů do rokle. Půjdu s ním. #aff:self:+1 #aff:ota:+1
- -> END
