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
    'Il metodo {method} per la determinazione del ju non è implementato. Lo è soltanto chaibu, e nessun altro metodo gli viene sostituito: una carta posta con il metodo sbagliato sembra corretta e non lo è.',
  'core.error.OPTION_NOT_IMPLEMENTED':
    '"{value}" per {option} non è implementato. Lo è soltanto {implemented}, e nessun altro valore gli viene sostituito: una carta posta con l\'opzione sbagliata sembra corretta e non lo è.',
  'core.error.EPHEMERIS_FAILURE':
    'Calcolo delle effemeridi fallito al giorno giuliano {julianDay}: {reason}',
  'core.error.EMPTY_INTERVAL':
    "L'intervallo dal {from} al {to} non contiene tempo: deve finire dopo che è cominciato.",
  'core.error.INTERVAL_TOO_LONG':
    'Un intervallo di {days} giorni supera i {maximum} giorni che si possono scandire in una volta.',
  'core.error.UNKNOWN_IDENTIFIER':
    '"{value}" non è un {parameter} che il motore conosce. Non controllato non corrisponderebbe a nulla, che si legge esattamente come una disposizione che non si è mai presentata.',

  'core.warning.AMBIGUOUS_LOCAL_TIME':
    'L\'ora locale {time} del {date} ricorre due volte in {timezone} (ritorno all\'ora solare). È stata usata la prima occorrenza, quella ancora in ora legale.',
  'core.warning.NONEXISTENT_LOCAL_TIME':
    'L\'ora locale {time} del {date} non è mai esistita in {timezone} (passaggio all\'ora legale). È stato usato l\'istante immediatamente successivo.',
  'core.warning.MOSHIER_FALLBACK':
    'File di effemeridi non trovati in {path}: uso le effemeridi Moshier, che non richiedono file e sono accurate a circa un decimo di secondo d\'arco. Esegui `npm run ephe:download -w @qimendunjia/core` per i file completi.',

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

  'label.purpose.opening': 'Aprire, cominciare, trattare con un ufficio, viaggiare',
  'label.purpose.meeting': 'Incontrare qualcuno, matrimonio, chiedere un favore, riposare',
  'label.purpose.wealth': 'Denaro, commercio, cure, costruire',
  'label.purpose.documents': 'Documenti, esami, progetti, far sapere una cosa',
  'label.purpose.concealment': 'Restare defilati, evitare, lavoro delle mani',
  'label.purpose.pursuit': 'Riscuotere un credito, competere, incalzare qualcuno',
  'label.purpose.ending': 'Un funerale, una sepoltura, chiudere una cosa',
  'label.purpose.dispute': 'Una causa, una lite, ritrovare ciò che è perduto',

  'label.strength.wang': 'prospera',
  'label.strength.xiang': 'sostenuto',
  'label.strength.xiu': 'a riposo',
  'label.strength.qiu': 'imprigionato',
  'label.strength.si': 'morente',

  'label.layer.gate': 'porte',
  'label.layer.star': 'stelle',
  'label.layer.both': 'porte e stelle',

  'nav.chart': 'Qi Men',
  'nav.bazi': 'Quattro pilastri',
  'nav.moments': 'Scegliere il momento',
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
    "Sceglierne uno compila la porta qui sotto, che puoi poi cambiare. È l'associazione che la tradizione fa fra un'impresa e una porta — le sole otto porte, e nulla oltre: sul resto di quella dottrina le scuole non concordano, e qui non si prende partito.",
  'form.any': 'qualsiasi',
  'form.towards': 'Verso',
  'form.minStrength': 'Forza almeno',
  'form.without': 'Escludendo',
  'form.criteriaNote':
    'Sono disposizioni, non raccomandazioni. Il motore riferisce dove ciascuna si trova; se sia un buon momento per agire è una lettura, e spetta a te farla.',
  'form.scan': "Scandisci l'intervallo",
  'form.scanned': '{runs} carte nell\'intervallo, {matched} con un palazzo che risponde.',
  'form.showPlate': 'la scacchiera',
  'form.openChart': 'la scacchiera intera',
  'form.backToScan': 'Torna ai momenti',

  'form.working': 'Calcolo in corso…',
  'form.needed.date': 'Manca ancora una data.',
  'form.needed.interval': "Mancano ancora le due date dell'intervallo.",
  'form.needed.gender':
    'I cicli decennali richiedono il sesso, perché la tradizione ne trae la direzione. Senza, i pilastri restano comunque completi.',
  'form.jumpDate': 'Il giorno per cui la carta è posta',

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

  'footer.data': 'Dati astronomici {ephemeris} · località {geonames} (CC BY 4.0)',
  'footer.licence': 'Codice sorgente sotto licenza AGPL-3.0',
  'footer.privacy': 'Privacy',
  'footer.notes': 'Note',

  'notes.title': 'Note su ciò che viene calcolato',
  'notes.method':
    'Le carte sono poste con il metodo chaibu. Altre scuole dispongono altre carte dallo stesso istante; i metodi zhirun e maoshan non sono implementati, e vengono rifiutati invece che sostituiti in silenzio.',
  'notes.interpretation':
    'Il motore riporta disposizioni e relazioni, mai una lettura. Che una porta stia sopra un palazzo di cui controlla la fase è un fatto che chiunque può verificare sulle piastre; che cosa significhi non è nell\'output e non spetta al software dirlo.',
  'notes.certainty':
    'I numeri non sono ugualmente sicuri. Termini solari, calendario lunare e quattro pilastri sono stati verificati contro tabelle astronomiche pubblicate tramite un\'implementazione indipendente, su 1.926 date dal 1902 al 2098. La disposizione Qi Men è stata verificata contro una sola implementazione aperta: significa coerente con quella, non verificata. Le configurazioni vengono da fonti in cinese, senza alcun riferimento eseguibile.',
  'notes.script':
    'I nomi sono mostrati nella tua lingua con il cinese accanto. Il cinese è il nome, non la sua traduzione: senza, nulla di quanto è qui può essere verificato contro un libro o una seconda implementazione.',

  'privacy.title': 'Privacy',
  'privacy.nothing':
    'Nulla di ciò che digiti viene conservato. Date, ore e luoghi viaggiano nell\'indirizzo della pagina, servono a calcolare una risposta, e non vengono scritti in alcuna base di dati né in alcun registro tenuto da questo sito.',
  'privacy.address':
    'Poiché i parametri stanno nell\'indirizzo, il collegamento a una carta si porta dietro una data, un\'ora e un luogo. Condividilo solo con qualcuno a cui diresti quelle cose.',
  'privacy.storage':
    'Una cosa sola resta nel tuo browser, e solo se la chiedi: l\'aspetto che hai scelto, sotto la chiave {key}. Riportare l\'aspetto su automatico la cancella.',
  'privacy.cookies': 'Non viene impostato alcun cookie, e non c\'è alcuna analisi di traffico.',

  'cli.heading.moment': 'Istante',
  'cli.heading.pillars': 'Quattro pilastri',
  'cli.heading.chart': 'Carta Qi Men',
  'cli.heading.palaces': 'Nove palazzi',
  'cli.heading.reading': 'Lettura',
  'cli.heading.luck': 'Cicli decennali',
  'cli.heading.terms': 'Termini solari del {year}',
  'cli.heading.calendar': 'Data lunare',
  'cli.heading.patterns': 'Configurazioni',
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

  'cli.note.methodOnly':
    'Posta con il metodo chaibu. Altre scuole dispongono altre carte dallo stesso istante.',

  'cli.error.unknownCommand': 'Comando "{command}" sconosciuto. Prova `qimen --help`.',
  'cli.error.unknownOption': 'Opzione "{option}" sconosciuta. Prova `qimen --help`.',
  'cli.error.missingValue': 'L\'opzione "{option}" richiede un valore.',
  'cli.error.contradiction':
    'L\'opzione "{option}" dice già quale porta cercare, e "{other}" ne dice un\'altra. Togline una.',
  'cli.error.unknownValue':
    'L\'opzione "{option}" non accetta il valore "{value}". Non controllato non corrisponderebbe a nulla, che si legge esattamente come una disposizione che non si è mai presentata.',
  'cli.error.genderRequired':
    'I cicli decennali richiedono --gender, perché la tradizione ne trae la direzione. Senza, i pilastri restano comunque completi.',
};
