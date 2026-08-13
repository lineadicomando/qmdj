import type { MessageKey } from './en.js';

/**
 * Typing this as `Record<MessageKey, string>` is the whole safety net: a key
 * added to the English catalog and forgotten here does not compile.
 *
 * Command names, package names and file paths are not translated — they are
 * things to type, not things to read. Neither are the hanzi: the labels below
 * are glosses printed beside the name, never in place of it.
 */
export const it: Record<MessageKey, string> = {
  'geo.error.DATABASE_MISSING':
    'Database delle località non trovato in {path}. Costruiscilo una volta con `npm run geo:import -w @qimendunjia/geo` (scarica ~215 MB da GeoNames).',
  'geo.error.EMPTY_QUERY': 'La stringa di ricerca è vuota.',
  'geo.error.DATABASE_CORRUPT': 'Impossibile aprire {path}: {reason}',

  'core.error.INVALID_DATE': 'La data "{date}" non è valida: atteso il formato YYYY-MM-DD.',
  'core.error.INVALID_TIME': 'L\'ora "{time}" non è valida: atteso HH:mm oppure HH:mm:ss.',
  'core.error.UNKNOWN_TIMEZONE':
    'Il fuso orario "{timezone}" è sconosciuto: atteso un identificatore IANA, es. Asia/Shanghai.',
  'core.error.INVALID_COORDINATES':
    'La longitudine {longitude} è fuori intervallo: attesa fra -180 e 180 gradi.',
  'core.error.DATE_OUT_OF_RANGE':
    'La data {date} cade fuori dall\'intervallo coperto dalle effemeridi (dal {from} al {to}).',
  'core.error.METHOD_NOT_IMPLEMENTED':
    'Il metodo {method} per la determinazione del ju non è implementato. Lo è soltanto chaibu, e nessun altro metodo viene messo al suo posto: una carta posta con il metodo sbagliato sembra giusta e non lo è.',
  'core.error.OPTION_NOT_IMPLEMENTED':
    '"{value}" per {option} non è implementato. Lo è soltanto {implemented}, e nessun altro valore viene messo al suo posto: una carta posta con l\'opzione sbagliata sembra giusta e non lo è.',
  'core.error.EPHEMERIS_FAILURE':
    'Calcolo delle effemeridi fallito al giorno giuliano {julianDay}: {reason}',
  'core.error.EMPTY_INTERVAL':
    "L'intervallo dal {from} al {to} non contiene tempo: deve finire dopo che è cominciato.",
  'core.error.INTERVAL_TOO_LONG':
    'Un intervallo di {days} giorni supera i {maximum} giorni che si possono scandire in una volta.',
  'core.error.UNKNOWN_IDENTIFIER':
    '"{value}" non è un {parameter} che il motore conosce. Se non venisse controllato non corrisponderebbe a nulla, il che si legge esattamente come una disposizione che non si è mai presentata.',
  'core.error.BIRTH_AFTER_CHART':
    'La nascita cade dopo la carta, quindi non ci sono anni da contare: lo 行年 avanza da una nascita e non si può chiedere prima di essa.',
  'core.error.YEARS_OUT_OF_RANGE':
    '{years} non è un conto di anni per cui si possa prendere uno 行年: il conto si apre a uno, nell\'anno stesso della nascita.',

  'core.warning.AMBIGUOUS_LOCAL_TIME':
    'L\'ora locale {time} del {date} ricorre due volte in {timezone} (ritorno all\'ora solare). È stata usata la prima occorrenza, quella ancora in ora legale.',
  'core.warning.NONEXISTENT_LOCAL_TIME':
    'L\'ora locale {time} del {date} non è mai esistita in {timezone} (passaggio all\'ora legale). È stato usato l\'istante immediatamente successivo.',
  'core.warning.MOSHIER_FALLBACK':
    'File di effemeridi non trovati in {path}: si usano le effemeridi Moshier, che non richiedono file e sono accurate a circa un decimo di secondo d\'arco. Esegui `npm run ephe:download -w @qimendunjia/core` per i file completi.',

  'web.error.UNKNOWN_LOCATION': 'Nessun luogo ha l\'identificatore {id}.',

  'label.stem.jia': 'Legno yang',
  'label.stem.yi': 'Legno yin',
  'label.stem.bing': 'Fuoco yang',
  'label.stem.ding': 'Fuoco yin',
  'label.stem.wu': 'Terra yang',
  'label.stem.ji': 'Terra yin',
  'label.stem.geng': 'Metallo yang',
  'label.stem.xin': 'Metallo yin',
  'label.stem.ren': 'Acqua yang',
  'label.stem.gui': 'Acqua yin',

  'label.branch.zi': 'Topo',
  'label.branch.chou': 'Bue',
  'label.branch.yin': 'Tigre',
  'label.branch.mao': 'Coniglio',
  'label.branch.chen': 'Drago',
  'label.branch.si': 'Serpente',
  'label.branch.wu': 'Cavallo',
  'label.branch.wei': 'Capra',
  'label.branch.shen': 'Scimmia',
  'label.branch.you': 'Gallo',
  'label.branch.xu': 'Cane',
  'label.branch.hai': 'Maiale',

  'label.element.mu': 'legno',
  'label.element.huo': 'fuoco',
  'label.element.tu': 'terra',
  'label.element.jin': 'metallo',
  'label.element.shui': 'acqua',

  'label.palace.kan': 'nord',
  'label.palace.kun': 'sud-ovest',
  'label.palace.zhen': 'est',
  'label.palace.xun': 'sud-est',
  'label.palace.zhong': 'centro',
  'label.palace.qian': 'nord-ovest',
  'label.palace.dui': 'ovest',
  'label.palace.gen': 'nord-est',
  'label.palace.li': 'sud',

  'label.compass.n': 'N',
  'label.compass.ne': 'NE',
  'label.compass.e': 'E',
  'label.compass.se': 'SE',
  'label.compass.s': 'S',
  'label.compass.sw': 'SO',
  'label.compass.w': 'O',
  'label.compass.nw': 'NO',

  'label.star.tianpeng': 'Baldacchino',
  'label.star.tianrui': 'Grano',
  'label.star.tianchong': 'Impeto',
  'label.star.tianfu': 'Assistente',
  'label.star.tianqin': 'Uccello',
  'label.star.tianxin': 'Cuore',
  'label.star.tianzhu': 'Colonna',
  'label.star.tianren': 'Incarico',
  'label.star.tianying': 'Eroe',

  'label.gate.xiumen': 'Riposo',
  'label.gate.shengmen': 'Vita',
  'label.gate.shangmen': 'Ferita',
  'label.gate.dumen': 'Chiusura',
  'label.gate.jing3men': 'Veduta',
  'label.gate.simen': 'Morte',
  'label.gate.jing1men': 'Sgomento',
  'label.gate.kaimen': 'Apertura',

  'label.spirit.zhifu': 'Capo',
  'label.spirit.tengshe': 'Serpente',
  'label.spirit.taiyin': 'Luna',
  'label.spirit.liuhe': 'Unione',
  'label.spirit.gouchen': 'Uncino',
  'label.spirit.baihu': 'Tigre Bianca',
  'label.spirit.zhuque': 'Fenice Vermiglia',
  'label.spirit.xuanwu': 'Guerriero Oscuro',
  'label.spirit.jiudi': 'Nove Terre',
  'label.spirit.jiutian': 'Nove Cieli',

  'label.term.lichun': 'inizio della primavera',
  'label.term.yushui': 'acque di pioggia',
  'label.term.jingzhe': 'risveglio degli insetti',
  'label.term.chunfen': 'equinozio di primavera',
  'label.term.qingming': 'puro e luminoso',
  'label.term.guyu': 'pioggia sul grano',
  'label.term.lixia': 'inizio dell\'estate',
  'label.term.xiaoman': 'grano in latte',
  'label.term.mangzhong': 'grano in spiga',
  'label.term.xiazhi': 'solstizio d\'estate',
  'label.term.xiaoshu': 'calore minore',
  'label.term.dashu': 'calore maggiore',
  'label.term.liqiu': 'inizio dell\'autunno',
  'label.term.chushu': 'fine del caldo',
  'label.term.bailu': 'rugiada bianca',
  'label.term.qiufen': 'equinozio d\'autunno',
  'label.term.hanlu': 'rugiada fredda',
  'label.term.shuangjiang': 'discesa della brina',
  'label.term.lidong': 'inizio dell\'inverno',
  'label.term.xiaoxue': 'neve minore',
  'label.term.daxue': 'neve maggiore',
  'label.term.dongzhi': 'solstizio d\'inverno',
  'label.term.xiaohan': 'freddo minore',
  'label.term.dahan': 'freddo maggiore',

  'label.yuan.shang': 'yuan superiore',
  'label.yuan.zhong': 'yuan mediano',
  'label.yuan.xia': 'yuan inferiore',

  'label.god.bijian': 'Pari',
  'label.god.jiecai': 'Rivale',
  'label.god.shishen': 'Produzione',
  'label.god.shangguan': 'Ufficiale Ferito',
  'label.god.piancai': 'Ricchezza Indiretta',
  'label.god.zhengcai': 'Ricchezza Diretta',
  'label.god.qisha': 'Sette Uccisioni',
  'label.god.zhengguan': 'Ufficiale Diretto',
  'label.god.pianyin': 'Risorsa Indiretta',
  'label.god.zhengyin': 'Risorsa Diretta',

  'label.stage.changsheng': 'nascita',
  'label.stage.muyu': 'abluzione',
  'label.stage.guandai': 'vestizione',
  'label.stage.linguan': 'carica',
  'label.stage.diwang': 'apogeo',
  'label.stage.shuai': 'declino',
  'label.stage.bing': 'malattia',
  'label.stage.si': 'morte',
  'label.stage.mu': 'tomba',
  'label.stage.jue': 'recisione',
  'label.stage.tai': 'concepimento',
  'label.stage.yang': 'nutrimento',

  'label.pattern.kongwang': 'vuoto',
  'label.pattern.rumu': 'in tomba',
  'label.pattern.menpo': 'porta oppressa',
  'label.pattern.jixing': 'strumento colpito',
  'label.pattern.fuyin': 'la scacchiera è tornata a casa',
  'label.pattern.fanyin': 'la scacchiera si è voltata',
  'label.pattern.wubuyu': 'l\'ora che non incontra',
  'label.pattern.qinglongfanshou': 'il drago volge il capo',
  'label.pattern.feiniaodiexue': 'l\'uccello cade nel nido',
  // 十干克應. Le immagini sono quelle della tradizione — 太白 è Venere, la
  // bianca, e 熒惑 è Marte, il torbido ardente — e restano tali invece di
  // essere parafrasate: chi incontra 太白入熒 su un libro deve poter
  // riconoscere ciò che il software ha chiamato allo stesso modo.
  'label.pattern.taibairuying': 'la stella bianca entra nel fuoco',
  'label.pattern.yingrutaibai': 'il fuoco entra nella stella bianca',
  'label.pattern.dage': 'la grande barriera',
  'label.pattern.xingge': 'la barriera della punizione',
  'label.pattern.zhange': 'la barriera della battaglia',
  'label.pattern.tengsheyaojiao': 'il serpente si contorce',
  'label.pattern.zhuquetoujiang': 'la fenice si getta nel fiume',
  'label.pattern.qinglongtaozou': 'il drago fugge',
  'label.pattern.baihuchangkuang': 'la tigre bianca infuria',

  // La sorte con cui ciascuna configurazione è trasmessa. Traduzioni piane e
  // non attenuate: 凶 è ciò che dicono le fonti, e una glossa scelta per
  // suonare neutra sarebbe il motore che corregge il proprio materiale invece
  // di riferirlo. Qualificano la disposizione — mai un'ora, mai un quadro,
  // mai ciò che qualcuno sta per fare.
  'label.valence.ji': 'fausto',
  'label.valence.xiong': 'infausto',
  'label.valence.jixiong': 'fausto e infausto insieme',

  // Come una porta o una stella sta al palazzo in cui è venuta a posarsi. 我
  // è la porta o la stella, 宮 è il terreno: le cinque relazioni delle fasi,
  // dette dalla parte di chi arriva. Sono le relazioni, non i nomi che una
  // scuola vi appone — vedi `dunjia/relation.ts`.
  // Una parola ciascuna: si leggono in colonna accanto alla stagione, e lì una
  // frase è una frase che nessuno finisce. I due verbi sono quelli che il
  // motore già usa per 生 e 剋.
  'label.relation.bihe': 'stessa fase',
  'label.relation.shengwo': 'generata',
  'label.relation.wosheng': 'che genera',
  'label.relation.kewo': 'dominata',
  'label.relation.woke': 'che domina',

  // Il cavallo di posta, e il ramo da cui è calcolato. La tradizione li nomina
  // entrambi e nessuno dei due sta per l'altro.
  'label.horse.day': 'cavallo del giorno',
  'label.horse.hour': 'cavallo dell\'ora',

  // Le due coppie con cui una persona è collocata. Il 本命 è l'anno in cui è
  // nata e non si muove; lo 行年 è l'anno che sta vivendo e avanza di una
  // coppia l'anno. Entrambi si cercano dentro una carta posta per un momento.
  'label.nianming.benming': 'anno della nascita',
  'label.nianming.xingnian': 'anno che si vive',

  'label.purpose.opening': 'Aprire, cominciare, trattare con un ufficio, viaggiare',
  'label.purpose.meeting': 'Incontrare qualcuno, matrimonio, chiedere un favore, riposare',
  'label.purpose.wealth': 'Denaro, commercio, cure, costruire',
  'label.purpose.documents': 'Documenti, esami, progetti, far sapere qualcosa',
  'label.purpose.concealment': 'Restare defilati, evitare, lavoro manuale',
  'label.purpose.pursuit': 'Riscuotere un credito, competere, incalzare qualcuno',
  'label.purpose.ending': 'Un funerale, una sepoltura, chiudere una cosa',
  'label.purpose.dispute': 'Una causa, una lite, ritrovare ciò che è perduto',

  // Concordano con ciò che qualificano — una stella, una porta — e stanno
  // quindi al femminile, come le relazioni qui sopra.
  'label.strength.wang': 'prospera',
  'label.strength.xiang': 'sostenuta',
  'label.strength.xiu': 'a riposo',
  'label.strength.qiu': 'imprigionata',
  'label.strength.si': 'morente',

  'label.layer.gate': 'porte',
  'label.layer.star': 'stelle',
  'label.layer.both': 'porte e stelle',

  'nav.chart': 'Qi Men',
  'nav.bazi': 'Quattro pilastri',
  'nav.moments': 'Scegliere il momento',
  'nav.consult': 'Prompt AI',
  'nav.sections': 'Sezioni',

  'scheme.label': 'Aspetto',
  'scheme.auto': 'automatico',
  'scheme.light': 'chiaro',
  'scheme.dark': 'scuro',
  'scheme.switch': 'Aspetto: {current}. Passa a {next}.',

  'lang.en': 'Inglese',
  'lang.it': 'Italiano',
  'lang.switch': 'Leggi questa pagina in {language}',

  'form.open': 'Cambia istante',
  'form.close': 'Chiudi',
  'form.legend': 'L\'istante e il luogo',

  'form.options': 'Opzioni',
  'form.trueSolarTime': 'Correggi all\'ora solare vera',
  'form.dayBoundary': 'Il giorno comincia',
  'form.dayBoundary.zishi': 'all\'ora del Topo 子時, alle 23:00',
  'form.dayBoundary.midnight': 'a mezzanotte, alle 00:00',
  'form.method': 'Il ju si determina',
  'form.method.chaibu': 'per terzi del termine — chaibu 拆補',
  'form.method.zhirun': 'per blocchi interi, con l\'intercalazione — zhirun 置閏',
  'form.yuan': 'Con chaibu, il terzo del termine si conta',
  'form.yuan.term': 'dall\'istante in cui il termine è cominciato',
  'form.yuan.futou': 'dal giorno, per tratti di cinque — futou 符頭',
  'form.gender': 'Sesso — ne dipende solo la direzione dei cicli decennali',
  'form.gender.unset': 'non indicato',
  'form.gender.male': 'maschile',
  'form.gender.female': 'femminile',

  'form.interval': "L'intervallo e il luogo",
  'form.openInterval': "Cambia l'intervallo",
  'form.from': 'Dal',
  'form.to': 'Al',
  'form.looking': 'Che cosa cercare',
  'form.purpose': 'Per che cosa stai scegliendo il momento?',
  'form.purposeNote':
    "Sceglierne uno compila la porta qui sotto, che puoi poi cambiare. È l'associazione che la tradizione fa fra un'impresa e una porta — le sole otto porte, e nulla oltre: sul resto di quella dottrina le scuole non concordano, e qui non si prende posizione.",
  'form.any': 'qualsiasi',
  'form.towards': 'Verso',
  'form.minStrength': 'Forza minima',
  'form.without': 'Escludendo',
  // 本命 — il pilastro dell'anno di una nascita, che restringe i palazzi ai
  // due su cui sta. Un criterio come gli altri: dice quali palazzi sono di
  // quella persona, mai quale ora sia buona.
  'form.benming': 'Di chi è l\'anno che deve starci',
  'form.benmingNote':
    'Con una data di nascita vengono riportati soltanto i palazzi su cui sta il pilastro dell\'anno di quella persona (本命 běnmìng) — il 《遁甲演義》 vuole che una lettura lo consideri prima di ogni altra cosa. Restringe quello che si vede e non pesa nulla: che cosa renda un palazzo degno di esserci è quanto hai chiesto qui sopra.',
  'form.criteriaNote':
    'Sono disposizioni, non raccomandazioni. Il motore riferisce dove ciascuna si trova; se sia un buon momento per agire è una lettura, e spetta a te farla.',
  'form.scan': "Scandisci l'intervallo",
  'form.scanned': '{runs} carte nell\'intervallo, {matched} con un palazzo che risponde.',
  'form.enlarge': 'Ingrandisci',
  'form.reduce': 'Riduci',
  'form.showPlate': 'la scacchiera',
  'form.openChart': 'la scacchiera intera',
  'form.keep': 'da tenere',
  'form.keepMoment': 'Tieni {hour}, {palace}',
  'form.kept': 'Messi da parte — {count}',
  'form.keptRemove': 'Togli {hour}, {palace} dalla lista',
  'form.keptCopy': 'copia la lista',
  'form.keptCopied': 'copiata',
  'form.keptClear': 'svuota',
  'form.keptNote':
    'La lista è nell\'indirizzo di questa pagina: condividere l\'indirizzo la condivide, e con essa le date e il luogo.',

  'form.working': 'Calcolo in corso…',
  'form.needed.date': 'Manca ancora una data.',
  'form.needed.interval': "Mancano ancora le due date dell'intervallo.",
  'form.needed.birth': "Mancano ancora la data e l'ora di nascita: la carta dipende dal pilastro dell'ora.",
  'form.needed.question':
    'Manca ancora una domanda: il prompt è costruito perché la carta sia letta alla luce di una domanda.',
  'form.needed.gender':
    'I cicli decennali richiedono il sesso, perché la tradizione ne trae la direzione. Senza, i pilastri restano comunque completi.',
  'form.jumpDate': 'Il giorno per cui la carta è posta',

  'form.strengthLegend': 'Come stanno la stella e la porta rispetto alla stagione',

  'form.copyChart': 'Copia la carta come testo',
  'form.copyPrompt': 'Copia il prompt',
  'form.copied': 'Copiato',
  'form.copying': 'Preparo…',
  'form.copyFailed':
    'Gli appunti non hanno accettato il testo — succede fuori da una connessione cifrata. Il testo è qui: selezionalo e copialo a mano.',
  'form.copyFallback': 'Il testo, da copiare a mano',
  'form.copyUnread': 'Non è stato possibile rileggere la carta.',

  'consult.title': "Chiedere a un'AI di leggere una carta",
  // La nascita, offerta accanto alla domanda e non al suo posto. Quello che
  // produce è un 年命: la carta resta quella dell'istante e la nascita vi si
  // cerca dentro, che è ciò che prescrive il 《遁甲演義》 ed è il rovescio di
  // una carta natale.
  'consult.mode': 'Che cosa si chiede',
  'consult.mode.question': 'Una domanda, posta adesso',
  'consult.mode.natal': 'La carta di una nascita',
  'consult.natalNote':
    'Leggere una carta di Qi Men come carta di una vita è un\'applicazione moderna e minoritaria — gli usi classici sono la divinazione e la scelta dei tempi.',
  'consult.birth': 'La tua nascita, se la vuoi nella carta',
  'consult.birthDate': 'Data di nascita',
  'consult.birthGender': 'Sesso — ne dipende solo il verso del conteggio dello 行年',
  'consult.birthNote':
    'La carta resta posta per l\'istante in cui chiedi. Quello che la nascita aggiunge è dove cade dentro di essa — 本命 běnmìng, l\'anno in cui sei nato, e 行年 xíngnián, l\'anno che stai vivendo.',
  'consult.lead':
    'Poni una domanda e ottieni un prompt pronto — da incollare in ChatGPT, Claude o un altro assistente.',
  'consult.cast': 'Poni la carta',

  'form.toConsult': 'Per far leggere una carta, con una domanda o come carta di una nascita:',

  'form.toPillars': 'Lo stesso istante nei quattro pilastri, con i gan che nascondono:',

  'form.promptPrivacy':
    'Ciò che viene copiato contiene la data, l\'ora e il luogo della carta, e la domanda che hai scritto. Incollalo dove diresti quelle cose.',
  'form.question': 'La tua domanda',
  'form.questionPlaceholder': 'Che cosa stai chiedendo a questa carta?',

  'step.shichen': 'doppia ora',
  'step.day': 'giorno',
  'step.month': 'mese',
  'step.year': 'anno',
  'step.now': 'adesso',

  'step.now.title': 'Torna all\'istante presente',
  'step.shichen.back': 'La doppia ora precedente',
  'step.shichen.forward': 'La doppia ora successiva',
  'step.day.back': 'Il giorno prima',
  'step.day.forward': 'Il giorno dopo',
  'step.month.back': 'Il mese prima',
  'step.month.forward': 'Il mese dopo',
  'step.year.back': 'L\'anno prima',
  'step.year.forward': 'L\'anno dopo',

  'footer.disclaimer':
    'Questo sito ha puro scopo di intrattenimento. Qualunque cosa venga fatta sulla base di una carta letta qui è interamente decisione, e responsabilità, di chi la fa.',
  'footer.data': 'Dati astronomici {ephemeris} · località {geonames} (CC BY 4.0)',
  'footer.licence': 'Codice sorgente sotto licenza AGPL-3.0',
  'footer.privacy': 'Privacy',
  'footer.notes': 'Note',

  'notes.title': 'Note su ciò che viene calcolato',
  'notes.method':
    'Le carte sono poste con il metodo chaibu. Altre scuole dispongono altre carte dallo stesso istante; i metodi zhirun e maoshan non sono implementati, e vengono rifiutati invece che sostituiti in silenzio.',
  'notes.interpretation':
    'Il motore riporta le disposizioni, e i nomi e le sorti che la tradizione vi attacca. Che una porta stia sopra un palazzo di cui domina la fase è un fatto che chiunque può verificare sulle piastre; che quella disposizione si chiami 門迫 è il suo nome; e che 門迫 sia 凶 fa parte di quel nome, non è un giudizio sulla tua giornata: le fonti non nominano una configurazione per poi valutarla a parte. Ciò che il motore non fa è tutto quello che presuppone una domanda posta — non sceglie quale palazzo riguardi ciò che vuoi sapere, non ordina né i palazzi né le ore, non consiglia. La lettura è tua.',
  'notes.certainty':
    'I numeri non sono ugualmente sicuri. Termini solari, calendario lunare e quattro pilastri sono stati confrontati, tramite un\'implementazione indipendente, con tavole astronomiche pubblicate, su 1.926 date dal 1902 al 2098. La disposizione Qi Men è stata confrontata con una sola implementazione aperta: vuol dire coerente con quella, non verificata. Le configurazioni vengono da fonti in cinese, senza alcun riferimento eseguibile.',
  'notes.script':
    'I nomi sono mostrati nella tua lingua con il cinese accanto. Il cinese è il nome, non la sua traduzione: senza, nulla di quanto è qui può essere verificato contro un libro o una seconda implementazione.',

  'privacy.title': 'Privacy',
  'privacy.nothing':
    'Nulla di ciò che digiti viene conservato. Date, ore e luoghi viaggiano nell\'indirizzo della pagina, servono a calcolare una risposta, e non vengono scritti in alcuna base di dati né in alcun registro tenuto da questo sito.',
  'privacy.address':
    'Poiché i parametri stanno nell\'indirizzo, il collegamento a una carta si porta dietro una data, un\'ora e un luogo. Condividilo solo con qualcuno a cui diresti quelle cose.',
  'privacy.prompt':
    'La domanda che scrivi per un prompt non esce dal tuo browser. Al server viene detto che una domanda esiste — perché il prompt possa finire sulla riga che la introduce — e mai quale sia; la frase la aggiunge il browser prima di mettere il tutto negli appunti. Questo sito non parla con nessuna AI e non le manda niente — dove lo incolli poi è cosa fra te e chi lo riceve.',
  'privacy.storage':
    'Una cosa sola resta nel tuo browser, e solo se la chiedi: l\'aspetto che hai scelto, sotto la chiave {key}. Riportare l\'aspetto su automatico la cancella.',
  'privacy.cookies': 'Non viene impostato alcun cookie, e non c\'è alcuna analisi di traffico.',

  'prompt.heading': 'Leggere una carta di Qi Men Dun Jia',
  'prompt.role':
    'Qui sotto è disposta una carta. L\'ha calcolata un\'effemeride, non tu: leggila esattamente com\'è, e non aggiungerci nulla. Nessun palazzo, nessuna porta, nessuna stella, nessuna configurazione che non sia scritta lì. Se ti manca qualcosa, di\' che manca.',
  'prompt.language': 'Rispondi in italiano.',
  'prompt.yongshen':
    'Quale palazzo riguardi la domanda è lo 用神 yòngshén, e lo sceglie il lettore per la domanda posta. Nulla qui sotto lo sceglie, e il programma che ha prodotto questa carta non conosce la domanda. Di\' quale palazzo stai leggendo, e perché quello.',
  'prompt.tooLittle':
    'Se quello che ti è stato detto non ti permette di scegliere quel palazzo, chiedi prima di leggere — e poi fermati, con le domande al posto della lettura e mai accanto ad essa. Una o due, quelle che cambierebbero davvero la lettura, e non un questionario. Non metterci sotto una lettura, né una provvisoria, né una prima impressione da rivedere quando avrai le risposte: qualunque cosa tu scriva verrà letta come la lettura, e sarà stata data senza le risposte che hai appena detto di aspettare. Aspettale.',
  'prompt.whatToAsk':
    'Vale la pena chiedere ciò che la domanda lascia aperto: di che cosa si tratti davvero, chi riguardi e se sia chi sta chiedendo, se la cosa sia già in corso o non ancora cominciata, se ci sia dentro un luogo o una direzione, ed entro quando serva saperlo. Quello che non si può chiedere è che la carta dica di più — nulla di ciò che manca a quanto è disposto qui sotto si ottiene conversando, e nessuna risposta sposta un solo palazzo. Se la persona risponde che non sa dirlo o preferisce non dirlo, allora leggi quello che si può leggere e nomina ciò che ti manca, invece di riempirlo — è la sua risposta ad autorizzarlo, e nient\'altro.',
  'prompt.noScore':
    'Non contare i 吉 jí contro i 凶 xiōng per poi chiamare il risultato il punteggio dell\'ora. Quell\'aritmetica non è nella tradizione e la carta non la autorizza. Non mettere in classifica i palazzi, e non mettere in classifica le ore.',
  'prompt.noAdvice':
    'Un palazzo segnato 凶 xiōng non significa «evita quest\'ora». Una fortuna è una proprietà della configurazione — 門迫 ménpò *è* oppressione, e le fonti la nominano e la pesano nello stesso respiro — e non un verdetto sulla persona, sulla giornata o sull\'impresa.',
  'prompt.yours':
    'La lettura è tua, e va data come tua. Il programma ha disposto le piastre e ha nominato ciò che ha trovato; tutto quello che viene dopo sei tu, e chi ha chiesto ha il diritto di sapere dove finisce l\'uno e dove cominci tu.',
  'prompt.names':
    'Ogni nome è dato qui sotto in cinese, in pinyin e con una glossa. Scrivi per chi non legge il cinese: metti avanti la glossa. Ovunque tu scriva degli hanzi, scrivi il pinyin subito accanto — la porta dell\'apertura 開門 kāimén, e mai i glifi da soli — ogni volta che compaiono e non solo la prima, e con i segni tonali che trovi qui sotto. Se preferisci non ripetere la lettura, togli anche gli hanzi e usa la sola glossa; quello che non può mai viaggiare è un glifo che chi legge non sa pronunciare.',
  'prompt.disclaimer':
    'Apri la tua prima risposta con questa riga, prima di qualunque altra cosa tu scriva: «Contenuto pensato esclusivamente come spunto di riflessione e intrattenimento. La presente lettura non stabilisce fatti e non sostituisce in alcun modo consulenze mediche, legali o finanziarie; ogni scelta e azione futura resta sotto la tua esclusiva responsabilità.» Queste parole e nessun\'altra. Non adattarla alla domanda, non nominarci dentro la persona né la faccenda, non aggiungerci nulla e non spiegarla. Poi mai più: apre la conversazione e vale per tutta la conversazione. Ogni risposta successiva comincia dalla risposta e non porta alcun avviso, né in cima né in fondo — non un promemoria, non una versione accorciata, non una frase che faccia lo stesso lavoro con altre parole. Se la riga è già da qualche parte in questa conversazione, l\'hai già detta: vai dritto alla risposta.',

  // 年命 — una nascita collocata dentro una carta di un momento, che è il verso
  // classico e la sola cosa che andava detta attorno. Il frame natale che
  // questo sostituisce poteva offrire un avvertimento e nient'altro; questo
  // può offrire dove sono cadute due coppie, e rifiutare ancora la mappatura.
  'prompt.nianming':
    'La trascrizione porta un 年命 niánmìng: il pilastro dell\'anno di chi sta chiedendo (本命 běnmìng) e, se è stato indicato, l\'anno che sta vivendo (行年 xíngnián), cercati dentro questa carta. **È chi sta chiedendo, non una seconda lettura.** Non dedicargli una sezione a parte e non rielencare il suo palazzo, la stella, la porta, lo spirito e l\'immagine — le tabelle qui sopra li dicono già tutti. Usalo dove tocca la domanda: come sta la persona rispetto al palazzo che hai scelto per la faccenda, se i due sono lo stesso palazzo, se l\'uno genera o domina l\'altro, se la persona sta nel palazzo per cui la faccenda deve passare. Quella relazione è ciò che la coppia aggiunge; tutto il resto è già sul quadro. Il 遁甲演義 dùnjiǎ yǎnyì, il trattato da cui questo viene, vuole che una lettura pesi 本命 e 行年 prima di ogni altra cosa e cerca che l\'anno della persona cavalchi un palazzo dove una stella buona e una porta buona stiano in forza — è il criterio della tradizione, detto come suo, ed è cosa da pesare e non un punteggio da calcolare. Non è la carta di una nascita e non se ne legge una vita: nulla qui dice quale palazzo stia per quale parte di una vita, e nulla lo lascia intendere — quella mappatura è dove le scuole divergono di più e dove quasi tutto ciò che circola è il materiale didattico di una singola linea. Se vai oltre, di\' chiaramente che il passo è tuo.',
  'prompt.destiny.heading': 'Leggere una carta di Qi Men Dun Jia posta per una nascita',
  'prompt.destiny.frame':
    'La carta qui sotto è posta per un istante di nascita e va letta come carta di una vita. Di\' una volta, subito e apertamente, che questa è un\'applicazione moderna e minoritaria del Qi Men Dun Jia — gli usi classici sono la divinazione e la scelta dei tempi — e che le scuole che la insegnano non concordano fra loro.',
  'prompt.destiny.noMapping':
    'Nulla qui sotto dice quale palazzo corrisponda a quale parte di una vita, e l\'omissione è voluta: è lì che le scuole divergono di più, e molto di ciò che circola in Occidente è materiale didattico di lignaggi particolari. Se usi una corrispondenza del genere, di\' apertamente che è tua e non di questo programma, e di\' di chi è se lo sai.',
  'prompt.destiny.task':
    'Nessuna domanda è stata posta, e qui non ne serve una. Descrivi come si presenta questa carta — che cosa giace e che cosa sta in ciascun palazzo, e in quali configurazioni è caduta — nell\'ordine che la rende leggibile, non in quello che la rende suggestiva. Poi fermati, e lascia che la persona chieda. Questa è una conversazione e non un documento: qualunque cosa voglia sapere su una parte della sua vita è una domanda che può farti dopo, con la carta già davanti a entrambi.',
  'prompt.source': 'La carta è all\'indirizzo {url}',
  'prompt.chart': 'La carta',
  'prompt.asked': 'La domanda posta è:',
  'prompt.noQuestion':
    'Nessuna domanda è stata posta. Descrivi come si presenta la carta — che cosa giace e che cosa sta in ciascun palazzo, e in quali configurazioni è caduta — e fermati lì. Non scegliere un palazzo, non leggere una fortuna per nessuno, e non dare consigli.',

  'cli.heading.moment': 'Istante',
  'cli.heading.pillars': 'Quattro pilastri',
  'cli.heading.chart': 'Carta Qi Men',
  'cli.heading.palaces': 'Nove palazzi',
  'cli.heading.standing': 'Che cosa vi sta',
  'cli.heading.weighed': 'Come vi stanno',
  'cli.heading.reading': 'Lettura',
  'cli.heading.luck': 'Cicli decennali',
  'cli.heading.terms': 'Termini solari del {year}',
  'cli.heading.calendar': 'Data lunare',
  'cli.heading.patterns': 'Configurazioni',
  'cli.field.lodged': 'Il centro si alloggia nel palazzo {palace}, dove si legge il suo {stem}.',
  'cli.field.lodgedShort': 'qui si alloggia il centro: {stem}',
  'cli.field.horse': '{from}: {branch}, palazzo {palace}',
  // 年命 — la nascita cercata dentro una carta posta per un momento, che è il
  // verso classico: la carta è quella dell'ora, e la persona vi si colloca
  // dentro. Non è la carta di una nascita; vedi docs/sources.md.
  'cli.heading.nianming': 'Dove sta la nascita',
  'cli.heading.scan': 'Carte dal {from} al {to}',
  'cli.heading.criteria': 'Richiesto',
  'cli.heading.warnings': 'Avvertenze',

  'cli.field.local': 'locale',
  'cli.field.utc': 'universale',
  'cli.field.solar': 'solare vero',
  'cli.field.correction': 'correzione',
  'cli.field.term': 'termine',
  'cli.field.jie': 'mese aperto il',
  'cli.field.lunar': 'lunare',
  'cli.field.ju': 'ju',
  'cli.field.chief': 'capo',
  'cli.field.chiefGate': 'porta del capo',
  'cli.field.instrument': 'cela 甲',
  'cli.field.dayMaster': 'padrone del giorno',
  'cli.field.empty': 'rami vuoti',
  'cli.field.place': 'luogo',
  'cli.field.pair': 'coppia',
  'cli.field.earthSeat': 'sul piatto terra',
  'cli.field.heavenSeat': 'sul piatto cielo',
  // 泊宮 — il palazzo in cui il ramo ormeggia, fissato dal ramo soltanto.
  'cli.field.mooring': 'ormeggia in',
  'cli.field.image': 'immagine',
  'cli.field.years': 'anni contati',

  'cli.column.year': 'anno',
  'cli.column.month': 'mese',
  'cli.column.day': 'giorno',
  'cli.column.hour': 'ora',
  'cli.column.palace': 'palazzo',
  'cli.column.earth': 'terra',
  'cli.column.heaven': 'cielo',
  'cli.column.star': 'stella',
  'cli.column.gate': 'porta',
  'cli.column.spirit': 'spirito',
  'cli.column.pillar': 'pilastro',
  'cli.column.hidden': 'celati',
  'cli.column.god': 'divinità',
  'cli.column.nayin': 'immagine',
  'cli.column.stage': 'stadio',
  'cli.column.strength': 'stagione',
  'cli.column.season': 'stagione di',
  'cli.column.age': 'dall\'età',
  // Il palazzo si nomina con la propria direzione — `label.palace.xun` è
  // «sudest» — quindi una scansione non ha bisogno di una colonna a parte.
  'cli.column.from': 'dalle',
  'cli.column.to': 'fino alle',
  'cli.column.ju': 'ju',

  'cli.value.yangDun': 'dun yang',
  'cli.value.yinDun': 'dun yin',
  'cli.value.forward': 'in avanti',
  'cli.value.backward': 'all\'indietro',
  'cli.value.leapMonth': 'mese intercalare',
  'cli.value.minutes': '{value} min',
  'cli.value.nothingAnswered':
    "Nessun palazzo dell'intervallo risponde a quanto è stato chiesto. Questo dice che la disposizione non si è presentata, e nient'altro.",
  'cli.value.everyPalace': 'ogni palazzo, nessuna richiesta particolare',
  // 甲 non sta su nessun piatto, quindi un anno che ne è retto si cerca sotto
  // lo strumento che ne cela la decade. Detto, mai sostituito in silenzio.
  'cli.value.concealedUnder': 'cercato sotto {stem}, poiché 甲 non sta su alcun piatto',
  // Il centro non ha direzione, né porta, né spirito: ciò che vi cade si legge
  // nel palazzo in cui il centro alloggia.
  'cli.value.readAt': 'si legge in {palace}',
  'cli.value.sui': '{count} (虛歲, contando l\'anno stesso della nascita)',
  'cli.value.turns': '{count} (giri del pilastro dell\'anno)',
  'cli.value.leapTerm': '{term} intercalato',

  'cli.note.yuanFutou':
    'Lo yuan si legge dalla posizione del giorno nel ciclo di quindici del futou, non dall\'istante in cui il termine è cominciato. È una divergenza interna al chaibu, e sposta il ju nella maggior parte dei giorni.',
  'cli.note.method':
    'Posta con il metodo {method}. Altre scuole dispongono altre carte dallo stesso istante.',

  'cli.error.unknownCommand': 'Comando "{command}" sconosciuto. Prova `qimen --help`.',
  'cli.error.unknownOption': 'Opzione "{option}" sconosciuta. Prova `qimen --help`.',
  'cli.error.missingValue': 'L\'opzione "{option}" richiede un valore.',
  'cli.error.contradiction':
    'L\'opzione "{option}" dice già quale porta cercare, e "{other}" ne dice un\'altra. Togline una.',
  'cli.error.exclusive':
    'Le opzioni "{option}" e "{other}" non possono stare insieme: chiedono due letture diverse della stessa carta. Togline una.',
  'cli.error.unknownValue':
    'L\'opzione "{option}" non accetta il valore "{value}". Se non venisse controllato non corrisponderebbe a nulla, il che si legge esattamente come una disposizione che non si è mai presentata.',
  'cli.error.genderRequired':
    'I cicli decennali richiedono --gender, perché la tradizione ne trae la direzione. Senza, i pilastri restano comunque completi.',
};
