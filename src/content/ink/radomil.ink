// Radomil Kostka – Varhoř (k1), posel Jeho Výsosti. Uplácel a šikanoval starého hostinského, teď zkouší nového.
// Chce: aby hostinský nechal „dělníky“ (ve skutečnosti pluk) projít údolím a nikomu nic nehlásil.
// Dny: 1 (fronta), 2 (lounge, pokud přespal: ptá se po uprchlé Báře), 3 (fronta: žádá otevřít bránu).
// Mechaniky: úplatek jako předmět na stole (#item:gold_pouch), lži poznatelné z portrétu (#portrait:lie),
//   slot road (den 1) a soldiers (den 3), #aff:bara, VAR let_pass / took_bribe / unmasked čtou summary.json a scrolls.json.
VAR aff_self = 0
VAR aff_bara = -99
VAR took_bribe = false
VAR refused_bribe = false
VAR road_claim = ""
VAR covered_bara = false
VAR betrayed_bara = false
VAR unmasked = false
VAR let_pass = false
VAR returned_gold = false

-> END

=== day1 ===
Hostinský! Radomil Kostka, posel Jeho Výsosti z Varhoře. Konečně je za pultem někdo od nás. #reveal:name #reveal:faction
Pocházíte přece z Varhoře. Na to se nezapomíná.
* [Teď jsem hostinský všech tří království.]
    Hezká slova. Uvidíme, jak dlouho vydrží. #aff:self:-1
* [Co pro vás můžu udělat?]
    Tak se mi to líbí. #aff:self:+1
- Cestu do Pravny zavalila skála. Obyčejný sesuv, nic víc. #cut:road:landslide #portrait:lie
Varhoř je štědrá. Posíláme dělníky, aby ji opravili. Pár set mužů, lopaty, krumpáče. #cut:soldiers:road_workers #portrait:lie
Budou chodit vaším údolím. Nechte je projít a nikomu nic nehlaste.
Tady. Za vaši… ochotu.
* [Vzít měšec.]
    Moudré. Matouš byl taky moudrý. Dokud nebyl. #item:gold_pouch #aff:self:+2 #aff:k1:+1
    ~ took_bribe = true
* [Měšec si nechte.]
    Hrdost. Ta se u hostinských dlouho nenosí. #aff:self:-2 #aff:k1:-1
    ~ refused_bribe = true
- A co píšou vaše vrány o té cestě, hm?
* [Sesuv skály. Jak říkáte. #slot:road:landslide]
    Vidíte. Čtete ty správné noviny. #aff:self:+1
    ~ road_claim = "landslide"
* [Pravna píše, že ji vyhodila do vzduchu Varhoř. #slot:road:sabotage]
    Pravna lže, jak dýchá. Dávejte si pozor, komu věříte. #aff:self:-2 #aff:k1:-1
    ~ road_claim = "sabotage"
* [Na kamenech jsou prý stopy od prachu. #slot:road:powder]
    Od prachu? Na horách se pořád něco odstřeluje. #portrait:lie #aff:self:-2
    ~ road_claim = "powder"
* [Prý si ji podkopali sami Pravňáci. #slot:road:pravna_mine]
    Ha! To se mi líbí. To dám do našich listů. #aff:self:+2
    ~ road_claim = "mine"
* [Tohle stojí v novinách. #slot:road:*]
    Noviny. Čtěte jen ty naše.
* [Vrány se neshodnou.]
    Tak věřte té, která vám nese zlato.
- -> END

=== followup_day2 ===
Ráno, hostinský. Postel ušla. Zítra se vrátím – a pak uvidíme, na čí straně stojíte.
{aff_bara > -99: Mimochodem… nebyla tu včera žena? Hubená, modřina pod okem. Desátník Kubát ji hledá.}
* {aff_bara > -99} [Nikdo takový tu nebyl.]
    Hm. Tak jestli ji uvidíte, víte, komu dát vědět. #aff:bara:+2
    ~ covered_bara = true
* {aff_bara > -99} [Spala tady, ano.]
    Děkuju. Desátník bude vděčný. #aff:self:+2 #aff:bara:-5
    ~ betrayed_bara = true
* [Do mých hostů vám nic není.]
    Všechno je mi do všeho, hostinský. Tak to chodí. #aff:self:-1
    ~ covered_bara = true
- -> END

=== day3 ===
Tak jsem zpátky, jak jsem slíbil.
{took_bribe: Doufám, že ten měšec pořád leží na stole. V Pravenských listech by se moc vyjímal.}
{refused_bribe: Zlato vám nevonělo. Dobrá. Dneska nabízím něco cennějšího – klid.}
V noci projdou údolím naši dělníci. Do Čeřavy, opravit i jejich cesty. Hostinský jen otevře bránu. #cut:soldiers:road_workers #portrait:lie
Tak co, víte, kdo táboří v údolí?
* [Dělníci. Jak říkáte. #slot:soldiers:road_workers]
    Výborně. #aff:self:+1
* [Vojsko. Kopí místo lopat. #slot:soldiers:army]
    …Tak vy to víte. #aff:self:-3 #aff:k1:-2
    Pak víte i to, co se stává hostinským, kteří moc mluví.
    ~ unmasked = true
* [Poutníci ke Svaté studánce. #slot:soldiers:pilgrims]
    Poutníci! Ano. Říkejte to všem. #aff:self:+1
* [Stráž proti pravenským lupičům. #slot:soldiers:pravna_raiders]
    Přesně tak! Konečně někdo chápe. #aff:self:+2 #aff:k1:+1
* [Tohle stojí v novinách. #slot:soldiers:*]
    Noviny, noviny. Ptám se, co víte vy.
* [To mi řekněte vy.]
    Už jsem to řekl. Dělníci. #portrait:lie
- Otevřete tu bránu, hostinský?
* [Ano. Ať projdou.]
    Varhoř nezapomíná na přátele. #aff:self:+3 #aff:k1:+2 #aff:k2:-2 #aff:k3:-2
    ~ let_pass = true
* [Ne. Pakt říká, že údolím vojsko neprojde.]
    Pakt je pět set let starý papír. Uvidíme, kdo ho dočte do konce. #aff:self:-3 #aff:k1:-3 #aff:k2:+1 #aff:k3:+1
* {took_bribe} [Vraťte si svůj měšec. A brána zůstane zavřená.]
    Měšec si nechte. Až vás budou soudit, ať máte čím platit. #aff:self:-4 #aff:k1:-3 #aff:k2:+1
    ~ returned_gold = true
- -> END
