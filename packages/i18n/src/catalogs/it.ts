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
    'Database delle località non trovato in {path}. Costruiscilo una volta con `npm run geo:import -w @shipan/geo` (scarica ~215 MB da GeoNames).',
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
  'core.error.TOO_MANY_YEARS':
    'Una serie di {years} pilastri dell\'anno supera i {maximum} che si possono chiedere in una volta.',

  'core.warning.AMBIGUOUS_LOCAL_TIME':
    'L\'ora locale {time} del {date} ricorre due volte in {timezone} (ritorno all\'ora solare). È stata usata la prima occorrenza, quella ancora in ora legale.',
  'core.warning.NONEXISTENT_LOCAL_TIME':
    'L\'ora locale {time} del {date} non è mai esistita in {timezone} (passaggio all\'ora legale). È stato usato l\'istante immediatamente successivo.',
  'core.warning.MOSHIER_FALLBACK':
    'File di effemeridi non trovati in {path}: si usano le effemeridi Moshier, che non richiedono file e sono accurate a circa un decimo di secondo d\'arco. Esegui `npm run ephe:download -w @shipan/core` per i file completi.',

  'web.error.UNKNOWN_LOCATION': 'Nessun luogo ha l\'identificatore {id}.',
  'web.error.INVALID_NUMBER': '"{value}" non è un numero valido per {parameter}.',

  'mcp.error.UNKNOWN_LOCATION':
    'Nessun luogo ha l\'identificatore GeoNames {id}. Usa search_location per ottenerne uno; non inventarlo.',
  'mcp.error.INCOMPLETE_COORDINATES':
    'Le coordinate sono incomplete. Passa latitude, longitude e timezone insieme, oppure passa il location_id ottenuto da search_location.',

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

  // 六壬 — il secondo quadro. I nomi qui sotto sono glosse accanto agli hanzi e
  // mai al loro posto: 登明 è dēngmíng per ogni lettore, e a cambiare con la
  // lingua è solo la frase che dice cosa quel nome afferma.

  // 月將 — i dodici seggi del Sole, per cui il quadro viene girato. Arretrano di
  // un ramo a ogni 中氣.
  'label.yuejiang.dengming': 'chiarore che sale',
  'label.yuejiang.hekui': 'capo del fiume',
  'label.yuejiang.congkui': 'capo seguace',
  'label.yuejiang.chuansong': 'il corriere',
  'label.yuejiang.xiaoji': 'fausto minore',
  'label.yuejiang.shengguang': 'luce vittoriosa',
  'label.yuejiang.taiyi': 'il grande uno',
  'label.yuejiang.tiangang': 'perno del cielo',
  'label.yuejiang.taichong': 'grande impeto',
  'label.yuejiang.gongcao': 'scrivano dei meriti',
  'label.yuejiang.daji': 'fausto maggiore',
  'label.yuejiang.shenhou': 'sovrana divina',

  // 十二天將 — disposti attorno al nobile, in avanti o all'indietro secondo il
  // palazzo su cui il nobile è venuto a stare.
  'label.general.guiren': 'il nobile',
  'label.general.tengshe': 'il serpente alato',
  'label.general.zhuque': "l'uccello vermiglio",
  'label.general.liuhe': 'le sei armonie',
  'label.general.gouchen': 'la schiera uncinata',
  'label.general.qinglong': 'il drago azzurro',
  'label.general.tiankong': 'il vuoto',
  'label.general.baihu': 'la tigre bianca',
  'label.general.taichang': 'il costante',
  'label.general.xuanwu': 'il guerriero oscuro',
  'label.general.taiyin': 'il grande yin',
  'label.general.tianhou': 'la regina celeste',

  // Le quattro lezioni e le tre trasmissioni, per posizione.
  'label.course.1': 'prima lezione',
  'label.course.2': 'seconda lezione',
  'label.course.3': 'terza lezione',
  'label.course.4': 'quarta lezione',
  'label.transmission.chu': 'prima',
  'label.transmission.zhong': 'mediana',
  'label.transmission.mo': 'ultima',

  // 九宗門 — quale delle nove regole ha tratto le trasmissioni. Una regola e non
  // un verdetto: dice come il quadro è stato letto, mai come è andato.
  'label.liurenRule.zeike': 'furto e controllo',
  'label.liurenRule.biyong': 'il simile',
  'label.liurenRule.shehai': 'guadare il danno',
  'label.liurenRule.yaoke': 'controllo da lontano',
  'label.liurenRule.maoxing': 'al posto fisso',
  'label.liurenRule.bieze': "l'incarico separato",
  'label.liurenRule.bazhuan': 'gli otto concentrati',
  'label.liurenRule.fuyin': 'il quadro fermo',
  'label.liurenRule.fanyin': 'il quadro rovesciato',

  // 課體 — la figura nominata che il quadro è risultato essere. Portata come si
  // porta una configurazione dei nove palazzi: un nome per una disposizione.
  // 建除十二神 — i dodici ufficiali del giorno dell'almanacco. Nomi, non
  // verdetti: 危 è l'ufficiale chiamato pericolo esattamente come 死門 è la
  // porta chiamata morte, e ciò che il 協紀 dice adatto a ciascuno resta nel
  // 協紀.
  'label.officer.jian': 'stabilire',
  'label.officer.chu': 'rimuovere',
  'label.officer.man': 'pieno',
  'label.officer.ping': 'pari',
  'label.officer.ding': 'fissare',
  'label.officer.zhi': 'tenere',
  'label.officer.po': 'rompere',
  'label.officer.wei': 'pericolo',
  'label.officer.cheng': 'compiere',
  'label.officer.shou': 'raccogliere',
  'label.officer.kai': 'aprire',
  'label.officer.bi': 'chiudere',

  // 二十八宿 — le dimore, come conteggio di giorni. Solo nomi: ciò che gli
  // almanacchi appendono a ciascuna è 宜忌, e 《協紀辨方書》卷三十六 rifiuta
  // l'intera dottrina come importazione. Nemmeno il 禽象 — l'animale in
  // 鬼金羊 — è qui: la stessa fonte lo data tardo. Vedi docs/sources.md.
  'label.lodge.jiao': 'il corno',
  'label.lodge.kang': 'il collo',
  'label.lodge.di': 'la radice',
  'label.lodge.fang': 'la camera',
  'label.lodge.xin': 'il cuore',
  'label.lodge.wei3': 'la coda',
  'label.lodge.ji': 'il vaglio',
  'label.lodge.dou': 'il mestolo',
  'label.lodge.niu': 'il bue',
  'label.lodge.nv': 'la fanciulla',
  'label.lodge.xu': 'il vuoto',
  'label.lodge.wei1': 'il colmo del tetto',
  'label.lodge.shi': 'l\'accampamento',
  'label.lodge.bi13': 'il muro',
  'label.lodge.kui': 'il passo',
  'label.lodge.lou': 'il legame',
  'label.lodge.wei4': 'lo stomaco',
  'label.lodge.mao': 'la testa chiomata',
  'label.lodge.bi18': 'la rete',
  'label.lodge.zi': 'il becco',
  'label.lodge.shen': 'le tre stelle',
  'label.lodge.jing': 'il pozzo',
  'label.lodge.gui': 'il fantasma',
  'label.lodge.liu': 'il salice',
  'label.lodge.xing': 'la stella',
  'label.lodge.zhang': 'la rete tesa',
  'label.lodge.yi': 'le ali',
  'label.lodge.zhen': 'la traversa del carro',

  // 七政四餘 — i sette governatori e i quattro residui. I cinque pianeti sono
  // le cinque fasi e ne portano il nome; il Sole e la Luna stanno fuori da
  // quel conto. I quattro sono 隱曜, posizioni calcolate e non corpi, e 紫氣
  // è nominato qui e collocato in nessun luogo: la sua epoca non è citabile,
  // quindi nessuna tavola lo porta. Vedi docs/sources.md.
  'label.qizheng.taiyang': 'il sole',
  'label.qizheng.taiyin': 'la luna',
  'label.qizheng.shuixing': 'Mercurio',
  'label.qizheng.jinxing': 'Venere',
  'label.qizheng.huoxing': 'Marte',
  'label.qizheng.muxing': 'Giove',
  'label.qizheng.tuxing': 'Saturno',
  'label.qizheng.luohou': 'la testa dell\'eclissi',
  'label.qizheng.jidu': 'la coda dell\'eclissi',
  'label.qizheng.yuebei': 'l\'apogeo lunare',
  'label.qizheng.ziqi': 'il vapore purpureo',

  // 十二次 — i dodici tratti di cielo, che è come si chiama un palazzo di
  // questa tavola. Corrono all\'indietro contro i rami perché prendono il
  // nome da dove sta il Sole, e il Sole li attraversa come fanno le stagioni:
  // 春分 apre 降婁 a 戌.
  'label.ci.xuanxiao': 'il vuoto oscuro',
  'label.ci.xingji': 'l\'annale delle stelle',
  'label.ci.ximu': 'il legno spaccato',
  'label.ci.dahuo': 'il grande fuoco',
  'label.ci.shouxing': 'la stella della lunga vita',
  'label.ci.chunwei': 'la coda della quaglia',
  'label.ci.chunhuo': 'il fuoco della quaglia',
  'label.ci.chunshou': 'la testa della quaglia',
  'label.ci.shichen': 'la verità profonda',
  'label.ci.daliang': 'la grande trave',
  'label.ci.jianglou': 'il legame discendente',
  'label.ci.juzi': 'il raduno',

  // 順 e 逆 — da che parte corre un corpo, letto dal segno del suo moto
  // giornaliero e da nient\'altro. 留, la stazione, richiederebbe una soglia
  // su quel numero e nessuna fonte consultata ne enuncia una.
  'label.motion.shun': 'diretto',
  'label.motion.ni': 'retrogrado',

  // 人事十二宮 — i dodici palazzi sotto ciò di cui ciascuno è interrogato.
  // Sono numerati dal 命宮 e salgono contro i rami, che è in avanti nel
  // cielo; il verso poggia sui nomi stessi e la verifica sta in
  // docs/sources.md. Le glosse traducono il *nome* e nient'altro: che cosa si
  // chieda a un palazzo è di chi legge, come ovunque qui.
  'label.house.ming': 'la vita',
  'label.house.caibo': 'la ricchezza',
  'label.house.xiongdi': 'i fratelli',
  'label.house.tianzhai': 'terra e casa',
  'label.house.nannv': 'i figli',
  'label.house.nupu': 'i servitori',
  'label.house.fuqi': 'marito e moglie',
  'label.house.jie': 'malattia e travaglio',
  'label.house.qianyi': 'lo spostamento',
  'label.house.guanlu': 'carica e stipendio',
  'label.house.fude': 'fortuna e virtù',
  'label.house.xiangmao': 'l\'aspetto',

  // 紫微斗數 — le stelle di una tavola che non è un cielo. Nessuna di queste
  // è un corpo: 紫微 non è una stella che un telescopio trova, e 天府 non è
  // il 天輔 di una carta dunjia benché entrambe si dicano tiānfǔ. Ognuna è un
  // seggio in un conteggio, e la glossa traduce il nome e nient'altro — che
  // cosa un seggio dica di una vita spetta a chi legge, come ovunque qui.
  // Sono nominate solo le stelle di cui il 卷二 enuncia una regola, ed è
  // perché l'arredo moderno — 恩光, 天貴, 咸池, 孤辰, 寡宿, 華蓋 — manca
  // invece di restare vuoto.
  'label.ziwei.ziwei': 'la tenuità purpurea',
  'label.ziwei.tianji': 'il perno celeste',
  'label.ziwei.taiyang': 'il grande yang',
  'label.ziwei.wuqu': 'la curva marziale',
  'label.ziwei.tiantong': 'la concordia celeste',
  'label.ziwei.lianzhen': 'l\'integro e casto',
  'label.ziwei.tianfu': 'il tesoro celeste',
  'label.ziwei.taiyin': 'il grande yin',
  'label.ziwei.tanlang': 'il lupo avido',
  'label.ziwei.jumen': 'la porta grande',
  'label.ziwei.tianxiang': 'il ministro celeste',
  'label.ziwei.tianliang': 'la trave celeste',
  'label.ziwei.qisha': 'le sette uccisioni',
  'label.ziwei.pojun': 'il rompitore d\'eserciti',
  'label.ziwei.wenchang': 'il fiorire delle lettere',
  'label.ziwei.wenqu': 'la curva delle lettere',
  'label.ziwei.zuofu': 'il sostegno sinistro',
  'label.ziwei.youbi': 'il sostegno destro',
  'label.ziwei.tiankui': 'il capo celeste',
  'label.ziwei.tianyue': 'la scure celeste',
  'label.ziwei.lucun': 'l\'emolumento serbato',
  'label.ziwei.tianma': 'il cavallo celeste',
  'label.ziwei.qingyang': 'la lama levata',
  'label.ziwei.tuoluo': 'la trottola',
  'label.ziwei.huoxing': 'la stella del fuoco',
  'label.ziwei.lingxing': 'la stella della campana',
  'label.ziwei.dijie': 'la rovina terrestre',
  'label.ziwei.tiankong': 'il vuoto celeste',
  'label.ziwei.tianshang': 'la ferita celeste',
  'label.ziwei.tianshi': 'l\'inviato celeste',
  'label.ziwei.tianxing': 'la pena celeste',
  'label.ziwei.tianyao': 'la seduzione celeste',
  'label.ziwei.santai': 'le tre terrazze',
  'label.ziwei.bazuo': 'gli otto seggi',
  'label.ziwei.tianku': 'il pianto celeste',
  'label.ziwei.tianxu': 'il vacuo celeste',
  'label.ziwei.longchi': 'la peschiera del drago',
  'label.ziwei.fengge': 'la torre della fenice',
  'label.ziwei.hongluan': 'l\'uccello cremisi',
  'label.ziwei.tianxi': 'la gioia celeste',
  'label.ziwei.taifu': 'il sostegno della terrazza',
  'label.ziwei.fenggao': 'il diploma d\'investitura',
  'label.ziwei.jieshen': 'lo spirito che scioglie',
  'label.ziwei.jielukongwang': 'il vuoto della strada tagliata',
  'label.ziwei.xunzhongkongwang': 'il vuoto dentro la decade',

  // I dodici seggi, coi nomi che il 卷二 dà loro — 妻妾 e non 夫妻,
  // 奴僕 e non 交友, 官祿 e non 事業. Non sono i dodici 人事宮 del
  // 七政四餘 qui sopra: elenco diverso, ordine diverso, posati nel verso
  // opposto.
  'label.ziweihouse.ming': 'la vita',
  'label.ziweihouse.xiongdi': 'i fratelli',
  'label.ziweihouse.qiqie': 'moglie e concubina',
  'label.ziweihouse.zinu': 'i figli',
  'label.ziweihouse.caibo': 'la ricchezza',
  'label.ziweihouse.jie': 'malattia e travaglio',
  'label.ziweihouse.qianyi': 'lo spostamento',
  'label.ziweihouse.nupu': 'i servitori',
  'label.ziweihouse.guanlu': 'carica e stipendio',
  'label.ziweihouse.tianzhai': 'terra e casa',
  'label.ziweihouse.fude': 'fortuna e virtù',
  'label.ziweihouse.fumu': 'i genitori',

  // 五行局 — ritagliato dal 納音 del 命宮, e il numero nel nome è il passo
  // con cui conta la tavola di 紫微.
  'label.bureau.shuierju': 'il quadro dell\'acqua, che conta per due',
  'label.bureau.musanju': 'il quadro del legno, che conta per tre',
  'label.bureau.jinsiju': 'il quadro del metallo, che conta per quattro',
  'label.bureau.tuwuju': 'il quadro della terra, che conta per cinque',
  'label.bureau.huoliuju': 'il quadro del fuoco, che conta per sei',

  // I sette gradi della tavola che chiude il 卷二. Un grado dice dove sta
  // una stella in un ramo, non come va una vita, e nulla li somma.
  'label.brightness.miao': 'nel suo tempio',
  'label.brightness.wang': 'rigoglioso',
  'label.brightness.dedi': 'che tiene il terreno',
  'label.brightness.liyi': 'avvantaggiato',
  'label.brightness.pinghe': 'in piano',
  'label.brightness.budedi': 'senza terreno',
  'label.brightness.luoxian': 'caduto',

  // 四化 — ciò che lo stelo dell'anno di nascita opera su quattro stelle.
  'label.transform.hualu': 'volto a emolumento',
  'label.transform.huaquan': 'volto ad autorità',
  'label.transform.huake': 'volto a esame',
  'label.transform.huaji': 'volto a ostacolo',

  // 博士十二神, l'anello che cammina a partire da 祿存.
  'label.boshi.boshi': 'l\'erudito',
  'label.boshi.lishi': 'il forzuto',
  'label.boshi.qinglong': 'il drago azzurro',
  'label.boshi.xiaohao': 'lo spreco piccolo',
  'label.boshi.jiangjun': 'il generale',
  'label.boshi.zoushu': 'il memoriale',
  'label.boshi.feilian': 'il corridore del vento',
  'label.boshi.xishen': 'lo spirito della gioia',
  'label.boshi.bingfu': 'il segno della malattia',
  'label.boshi.dahao': 'lo spreco grande',
  'label.boshi.fubing': 'l\'imboscata',
  'label.boshi.guanfu': 'il magistrato',

  // 十六神 — l'anello su cui si legge una tavola di 太乙: dodici rami e i
  // quattro trigrammi d'angolo, ciascuno con un nome proprio. Il 卷二 del
  // 《太乙金鏡式經》 dà la ragione di ognuno, e le glosse seguono quelle
  // ragioni più che i caratteri soli — 呂申 è 陽氣大申, il soffio che si
  // distende, non un cognome.
  //
  // 太乙, il dio che dà il nome alla tavola, non è uno dei sedici, e non è
  // nemmeno il 太乙 che nomina il 月將 巳 di una tavola di 六壬. I tre non
  // hanno rapporto fra loro; si veda docs/sources.md.
  'label.taiyishen.dizhu': 'il signore della terra',
  'label.taiyishen.yangde': 'la virtù yang',
  'label.taiyishen.hede': 'la virtù della concordia',
  'label.taiyishen.lushen': 'il soffio disteso',
  'label.taiyishen.gaocong': 'il folto alto',
  'label.taiyishen.taiyang': 'il grande yang',
  'label.taiyishen.taijiong': 'la grande vampa',
  'label.taiyishen.taishen': 'il grande spirito',
  'label.taiyishen.dawei': 'il grande timore',
  'label.taiyishen.tiandao': 'la via del cielo',
  'label.taiyishen.dawu': 'le grandi armi',
  'label.taiyishen.wude': 'la virtù marziale',
  'label.taiyishen.taicu': 'la grande adunata',
  'label.taiyishen.yinzhu': 'il signore dello yin',
  'label.taiyishen.yinde': 'la virtù yin',
  'label.taiyishen.dayi': 'la grande giustizia',

  // Ciò che una tavola di 太乙 colloca. I due occhi sono il tutto: 文昌,
  // l'inferiore, appartiene all'ospite che riceve e 始擊, il superiore, a
  // quello che arriva, e i due conteggi che se ne traggono sono ciò per cui
  // la tavola esiste. **Quale parte sia quale non viene mai detto qui**: è il
  // primo atto del lettore, per la ragione per cui lo è lo 用神.
  'label.taiyi.taiyi': 'Tai Yi',
  'label.taiyi.wenchang': 'l\'occhio inferiore, chi riceve',
  'label.taiyi.shiji': 'l\'occhio superiore, chi arriva',
  'label.taiyi.jishen': 'il computista',
  'label.taiyi.heshen': 'il compagno dell\'anno',
  'label.taiyi.hostCount': 'il conto di chi riceve',
  'label.taiyi.guestCount': 'il conto di chi arriva',
  'label.taiyi.general': 'gran generale',
  'label.taiyi.assistant': 'aiutante',
  'label.taiyi.hostGeneral': 'il gran generale di chi riceve',
  'label.taiyi.hostAssistant': 'l\'aiutante di chi riceve',
  'label.taiyi.guestGeneral': 'il gran generale di chi arriva',
  'label.taiyi.guestAssistant': 'l\'aiutante di chi arriva',
  'label.taiyi.zhishi': 'la porta di turno',
  'label.taiyi.junji': 'la base del sovrano',
  'label.taiyi.chenji': 'la base del ministro',
  'label.taiyi.minji': 'la base del popolo',
  'label.taiyi.wufu': 'le cinque felicità',
  'label.taiyi.dayou': 'il grande giro',
  'label.taiyi.liuji': 'le sei ere',
  'label.taiyi.ju': 'disposizione',
  'label.taiyi.accumulated': 'anni accumulati',

  // Le cinque stazioni di 五福太乙, che sono palazzi con un nome e non
  // numeri: quattro angoli e il centro, quarantacinque anni ciascuno. Il
  // testo colloca ognuna in una regione dell'impero; la glossa tiene il nome.
  'label.taiyiwufu.huangmi': 'il segreto giallo',
  'label.taiyiwufu.huangshi3': 'il principio giallo',
  'label.taiyiwufu.huangshi4': 'la camera gialla',
  'label.taiyiwufu.huangting': 'la corte gialla',
  'label.taiyiwufu.xuanshi': 'il maestro oscuro',

  // Le condizioni che il 卷三 nomina e pesa in una riga ciascuna. Sono
  // verificabili sulle collocazioni — che l'occhio superiore stia dove sta
  // 太乙 chiunque può controllarlo — e ognuna è 凶 nelle parole stesse del
  // testo, ed è per questo che la sorte viaggia accanto al nome.
  'label.taiyipattern.yan': 'coprire',
  'label.taiyipattern.ji': 'colpire',
  'label.taiyipattern.po': 'incalzare',
  'label.taiyipattern.qiu': 'prigionia',
  'label.taiyipattern.guan': 'serratura',
  'label.taiyipattern.ge': 'sbarramento',
  'label.taiyipattern.dui': 'fronteggiare',
  'label.taiyimeaning.yan': 'il senso dell\'agguato e della rapina violenta',
  'label.taiyimeaning.ji':
    'che cosa sia colpire: l\'inferiore che scavalca il superiore — un ministro sopra il suo sovrano, il basso sopra ciò che è onorato — ed è usurpazione',
  'label.taiyimeaning.po':
    'incalzare di palazzo, il danno lieve e lento; incalzare di ramo, il danno urgente e rapido',
  'label.taiyimeaning.qiu': 'prigionia: il senso dell\'usurpazione e del massacro',
  'label.taiyimeaning.guan':
    'che cosa significhi la serratura: cosa temuta da generali e ministri, e non arriva fino al sovrano',
  'label.taiyimeaning.ge': 'parla del governo sbarrato fra ciò che sta sopra e ciò che sta sotto',

  // 前 e 後 sono davanti e dietro a 太乙 sull'anello; 辰 e 宮 sono le due
  // distanze che il 卷三 separa — 「宫迫災㣲緩，辰迫災急疾」.
  'label.taiyikind.qianchen': 'un seggio avanti',
  'label.taiyikind.houchen': 'un seggio indietro',
  'label.taiyikind.qiangong': 'un palazzo avanti',
  'label.taiyikind.hougong': 'un palazzo indietro',

  // 十二神 — il dio sotto cui sta il giorno. 《協紀辨方書》卷七 li deriva per
  // 天罡加建 dopo aver respinto le due spiegazioni ricevute. Sei portano 吉 e
  // sei 凶, che è tutto ciò che 黃道/黑道 ha mai significato secondo lo stesso
  // passo; ciò che il 神樞經 vi appende è 宜忌 e non è qui.
  'label.daygod.siming': 'l\'arbitro del destino',
  'label.daygod.gouchen': 'la schiera dell\'uncino',
  'label.daygod.qinglong': 'il drago azzurro',
  'label.daygod.mingtang': 'la sala della luce',
  'label.daygod.tianxing': 'il castigo celeste',
  'label.daygod.zhuque': 'l\'uccello vermiglio',
  'label.daygod.jingui': 'lo scrigno d\'oro',
  'label.daygod.tiande': 'la virtù celeste',
  'label.daygod.baihu': 'la tigre bianca',
  'label.daygod.yutang': 'la sala di giada',
  'label.daygod.tianlao': 'la prigione celeste',
  'label.daygod.xuanwu': 'il guerriero oscuro',

  'label.yeargod.taisui': 'la stella dell\'anno',
  'label.yeargod.suipo': 'il rompitore dell\'anno',
  'label.yeargod.dajiangjun': 'il grande generale',
  'label.yeargod.taiyin': 'il grande yin',
  'label.yeargod.huangfan': 'lo stendardo giallo',
  'label.yeargod.baowei': 'la coda del leopardo',
  'label.yeargod.sangmen': 'la porta del lutto',
  'label.yeargod.diaoke': 'l\'ospite in condoglianza',
  'label.yeargod.baihu': 'la tigre bianca',
  'label.yeargod.bingfu': 'il segno della malattia',
  'label.yeargod.sifu': 'il segno della morte',
  'label.yeargod.dasha': 'la grande uccisione',

  'label.yeargod.jiesha': 'l\'uccisione che deruba',
  'label.yeargod.zaisha': 'l\'uccisione della sciagura',
  'label.yeargod.suisha': 'l\'uccisione dell\'anno',

  'label.yeargod.dahao': 'il grande spreco',
  'label.yeargod.xiaohao': 'il piccolo spreco',
  'label.yeargod.suizhide': 'la virtù di ramo dell\'anno',

  'label.yeargod.suide': 'la virtù dell\'anno',
  'label.yeargod.suidehe': 'il compagno della virtù',

  'label.yeargod.zoushu': 'l\'estensore dei memoriali',
  'label.yeargod.boshi': 'l\'erudito',
  'label.yeargod.lishi': 'l\'uomo forte',
  'label.yeargod.canshi': 'la camera dei bachi',
  'label.yeargod.pobaiwugui': 'i cinque spettri della rovina',

  'label.yeargod.jinshen': 'lo spirito del metallo',

  'label.monthgod.tiande': 'la virtù del cielo',
  'label.monthgod.tiandehe': 'la virtù del cielo congiunta',
  'label.monthgod.yuede': 'la virtù del mese',
  'label.monthgod.yuedehe': 'la virtù del mese congiunta',


  'label.shensha.sanhe': 'l\'unione triplice',
  'label.shensha.linri': 'il giorno che sovrasta',
  'label.shensha.liuhe': 'l\'unione sestuplice',
  'label.shensha.dashi': 'la grande ora',
  'label.shensha.youhuo': 'la sventura errante',
  'label.shensha.tiancang': 'il granaio del cielo',
  'label.shensha.guiji': 'il ritorno vietato',
  'label.shensha.yinde': 'la virtù nascosta',
  'label.shensha.yaoan': 'la quiete necessaria',
  'label.shensha.jintang': 'la sala d\'oro',
  'label.shensha.puhu': 'il riparo universale',
  'label.shensha.shengxin': 'il cuore del saggio',
  'label.shensha.xushi': 'la discendenza continuata',
  'label.shensha.yangde': 'la virtù yang',
  'label.shensha.tianma': 'il cavallo del cielo',
  'label.shensha.bingjin': 'le armi vietate',
  'label.shensha.tufu': 'il segno della terra',
  'label.shensha.yuesha': 'l\'uccisione del mese',
  'label.shensha.dinang': 'il sacco della terra',
  'label.shensha.yuehai': 'il danno del mese',
  'label.shensha.tianli': 'il funzionario del cielo',
  'label.shensha.sili': 'le quattro separazioni',
  'label.shensha.sijue': 'le quattro recisioni',
  'label.shensha.tianshe': 'il perdono del cielo',
  'label.shensha.sixiang': 'i quattro ministri',
  'label.shensha.jieshen': 'lo scioglitore',
  'label.shensha.jiukong': 'i nove vuoti',
  'label.shensha.wuxu': 'le cinque vacuità',
  'label.shensha.wuhe': 'le cinque unioni',
  'label.shensha.wuli': 'le cinque separazioni',

  'label.keti.yuanshou': 'il capo',
  'label.keti.zhongshen': 'il riesame',
  'label.keti.zhiyi': "conoscere l'uno",
  'label.keti.shehai': 'guadare il danno',
  'label.keti.haoshi': 'la freccia di canna',
  'label.keti.tanshe': 'il colpo di fionda',
  'label.keti.hushi': 'lo sguardo della tigre',
  'label.keti.dongshe': "la serpe d'inverno, a occhi coperti",
  'label.keti.bieze': "l'incarico separato",
  'label.keti.bazhuan': 'gli otto concentrati',
  'label.keti.ziren': 'affidarsi a sé',
  'label.keti.zixin': 'fidarsi di sé',
  'label.keti.duchuan': 'la trasmissione ostruita',
  'label.keti.wuyi': 'senza appoggio',
  'label.keti.jinglan': 'il parapetto del pozzo',

  'label.purpose.opening': 'Aprire, viaggiare, un ufficio o un funzionario, commercio',
  'label.purpose.meeting': 'Incontrare qualcuno, matrimonio, chiedere un favore, riposare',
  'label.purpose.wealth': 'Denaro, guadagno, far crescere qualcosa',
  'label.purpose.documents': 'Documenti, una proposta, una nomina, un banchetto',
  'label.purpose.concealment': 'Restare defilati, evitare, ostruire qualcosa',
  'label.purpose.pursuit': 'Riscuotere un credito, competere, incalzare qualcuno',
  'label.purpose.ending': 'Un funerale, una sepoltura, chiudere una cosa',
  'label.purpose.dispute': 'Prendere un ladro, recuperare il maltolto, allarme',

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

  // I tre metodi portano il proprio nome e i due atti no, e la linea fra loro
  // sta in ciò che si nomina, non in chi legge.
  //
  // Qi Men, Liu Ren e Ba Zi sono metodi, e un metodo è una cosa cinese: il suo
  // nome è 奇門遁甲, non una descrizione di cosa fa, quindi viaggia
  // romanizzato e non tradotto come viaggia il nome di una persona. «Quattro
  // pilastri» era una traduzione di 八字, e lasciava quella sezione come
  // l'unica con una glossa addosso fra due vicine chiamate per nome.
  //
  // La consultazione e lo scegliere il momento sono **atti**, non metodi. Lì
  // si nomina qualcosa che il lettore fa, e quello si nomina nella lingua del
  // lettore, come tutto ciò che opera.
  //
  // Senza segni di tono, a differenza di ogni altro nome: sono le forme
  // staccate e maiuscole che un lettore incontra in stampa, non le letture che
  // il motore porta accanto ai propri hanzi.
  'nav.qimen': 'Qi Men',
  'nav.bazi': 'Ba Zi',
  'nav.liuren': 'Liu Ren',
  'nav.qizheng': 'Qi Zheng',
  'nav.ziwei': 'Zi Wei',
  'nav.taiyi': 'Tai Yi',
  // La forma lunga di un nome, portata dalla sezione che si sta leggendo e da
  // nessun'altra. Quattro dei sei nomi stanno accorciati nella barra, come si
  // accorciano parlando; la sezione corrente dice invece il proprio nome per
  // intero, che è dove un nome vale la sua lunghezza. 八字 non si accorcia e
  // 太乙 non si allunga: si veda il catalogo inglese per la ragione della
  // seconda.
  'nav.qimen.full': 'Qi Men Dun Jia',
  'nav.liuren.full': 'Da Liu Ren',
  'nav.qizheng.full': 'Qi Zheng Si Yu',
  'nav.ziwei.full': 'Zi Wei Dou Shu',
  'nav.moments': 'Scegliere il momento',
  'nav.consult': 'Consultazione',
  'nav.sections': 'Sezioni',

  // La sezione che percorre carte Qi Men, nominata con l'arte che percorre.
  // L'etichetta della nav non può portarlo — un'intestazione dice dove stanno
  // le cose, non di cosa sono fatte — e qui serve a chi legge i risultati.
  // La sezione di 太乙. Il titolo glossa il nome che la barra può solo
  // stampare, e va al tab e a chi legge con uno screen reader anziché sopra la
  // tavola: quale sia la sezione lo dice già la nav, come per ogni altra
  // tavola. Il paragrafo che stava sotto — di che cosa questa tavola è
  // funzione, e che cosa si rifiuta di dire — era una prefazione davanti a
  // un'immagine che si è venuti a guardare, e il suo posto sono le note.
  'taiyi.title': 'Tai Yi — la tavola di un anno',
  'form.year': 'Anno',
  'form.copyTaiyi': 'Copia la tavola come testo',

  'moments.title': 'Scegliere il momento — Qi Men',
  'moments.lead':
    'Ogni ora fra due date viene posta come carta Qi Men, e sono elencate quelle che rispondono a ciò che indichi qui sotto. Criteri, non raccomandazioni: cosa renda un\'ora buona per agire è una lettura, ed è tua.',

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
  'form.placeRemove': 'Togli {place}',
  'form.legend': 'L\'istante e il luogo',

  'form.coordinates': 'Coordinate',
  'form.coordinatesLatitude': 'Latitudine — gradi, positiva a nord',
  'form.coordinatesLongitude': 'Longitudine — gradi, positiva a est',
  'form.coordinatesRemove': 'Togli le coordinate',
  'form.coordinatesReset': 'Torna a quelle del luogo',
  'form.timezone': 'Fuso orario',

  'form.options': 'Opzioni',
  'form.optionsSet': 'Opzioni modificate: {count}',
  'form.moment': 'L\'istante',
  'form.momentNote':
    'Lasciali vuoti e la carta è posta per l\'istante in cui premi, nell\'ora del luogo qui sopra — che è l\'uso classico. Compilali per porre la domanda a un altro momento.',
  'form.momentNow': 'Torna ad adesso',
  'form.calculation': 'Come si calcola',
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
  'form.needed.question':
    'Manca ancora una domanda: il prompt è costruito perché la carta sia letta alla luce di una domanda.',
  'form.needed.birth':
    'Manca ancora una data di nascita. Questo quadro è steso su una nascita, e una data vuota sarebbe oggi.',
  'form.needed.matter':
    'Manca ancora ciò che stai guardando. Su questo quadro non c\'è nessuno e ad esso non si chiede nulla, quindi senza una faccenda la lettura può solo descrivere la figura.',
  'form.needed.gender':
    'I cicli decennali richiedono il sesso, perché la tradizione ne trae la direzione. Senza, i pilastri restano comunque completi.',
  'form.jumpDate': 'Il giorno per cui la carta è posta',

  'form.strengthLegend': 'Come stanno la stella e la porta rispetto alla stagione',

  'form.copyChart': 'Copia la carta come testo',
  'form.copyBoard': 'Copia il quadro come testo',
  'form.copyPillars': 'Copia i pilastri come testo',
  'form.copyPrompt': 'Copia il prompt',
  'form.print': 'Stampa',
  'form.copied': 'Copiato',
  'form.copying': 'Preparo…',
  'form.copyFailed':
    'Gli appunti non hanno accettato il testo — succede fuori da una connessione cifrata. Il testo è qui: selezionalo e copialo a mano.',
  'form.copyFallback': 'Il testo, da copiare a mano',
  'form.copyUnread': 'Non è stato possibile rileggere la carta.',

  'consult.title': "Chiedere a un'AI di leggere un quadro",
  // La nascita, offerta accanto alla domanda e non al suo posto. Quello che
  // produce è un 年命: la carta resta quella dell'istante e la nascita vi si
  // cerca dentro, che è ciò che prescrive il 《遁甲演義》 ed è il rovescio di
  // una carta natale.
  'consult.birth': 'La tua nascita, se la vuoi nella carta',
  'consult.birthDate': 'Data di nascita',
  'consult.birthGender': 'Sesso — ne dipende solo il verso del conteggio dello 行年',
  'consult.birthNote':
    'La carta resta posta per l\'istante in cui chiedi. Quello che la nascita aggiunge è dove cade dentro di essa — 本命 běnmìng, l\'anno in cui sei nato, e 行年 xíngnián, l\'anno che stai vivendo.',
  'consult.lead':
    'Poni una domanda, dai una nascita, oppure indica un anno, e ottieni un prompt pronto — da incollare in ChatGPT, Claude o un altro assistente.',
  'consult.cast': 'Poni la domanda',
  'consult.lay': 'Stendi il quadro',
  'consult.year': 'L\'anno su cui il quadro è steso',
  'consult.yearNote': 'Lascialo vuoto per l\'anno in cui siamo.',
  'consult.changeBirth': 'Cambia la nascita',
  'consult.changeMatter': 'Cambia ciò che stai guardando',
  'consult.change': 'Cambia la domanda',
  'consult.castAt': 'Posto per il {when}',
  'consult.castFailed': 'Non è stato possibile porre il quadro.',



  'form.promptPrivacy': 'I dati inseriti verranno inclusi nel prompt.',
  'form.question': 'La tua domanda',
  'form.matter': 'Che cosa stai guardando quest\'anno',
  'form.matterPlaceholder': 'Una situazione con due parti — due organizzazioni, due parti di una trattativa, due forze in un campo',
  'form.questionPlaceholder.qimen':
    'Una cosa da fare e il momento di farla — se accettare, se partire, se aprire adesso una trattativa o aspettare',
  'form.questionPlaceholder.liuren':
    'Una situazione già in corso e chi ci sta dentro — come stanno le cose, che cosa ha in mente l\'altra parte, che cosa si sta muovendo',

  'step.shichen': 'doppia ora',
  'step.day': 'giorno',
  'step.month': 'mese',
  'step.year': 'anno',
  'step.now': 'adesso',

  'step.now.title': 'Torna all\'istante presente',
  'step.now.year': 'Torna all\'anno in corso',
  'step.shichen.back': 'La doppia ora precedente',
  'step.shichen.forward': 'La doppia ora successiva',
  'step.day.back': 'Il giorno prima',
  'step.day.forward': 'Il giorno dopo',
  'step.month.back': 'Il mese prima',
  'step.month.forward': 'Il mese dopo',
  'step.year.back': 'L\'anno prima',
  'step.year.forward': 'L\'anno dopo',

  'footer.disclaimer':
    'Questo sito ha il solo scopo di offrire spunti di riflessione e intrattenimento, in nessun caso sostituisce il parere di professionisti per questioni mediche, legali, finanziarie o altro.',
  'footer.data': 'Dati astronomici {ephemeris} · località {geonames} (CC BY 4.0)',
  'footer.licence': 'Codice sorgente sotto licenza AGPL-3.0',
  'footer.privacy': 'Privacy',
  'footer.notes': 'Note',

  'notes.title': 'Note',
  'notes.lead':
    'Che cosa calcola questo motore, su che cosa si regge ogni numero, e con quanta forza. Niente in questa sezione è una lettura: è il resoconto dello strumento.',
  'notes.claim':
    'Ogni quantità qui dentro è stata verificata contro qualcosa di esterno a sé, e non tutte contro qualcosa di ugualmente solido. Dire quale sia quale è tutto ciò che questa sezione fa — un termine solare e una tavola tramandata non sono lo stesso genere di fatto, e un lettore che non possa distinguerli è stato fuorviato dalla presentazione più che dai dati.',
  'notes.building':
    'Qui non c’è un glossario, ed è deliberato: questa interfaccia deve essere utilizzabile senza. Ogni nome è detto dove viene usato — il glifo, la lettura e la parola — e un glossario che diventasse il posto dove andare a cercare sarebbe il segno che qualcos’altro su questo sito ha smesso di spiegarsi.',
  'notes.kind.derived': 'derivata',
  'notes.kind.written': 'scritta',
  'notes.answers.instruments':
    'Che cosa viene calcolato, strato per strato: su che cosa si posa ciascuno, e ogni punto in cui le scuole divergono.',
  'notes.answers.sources':
    'Su che cosa si regge ogni quantità, contro che cosa è stata verificata, e quanto saldamente è tenuta.',

  'notes.layer.pillars': 'Lo strato calendariale',
  'notes.takes': 'Si calcola da',
  'notes.takes.pillars':
    'un istante e un luogo, con i due confini che dicono come si legge un istante.',
  'notes.takes.qimen': 'un istante e un luogo.',
  'notes.takes.liuren': 'un istante e un luogo.',
  'notes.takes.taiyi': 'un anno, e nient’altro: nessun luogo, nessuna ora, nessuno.',
  'notes.takes.qizheng': 'una nascita — un istante e un luogo.',
  'notes.takes.ziwei':
    'una nascita, contata sul calendario lunare, e un sesso dove un anello si percorre in una direzione.',
  'notes.takes.bazi': 'una nascita, e un sesso dove i cicli di fortuna ne hanno bisogno.',
  'notes.takes.almanac': 'una data civile, calcolata su 120°E come lo è il calendario lunare.',
  'notes.takes.nianming': 'una nascita, collocata dentro una carta già tratta per un momento.',
  'notes.does.pillars':
    'I termini solari, la data lunare e i quattro pilastri — ciò su cui è costruita ogni tavola qui sotto, e lo strato a cui appartengono i due confini.',
  'notes.does.qimen':
    'Nove palazzi: una tavola di terra fissata dal ju, una tavola di cielo ruotata sull’ora, e le stelle, le porte e gli spiriti che vi stanno sopra.',
  'notes.does.liuren':
    'Dodici rami ruotati dal generale del mese, quattro lezioni lette dalla rotazione, e tre trasmissioni tratte dalle quattro secondo nove regole con un nome.',
  'notes.does.taiyi':
    'La tavola di un anno: sedici divinità in nove palazzi, e i conti dell’ospite e dell’ospitante. Non c’è nessuno sopra.',
  'notes.does.qizheng':
    'I sette governatori e tre dei quattro residui, collocati contro le ventotto dimore e i dodici palazzi.',
  'notes.does.ziwei':
    'Dodici seggi contati dal mese lunare e dall’ora, le stelle che il libro vi colloca, e il grado che dà a ciascuna.',
  'notes.does.bazi':
    'I quattro pilastri letti per esteso: gli steli nascosti, le dieci divinità, i dodici stadi, le immagini del 納音 nàyīn, i cicli di fortuna e un conteggio dei cinque elementi.',
  'notes.does.almanac':
    'La pagina che un almanacco stampa per una data: l’ufficiale del giorno, la dimora che lo tiene, le dodici divinità, gli orientamenti che l’anno fissa, e gli shensha che un giorno porta o non porta.',
  'notes.does.nianming':
    'Dove una persona sta dentro una carta del momento — il pilastro del suo anno di nascita, e il pilastro dell’anno che sta vivendo.',

  'notes.instruments.title': 'Che cosa viene calcolato',
  'notes.instruments.lead':
    'Strato per strato, e sotto ciascuno i punti in cui le scuole divergono. Ognuno di essi è un parametro con un valore predefinito dichiarato: il valore che questo motore prende è segnato, quelli che dichiara e non calcolerà sono segnati anch’essi, e niente viene scelto in silenzio.',
  'notes.instruments.wider':
    'Questo elenco è più lungo di quello in testa alla pagina, e la differenza merita una frase: su che cosa si possa posare una consultazione è una domanda più stretta di che cosa venga calcolato qui. L’almanacco è la pagina di un libro pubblicato e non una tavola, lo strato calendariale sta sotto tutte, e un 年命 niánmìng è una nascita collocata dentro una carta tratta per un momento.',
  'notes.column.parameter': 'Parametro',
  'notes.column.values': 'Valori',
  'notes.default': 'predefinito',
  'notes.refused': 'rifiutato',
  'notes.noParameters':
    'Nessuna divergenza propria: si regge interamente sullo strato calendariale, e sono i parametri qui sopra a spostarlo.',
  'notes.parameter.method': 'Come si stabilisce il ju.',
  'notes.parameter.yuan': 'Da dove si conta il terzo del termine, sotto 拆補 chāibǔ.',
  'notes.parameter.plate': 'Come si ricava la tavola di cielo.',
  'notes.parameter.centreLodging':
    'Dove alloggia il centro, che non ha direzione, né porta, né spirito propri.',
  'notes.parameter.system': 'Quale famiglia di carta: dell’ora, del giorno, del mese o dell’anno.',
  'notes.parameter.trueSolarTime':
    'Se l’ora dell’orologio venga corretta sul Sole del luogo.',
  'notes.parameter.yearBoundary': 'Dove comincia l’anno contato.',
  'notes.parameter.dayBoundary': 'Dove il giorno cambia.',
  'notes.parameter.shensha': 'Quale registro di shensha porta la pagina dell’almanacco.',
  'notes.parameter.yuejiang':
    'Quando il Sole cambia palazzo, che è ciò che insedia il generale del mese.',
  'notes.parameter.guiren': 'Quale trasmissione del verso insedia il nobile.',
  'notes.parameter.zhouye': 'Dove si taglia il giorno, per i seggi diurno e notturno del nobile.',
  'notes.parameter.xiudu': 'Dove cominciano le ventotto dimore.',
  'notes.parameter.ziqi': 'Se 紫氣 zǐqì entri, e per quale trasmissione.',
  'notes.parameter.luohou':
    'Quale nodo porta il nome 羅睺 luóhóu, e all’altro tocca 計都 jìdū.',
  'notes.parameter.minggong': 'Come si trova il palazzo del sé.',
  'notes.parameter.gong': 'Dove si tagliano i dodici palazzi.',
  'notes.parameter.epoch': 'Da quale 上元積年 shàngyuánjīnián corre il conto.',
  'notes.parameter.ji': 'In quale registro si posa la tavola.',
  'notes.parameter.leapMonth': 'Che cosa conta una nascita in un mese intercalare.',
  'notes.parameter.sihua': 'Quale tavola delle quattro trasformazioni.',
  'notes.parameter.huoling': 'Come si collocano 火星 huǒxīng e 鈴星 língxīng.',
  'notes.parameter.daxian': 'Dove si apre il primo decennio dei grandi limiti.',
  'notes.parameter.count': 'Come si contano gli anni vissuti.',

  'notes.answers.refusals':
    'Che cosa deliberatamente non viene calcolato, chi lo chiede, e perché non è qui.',
  'notes.answers.readings':
    'Che cosa un prompt commissiona e che cosa vieta, e che cosa non esce mai dal tuo browser.',
  'notes.askedBy': 'Lo chiede',
  'notes.checked': 'Ultima verifica contro il motore il {date}.',

  'notes.refusals.title': 'Che cosa non viene calcolato',
  'notes.refusals.lead':
    'Il motore non risponde a nessuna domanda, che non è come dire che non dica nulla. Quel che segue è una voce per ciascuno: che cosa viene rifiutato, chi lo chiede, e perché non è qui.',
  'notes.refusals.carries':
    'Ciò che invece porta è un attributo che le fonti tramandano concordi, dove quell’attributo appartiene alla configurazione e non alla situazione di qualcuno — e viaggia come identificatore e glifo, mai come prosa. Un verdetto che arriva dentro una glossa tradotta è un verdetto che niente può mettere alla prova.',
  'notes.refusals.yongshen.title': 'Lo 用神 yòngshén',
  'notes.refusals.yongshen.asks': 'chiunque tragga una carta per una domanda.',
  'notes.refusals.yongshen.body':
    'Quale palazzo riguardi ciò che si sta chiedendo è una scelta del lettore, fatta per quella domanda. Senza, la tavola è una mappa senza spillo — e sceglierlo è il primo atto interpretativo, non una consultazione. Un prompt commissiona la scelta e ne esige la dichiarazione; il motore non la compie mai.',
  'notes.refusals.geju.title': 'Le configurazioni messe in ordine, e il palazzo migliore',
  'notes.refusals.geju.asks': 'chiunque voglia sapere qual è il palazzo buono.',
  'notes.refusals.geju.body':
    'Le configurazioni viaggiano, con la sorte che le fonti tramandano accanto a loro: 門迫 ménpò è oppressione nel testo che la nomina, e un motore che la lasciasse cadere starebbe redigendo le proprie fonti. Un ordine su di esse non viaggia. Una carta con quattro configurazioni infauste non è un cattivo momento per fare qualcosa — cattivo è una parola su un’impresa, e qui nessuna impresa è nota.',
  'notes.refusals.ordering.title': 'Mettere in ordine due ore, e datare un esito',
  'notes.refusals.ordering.asks': 'chi sceglie un momento, e chiunque voglia sapere quando.',
  'notes.refusals.ordering.body':
    'Scegliere il momento percorre un intervallo e riferisce dove al suo interno una cosa si trovi, contro criteri che sei tu a dichiarare. Non mette in classifica ciò che trova, e le sue risposte portano una direzione oltre a un’ora — la direzione è metà della risposta e non va mai riferita da sola. Datare un esito è rifiutato del tutto: è la previsione che questo progetto non fa.',
  'notes.refusals.advice.title': 'Consigli',
  'notes.refusals.advice.asks': 'quasi tutti, prima o poi.',
  'notes.refusals.advice.body':
    'Nessuna lettura qui dà pareri medici, psichiatrici, legali o finanziari, numeri fortunati, pronostici di gioco, un partner giudicato o una compatibilità stabilita. Dove si commissiona la lettura di una vita i verbi restano condizionali — «tende a», mai «accadrà» — e il potere sulle scelte di una persona e sul suo cammino resta suo.',
  'notes.refusals.purposes.title': 'Quale palazzo sta per quale parte di una vita',
  'notes.refusals.purposes.asks':
    'i lettori del materiale moderno sul 年命 niánmìng, e i modelli, con molta sicurezza.',
  'notes.refusals.purposes.body':
    'Rifiutato ovunque compaia un 年命, e detto su ogni superficie anziché una volta sola, perché è qui che un modello inventa più liberamente. Ciò che viene portato è il pilastro dell’anno di nascita e il pilastro dell’anno che si sta vivendo, i palazzi in cui i due cadono, e di che cosa è fatto il terreno sotto di loro. Poi si ferma: i verdetti che il testo dà su quel terreno hanno bisogno che una domanda sia stata posta.',
  'notes.refusals.natalQimen.title': 'Una carta di dunjia tratta su una nascita',
  'notes.refusals.natalQimen.asks': 'la letteratura moderna sul Qi Men natale.',
  'notes.refusals.natalQimen.body':
    'Una nascita entra in una carta, mai il contrario: il testo classico mette l’anno della persona dentro la carta del momento, e la carta non si sposta per la nascita. L’errore ricorre perché la carta natale occidentale è un caso di una classe che questa tradizione riempie già in più modi — perciò un’arte che nasce sulla vita ha una tavola propria, 八字 bāzì, 七政四餘 qīzhèngsìyú, 紫微斗數 zǐwēidǒushù, e mai quella del dunjia.',
  'notes.refusals.taiyiReadings.title': 'Le letture ricevute del 太乙 tàiyǐ',
  'notes.refusals.taiyiReadings.asks': 'chiunque apra il testo.',
  'notes.refusals.taiyiReadings.body':
    'La dottrina tramandata di questa tavola è dinastica — quale stato cade, in quale anno un esercito si spezza — datata, falsificabile da nessuno, e resta fuori. Le letture palazzo per palazzo dello stesso capitolo sono declinate per intero, perché dietro di esse non c’è alcuno strato che non sia dinastico. Ciò che viaggia è quel che il testo dice che una figura è; dove non dice nulla, viaggia il silenzio.',
  'notes.refusals.hostGuest.title': 'Chi è 主 zhǔ e chi è 客 kè',
  'notes.refusals.hostGuest.asks': 'ogni lettore di una tavola di 太乙, subito.',
  'notes.refusals.hostGuest.body':
    'Il motore nomina due conti e si ferma. Assegnare ospitante e ospite è il primo atto interpretativo che quel sistema richiede, ed è del lettore esattamente come lo 用神. Un prompt lo commissiona e ne esige la firma.',
  'notes.refusals.dayMaster.title': 'Un signore del giorno forte o debole, e ciò che compensa',
  'notes.refusals.dayMaster.asks': 'ogni lettore dei quattro pilastri.',
  'notes.refusals.dayMaster.body':
    'I cinque elementi arrivano contati sugli otto caratteri, zeri compresi, perché un’assenza pesa quanto un’abbondanza — e il conteggio è stampato perché nessuno lo rifaccia. Dichiarare il signore del giorno forte o debole, e scegliere che cosa compensi un’assenza, sono passi di un metodo: le scuole divergono su come si faccia, perciò la scelta si compie ad alta voce nella lettura, con il metodo nominato.',
  'notes.refusals.ziqi.title': '紫氣 zǐqì, il quarto residuo',
  'notes.refusals.ziqi.asks': 'chi si aspetta quattro 餘 yú su una tavola di 七政四餘.',
  'notes.refusals.ziqi.body':
    'Tre dei quattro sono collocati dalle effemeridi. Il quarto manca per mancanza di una verifica e non di una regola: la trasmissione esiste, un’epoca citabile no, e nulla soppesa la sua costante perché soppesarla vorrebbe dire avere qualcosa in cielo contro cui verificarla. Il parametro è dichiarato e spento, così l’assenza è visibile invece che tacita.',
  'notes.refusals.feixing.title': 'Le collocazioni delle 十八飛星 shíbāfēixīng',
  'notes.refusals.feixing.asks': 'chi ha in mano entrambi i libri del 紫微斗數.',
  'notes.refusals.feixing.body':
    'Quell’arte nomina due tavole e questo motore ne calcola una. L’altra trasmissione conta diciotto stelle a partire dal ramo dell’anno, non ha ufficio dei cinque elementi, non ha 天府 tiānfǔ, e non porta nessuna delle quattordici stelle principali. Una collocazione portata da una all’altra è un innesto e non una lacuna colmata — lo stesso errore della carta natale di dunjia, più piccolo e fra due libri che condividono il titolo.',
  'notes.refusals.maoshan.title': '茅山 máoshān',
  'notes.refusals.maoshan.asks': 'il parametro che lo elenca.',
  'notes.refusals.maoshan.body':
    'Non esiste alcun riferimento, eseguibile o tramandato, contro cui una carta 茅山 possa essere falsificata. È rifiutato per nome anziché sostituito, perché una carta tratta con il metodo sbagliato sembra giusta e non lo è. Sta nell’elenco di ciò che è dichiarato e non implementato, e non ci si aspetta che ne esca.',
  'notes.refusals.placeFromName.title': 'Un luogo da un nome',
  'notes.refusals.placeFromName.asks': 'ogni API di comodo.',
  'notes.refusals.placeFromName.body':
    'Qui niente trasforma un nome in un luogo. Ci sono decine di paesi che si chiamano Roma, e scegliere il più popoloso per qualcuno produce una carta che sembra giusta ed è sbagliata. Ciò che le superfici accettano è un identificatore scelto da una ricerca, o coordinate con un fuso, o un identificatore raffinato da coordinate — e mezza coppia viene rifiutata anziché letta a metà.',
  'notes.refusals.latitude.title': 'La latitudine, in qualunque calcolo',
  'notes.refusals.latitude.asks': 'chi dà per scontato che una carta usi entrambe le coordinate.',
  'notes.refusals.latitude.body':
    'È la longitudine a spostare una tavola. La latitudine viene portata e stampata e non entra in alcun calcolo. L’unico metodo che la leggerebbe — tagliare i dodici palazzi del 七政四餘 per case — è un parametro dichiarato con quel valore rifiutato. Il limite è detto qui e non nel modulo: un controllo che si apre apposta per digitarci una longitudine lo apre chi sa che cosa sia.',
  'notes.refusals.twoBoards.title': 'Due tavole di uno stesso istante, in un solo prompt',
  'notes.refusals.twoBoards.asks': 'la richiesta di funzionalità più ovvia.',
  'notes.refusals.twoBoards.body':
    'Una consultazione prende un solo strumento, scelto prima della pressione e in nessun momento dopo. Dove due tavole concordano è spesso un fatto solo stampato due volte — una carta di dunjia e una tavola di 六壬 condividono il pilastro del giorno, la decade, i rami vuoti e cinque degli otto spiriti — e un modello che lo legga come conferma conta un dato per due con assoluta sicurezza.',

  'notes.readings.title': 'Consegnare una tavola a un modello',
  'notes.readings.lead':
    'Che cosa un prompt commissiona, che cosa vieta, e che cosa non esce mai dal tuo browser.',
  'notes.readings.computed':
    'Una tavola viaggia calcolata e mai come data. Un modello a cui si consegnino una data e un luogo trae la carta a memoria e la sbaglia, e una carta sbagliata letta bene è la cosa peggiore che questo progetto possa produrre: niente a valle la intercetta, perché è identica a una giusta.',
  'notes.readings.oneBoard.title': 'Una tavola sola, mai due dello stesso istante',
  'notes.readings.oneBoard.body':
    'Una consultazione prende un solo strumento, scelto prima della pressione e in nessun momento dopo. Le tavole si sovrappongono: una carta di dunjia e una tavola di 六壬 liùrén condividono il pilastro del giorno, la decade, i rami vuoti e cinque degli otto spiriti; i dodici palazzi del 七政四餘 sono l’anello su cui siede un generale di 六壬; i quattro pilastri sono il substrato da cui le altre sono costruite. Nessuna regola tramandata combina i tre 式 shì. Il 太乙 non si sovrappone a nessuna e la regola vale lo stesso, perché un modello a cui si dia una tavola di un anno accanto a una di una persona legge l’anno sulla persona.',
  'notes.readings.threeKinds.title': 'Tre generi, e il genere decide che cosa ti viene chiesto',
  'notes.readings.threeKinds.body':
    '卜 bǔ — 奇門 e 六壬 — prende una domanda, e la tavola è tratta nell’istante della pressione: la domanda viene prima della trazione, o è una didascalia su una tavola che c’era già. 命 mìng — 八字, 七政四餘, 紫微斗數 — prende una nascita e non ti chiede nulla. 天 tiān, che è il solo 太乙, prende un anno e una materia: nessuna domanda, nessuna persona, nessun luogo e nessuna ora.',
  'notes.readings.questionStays.title': 'La domanda non raggiunge mai il server',
  'notes.readings.questionStays.body':
    'A un endpoint di prompt viene detto che una domanda esiste e mai quale sia: il prompt finisce sulla riga che la introduce, e il tuo browser aggiunge il testo prima che il tutto finisca negli appunti. Una materia viaggia allo stesso modo. Questo progetto non parla con nessun modello, non tiene alcuna chiave e non manda niente da nessuna parte.',
  'notes.readings.consultationOnly.title': 'Un prompt si costruisce in un solo posto',
  'notes.readings.consultationOnly.body':
    'La consultazione è dove una tavola viene consegnata, ed è l’unica superficie che costruisca un prompt — un prompt è un chiedere, e sta dove si chiede. Le sezioni intitolate a un’arte mostrano tavole e le loro trascrizioni, e chiedere lì è navigare. La consultazione stampa dalla pagina e mai da un indirizzo proprio, per la stessa ragione: a un indirizzo bisognerebbe dire qual è la domanda.',
  'notes.readings.bu.title': 'Che cosa commissiona un prompt di 卜 bǔ',
  'notes.readings.bu.body':
    'Una carta trattiene lo 用神 e lo dichiara: quale palazzo riguardi la domanda è scelta del lettore, e il prompt ne esige la dichiarazione. Una tavola di 六壬 consegna le sue tre trasmissioni già tratte, per procedura, e il prompt dice di non riderivarle — mentre da quale delle quattro lezioni leggere resta del lettore.',
  'notes.readings.ming.title': 'Che cosa commissiona un prompt di 命 mìng',
  'notes.readings.ming.body':
    'Il soggetto è la persona su cui la tavola è stata posata, non la tavola. La risposta è disposta in sei movimenti: l’avvertenza, la nascita situata con parole del modello, la tavola letta intera a partire da un centro, i temi di una vita in sezioni brevi intitolate a un tema e mai a un fattore, l’elenco di ispezione da cui quelle sezioni attingono, e una chiusura che apre. Ogni scelta viaggia firmata — quale seggio o divinità porti un tema si dice nel momento in cui lo si sceglie, il metodo di una scuola arriva nominato come di quella scuola, e l’elemento che compensa resta non calcolato e viene scelto ad alta voce.',
  'notes.readings.tian.title': 'Che cosa commissiona un prompt di 天 tiān',
  'notes.readings.tian.body':
    'Una lettura è per una materia, e una materia non è una domanda: nomina ciò che si sta guardando — un campo visivo con due parti dentro, che è ciò di cui i due conti sono conti. Senza, il prompt legge la figura e dichiara che l’assegnazione non è mai stata fatta, invece di mandare un modello a inventarsi due parti. Il registro è descrittivo e mai predittivo, e ogni superficie che stampi questa tavola dice che i suoi nove palazzi sono numerati con uno scarto di un seggio rispetto al 洛書 luòshū.',
  'notes.readings.staysOut.title': 'Che cosa resta fuori da un prompt',
  'notes.readings.staysOut.body':
    'Quanto sia sicuro ogni numero resta nella documentazione che un agente può consultare. Incollato dentro un prompt diventava un paragrafo che il modello recitava senza che glielo si chiedesse, accanto a un’avvertenza che già dice che questo è intrattenimento. L’eccezione è un limite su una quantità che il prompt sta già dicendo a un modello come leggere: una cautela che arriva insieme all’istruzione che la governa è parte dell’istruzione. La prova è se togliendo quella riga resti un’istruzione che un modello possa seguire con sicurezza e sbagliando.',
  'notes.readings.disclaimer.title': 'L’avvertenza viaggia',
  'notes.readings.disclaimer.body':
    'Il prompt porta con sé l’avvertenza che porta il piede di pagina di questo sito, come istruzione a pronunciarla: questo è spunto di riflessione e intrattenimento, non sostituisce il parere di un professionista su nulla, e il potere sulle scelte di una persona e sul suo cammino resta suo. Un prompt viaggia, e un’avvertenza lasciata sulla pagina da cui è stato copiato era scritta per qualcuno che lì non c’è più.',

  'notes.sources.title': 'Da dove vengono i numeri',
  'notes.sources.lead':
    'Una riga per quantità: da che cosa il motore la ricava, contro che cosa è stata misurata, e su quale rung della scala qui sotto questo la colloca.',
  'notes.ladder.title': 'La scala dell’evidenza',
  'notes.ladder.lead':
    'Non tutto è stato verificato contro qualcosa di ugualmente solido, e sapere su che cosa si regge una quantità non è ancora poterla soppesare accanto alla sua vicina. Questi sono i rung, dal più forte, con il numero di quantità tenute a ciascuno.',
  'notes.held': '{count} nel registro',
  'notes.rung.0': 'Misurata',
  'notes.rung.0.means':
    'Una risposta delle effemeridi: si interroga il cielo e la risposta si legge. Non è affatto una regola tramandata, ed è per questo che sta sopra i rung sottostanti e non su di essi.',
  'notes.rung.1': 'Un riferimento eseguibile',
  'notes.rung.1.means':
    'Un altro programma la calcola, indipendentemente da questo, ed è stato eseguito sull’intero dominio anziché per campione. Dove la materia è una tradizione controversa questo significa coerente con un’implementazione diffusa, mai verificata.',
  'notes.rung.2': 'Due testi che concordano',
  'notes.rung.2.means':
    'Due fonti tramandate, indipendenti l’una dall’altra, che nominano la stessa cosa allo stesso modo. È lo standard per tutto ciò che non si può derivare.',
  'notes.rung.3': 'Sovradeterminazione',
  'notes.rung.3.means':
    'Una struttura con più vincoli che libertà, per cui una risposta sbagliata rompe molte cose insieme e quella giusta non ne rompe nessuna.',
  'notes.rung.4': 'Un testo che verifica sé stesso',
  'notes.rung.4.means':
    'Un testimone solo, esaustivo o ridondante su ciò che è in questione, così da poter essere tenuto al proprio stesso resoconto.',
  'notes.rung.5': 'Un testo, non verificato',
  'notes.rung.5.means': 'Una fonte sola, senza nulla di disponibile contro cui verificarla.',
  'notes.rung.none': 'Nulla registrato',
  'notes.rung.none.means':
    'Il motore porta la quantità e nessuna fonte la sostiene. Dove accade lo dice anche il disegno — quei nomi restano senza colore finché una non arriva.',
  'notes.ladder.notAVerdict':
    'Un rung non è un verdetto. Dice che cosa potrebbe andare storto senza che nessuno se ne accorga, che è cosa diversa da quanto storto sia qualcosa: il telaio delle ventotto dimore è retto da sovradeterminazione ed è esatto a un settantesimo della domanda più stretta che gli si ponga mai. E un rung non è nemmeno una proprietà della quantità — si sposta quando si sposta lo scaffale, in entrambe le direzioni, e una fonte che si limita a confermare lo sposta quanto una che contraddice.',
  'notes.ladder.quoted':
    'La tavola qui sotto è citata e non tradotta. È un registro di citazioni — le quantità come le nomina il motore, edizioni, capitoli, i programmi contro cui ciascuna è stata misurata e gli intervalli su cui sono stati eseguiti — e questo progetto lo tiene in inglese, la lingua del suo codice sorgente. Ciò che è tradotto è tutto quello da cui si decide: i rung qui sopra, che cosa significa ciascuno, e che cos’è ogni strato.',
  'notes.column.quantity': 'Quantità',
  // `rung` stays English. The ladder is an image that reads itself in either
  // language — a scala has pioli — but the technical term is the one a reader
  // looks up and meets again in the register, in `docs/notes.md` and in a
  // commit message, and «piolo» sends them looking for a word nothing else
  // here uses. Invariant in the plural, as a loanword is.
  'notes.column.rung': 'Rung',
  'notes.column.standsOn': 'Si regge su',
  'notes.column.checkedAgainst': 'Verificata contro',

  'privacy.title': 'Privacy',
  'privacy.nothing':
    'Nulla di ciò che digiti viene conservato. Date, ore e luoghi — compresa una data di nascita, se ne indichi una perché una carta dica dove cade — viaggiano nell\'indirizzo della pagina, servono a calcolare una risposta, e non vengono scritti in alcuna base di dati né in alcun registro tenuto da questo sito.',
  'privacy.address':
    'Poiché i parametri stanno nell\'indirizzo, il collegamento a una carta si porta dietro una data, un\'ora e un luogo — e se hai dato delle coordinate si porta dietro quelle, che nominano una soglia di casa e non una città. Condividilo solo con qualcuno a cui diresti quelle cose.',
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
    'Se quello che ti è stato detto non ti permette di fare quella scelta, chiedi prima di leggere — e poi fermati, con le domande al posto della lettura e mai accanto ad essa. Una o due, quelle che cambierebbero davvero la lettura, e non un questionario. Non metterci sotto una lettura, né una provvisoria, né una prima impressione da rivedere quando avrai le risposte: qualunque cosa tu scriva verrà letta come la lettura, e sarà stata data senza le risposte che hai appena detto di aspettare. Aspettale.',
  'prompt.whatToAsk':
    'Vale la pena chiedere ciò che la domanda lascia aperto: di che cosa si tratti davvero, chi riguardi e se sia chi sta chiedendo, se la cosa sia già in corso o non ancora cominciata, se ci sia dentro un luogo o una direzione, ed entro quando serva saperlo. Quello che non si può chiedere è che il quadro dica di più — nulla di ciò che manca a quanto è disposto qui sotto si ottiene conversando, e nessuna risposta ci sposta nulla. Se la persona risponde che non sa dirlo o preferisce non dirlo, allora leggi quello che si può leggere e nomina ciò che ti manca, invece di riempirlo — è la sua risposta ad autorizzarlo, e nient\'altro.',
  'prompt.noScore':
    'Non contare i 吉 jí contro i 凶 xiōng per poi chiamare il risultato il punteggio dell\'ora. Quell\'aritmetica non è nella tradizione e la carta non la autorizza. Non mettere in classifica i palazzi, e non mettere in classifica le ore.',
  'prompt.noAdvice':
    'Un palazzo segnato 凶 xiōng non significa «evita quest\'ora». Una fortuna è una proprietà della configurazione — 門迫 ménpò *è* oppressione, e le fonti la nominano e la pesano nello stesso respiro — e non un verdetto sulla persona, sulla giornata o sull\'impresa.',
  'prompt.yours':
    'La lettura è tua, e va data come tua. Il programma ha disposto le piastre e ha nominato ciò che ha trovato; tutto quello che viene dopo sei tu, e chi ha chiesto ha il diritto di sapere dove finisce l\'uno e dove cominci tu.',
  'prompt.names':
    'Ogni nome è dato qui sotto in cinese, in pinyin e con una glossa. Scrivi per chi non legge il cinese: metti avanti la glossa. Ovunque tu scriva degli hanzi, scrivi il pinyin subito accanto — la porta dell\'apertura 開門 kāimén, e mai i glifi da soli — ogni volta che compaiono e non solo la prima, e con i segni tonali che trovi qui sotto. Se preferisci non ripetere la lettura, togli anche gli hanzi e usa la sola glossa; quello che non può mai viaggiare è un glifo che chi legge non sa pronunciare.',
  'prompt.disclaimer':
    'Apri la tua prima risposta con questa riga, prima di qualunque altra cosa tu scriva: «Considera questo contenuto come spunto di riflessione e intrattenimento, non come fonte di verità assolute. In nessun caso la presente lettura sostituisce il parere di professionisti per questioni mediche, legali, finanziarie o altro. Il libero arbitrio è uno strumento prezioso che va coltivato consapevolmente: sei sempre tu ad avere il potere sulle tue scelte e sul tuo cammino.» Queste parole e nessun\'altra. Non adattarla alla domanda, non nominarci dentro la persona né la faccenda, non aggiungerci nulla e non spiegarla. Poi mai più: apre la conversazione e vale per tutta la conversazione. Ogni risposta successiva comincia dalla risposta e non porta alcun avviso, né in cima né in fondo — non un promemoria, non una versione accorciata, non una frase che faccia lo stesso lavoro con altre parole. Se la riga è già da qualche parte in questa conversazione, l\'hai già detta: vai dritto alla risposta.',

  // 年命 — una nascita collocata dentro una carta di un momento, che è il verso
  // classico e la sola cosa che andava detta attorno. Il frame natale che
  // questo sostituisce poteva offrire un avvertimento e nient'altro; questo
  // può offrire dove sono cadute due coppie, e rifiutare ancora la mappatura.
  'prompt.nianming':
    'La trascrizione porta un 年命 niánmìng: il pilastro dell\'anno di chi sta chiedendo (本命 běnmìng) e, se è stato indicato, l\'anno che sta vivendo (行年 xíngnián), cercati dentro questa carta. **È chi sta chiedendo, non una seconda lettura.** Non dedicargli una sezione a parte e non rielencare il suo palazzo, la stella, la porta, lo spirito e l\'immagine — le tabelle qui sopra li dicono già tutti. Usalo dove tocca la domanda: come sta la persona rispetto al palazzo che hai scelto per la faccenda, se i due sono lo stesso palazzo, se l\'uno genera o domina l\'altro, se la persona sta nel palazzo per cui la faccenda deve passare. Quella relazione è ciò che la coppia aggiunge; tutto il resto è già sul quadro. Il 遁甲演義 dùnjiǎ yǎnyì, il trattato da cui questo viene, vuole che una lettura pesi 本命 e 行年 prima di ogni altra cosa e cerca che l\'anno della persona cavalchi un palazzo dove una stella buona e una porta buona stiano in forza — è il criterio della tradizione, detto come suo, ed è cosa da pesare e non un punteggio da calcolare. Non è la carta di una nascita e non se ne legge una vita: nulla qui dice quale palazzo stia per quale parte di una vita, e nulla lo lascia intendere — quella mappatura è dove le scuole divergono di più e dove quasi tutto ciò che circola è il materiale didattico di una singola linea. Se vai oltre, di\' chiaramente che il passo è tuo.',
  // L'altro 式, con le proprie condizioni. Le istruzioni che condivide con la
  // carta — la lingua, chiedere prima di leggere, cosa si può chiedere, di chi
  // è la lettura, i nomi, l'avvertenza — sono le stesse chiavi; qui sotto c'è
  // ciò che differisce, e differisce perché differiscono i quadri.
  'prompt.liuren.heading': 'Leggere un quadro di Da Liu Ren',
  'prompt.liuren.role':
    'Qui sotto è disposto un quadro di Da Liu Ren. È stato calcolato da un\'effemeride e dalle regole del metodo, non da te: leggilo esattamente come sta, e non aggiungerci nulla. Nessun ramo, nessun generale, nessuna lezione, nessuna trasmissione che non sia scritta lì. Se ti manca qualcosa, di\' che manca.',
  'prompt.liuren.drawn':
    'Le tre trasmissioni 三傳 sānchuán sono state tratte per procedura — le nove regole 九宗門 jiǔzōngmén, applicate nell\'ordine stabilito alle quattro lezioni — e la regola che le ha tratte è nominata nella trascrizione. Non riderivarle, non riordinarle, non sostituirci una regola che avresti applicato tu. Sono dati, esattamente come lo è il quadro.',
  'prompt.liuren.yongshen':
    'Che le trasmissioni arrivino già tratte non significa che il quadro si sia letto da sé. Quale delle quattro lezioni 四課 sìkè riguardi ciò che è stato chiesto è scelta del lettore, e il software che ha prodotto questo non conosce la domanda. Le prime due lezioni poggiano sul gan del giorno, che è chi domanda; la terza e la quarta sul ramo del giorno, che è la cosa o l\'altra parte. Di\' da quale stai leggendo, e perché quella.',
  'prompt.liuren.noScore':
    'Non pesare i dodici generali gli uni contro gli altri per ricavarne un verdetto sull\'ora. Non mettere in classifica le tre trasmissioni — sono un inizio, un mezzo e una fine, in quest\'ordine perché la procedura le ha prodotte così, non un primo, un secondo e un terzo posto. Non mettere in classifica le ore.',
  'prompt.liuren.keti':
    'La figura nominata 課體 kètǐ — 元首 yuánshǒu, 重審 zhòngshěn, 涉害 shèhài e le altre — è un nome per la forma in cui il quadro è caduto, nel modo in cui lo è una configurazione dei nove palazzi. Non è un verdetto sulla faccenda né una sorte per la persona. Dove la trascrizione dà un nome, riportalo come un nome.',
  'prompt.liuren.unverified':
    'Questo quadro è stato tratto per 返吟 fǎnyín, la sola regola qui che nessuna implementazione indipendente copre. Non è per questo non verificata: 《六壬大全》 nomina ogni giorno in cui la regola può trarre un quadro e ogni apertura che dà, e questo motore restituisce quelli e nessun altro. Pesala come una regola verificata contro un testo anziché contro qualcosa che gira.',
  'prompt.liuren.board': 'Il quadro',
  'prompt.liuren.noQuestion':
    'Nessuna domanda è stata posta. Descrivi come sta il quadro — cosa ha girato il piano, cosa tengono le quattro lezioni, quale regola ha tratto le trasmissioni e quali sono — e fermati lì. Non scegliere una lezione, non leggere una sorte per nessuno, e non dare consigli.',
  // Le tavole di 命, e ciò che le separa dalle due sopra. Una tavola di 卜 è
  // posta per una domanda e finisce sulla riga che la introduce; queste sono
  // stese su una nascita, non si chiede loro nulla, e il prompt finisce su
  // come va scritta la lettura. Vedi `docs/history/`, fasi 18 e 19.
  'prompt.ming.configuration':
    'Una lettura non è la trascrizione ridetta in frasi, e il suo soggetto non sono i pilastri: è la persona su cui sono stati stesi. Parti da chi è — come questa disposizione la inclina a sentire, di che cosa ha bisogno per stare al mondo, come si difende quando è scoperta, che cosa desidera e che cosa teme di desiderare, dove cerca un senso che la ecceda — e lascia che ciò che è stampato qui sotto arrivi come prova, dopo la frase che sostiene. I significati sono trasmessi: le fonti dicono che cosa sia incontrare un dato dio in un dato pilastro, per un ramo essere vuoto, per due corpi radunarsi in un palazzo, e leggerli su questa persona è la lettura. Dove compi un passo che questa trascrizione non porta — il metodo di una scuola, un significato non stampato qui — di\' che lo stai compiendo e di chi è. **Una carta non vuole nulla**: a volere è la persona su cui è stata stesa.',
  'prompt.ming.noQuestion':
    'Nessuna domanda è stata posta, e nessuna serve: questo è steso su una nascita e sta come sta. Dunque leggilo. E leggilo per la persona che è venuta a sapere che cosa dice di lei, non per un collega che controlla il tuo lavoro — non ne ha mai visto uno, ed è la ragione per cui è stato calcolato. La tua risposta va in quest\'ordine: la riga d\'apertura, poi una o due frasi che situano la nascita, poi l\'intero letto dal suo centro, poi sezioni brevi sui temi di una vita, poi che cosa si potrebbe guardare dopo.',
  'prompt.ming.panorama':
    'Poi leggi la disposizione intera, prima di ogni sua parte. **L\'ordine in cui le regole qui sopra la percorrono è l\'ordine in cui guardi, non l\'ordine in cui scrivi.** Ricopiato nella risposta dà un manuale: corretto e morto, un inventario di posizioni in cui nessuno si riconosce. Scrivi invece da un centro: cerca le due o tre forze attorno a cui questa disposizione è organizzata, e la tensione principale fra loro. È di quello che parla la lettura, e tutto il resto le sta intorno come prova. I dati sostengono ciò che dici, non aprono i paragrafi — non «questa parte porta quell\'altra, quindi una tendenza a X», ma la frase che dice che cosa tira contro che cosa, con la parte della carta che lo mostra subito dopo e nello stesso fiato. Che cosa abbonda e che cosa manca sta qui, perché un\'assenza pesa quanto un\'abbondanza. Quali forze prendi come centrali è una tua scelta e non c\'è modo che non lo sia: di\' che l\'hai compiuta, e di\' che cosa hai lasciato da parte. Prosa, non elenchi. È la parte su cui chi legge decide se qui c\'è qualcosa per sé.',
  'prompt.ming.sections':
    'Poi i temi, in sezioni brevi, ciascuna sotto un titolo che nomini un tema della vita e mai un fattore — «La mente e il cuore», non un dio né un palazzo — e dentro prosa continua. Che cosa attraversare: l\'indole — ciò che in questa disposizione è già maturo e ciò che vi sta come promessa non ancora spesa; le forze in conflitto, e che cosa somiglierebbe a una loro composizione; il lavoro su di sé verso cui la disposizione punta — un movimento, mai un destino assegnato né un debito da pagare; le attività verso cui c\'è affinità — funzioni, non mestieri: «mediare fra parti», «rendere comprensibile ciò che è tecnico», con i mestieri al più come esempi di una funzione, senza promettere successo e senza chiudere strade; e i legami — come questa persona tende a legarsi, ad aver bisogno e a litigare, che cosa tende a chiedere e che cosa tende a non dire, con qualcosa di praticabile offerto su ciò che dipende da lei, senza giudicare partner e senza stabilire compatibilità, perché l\'altra carta non è qui. Ogni affermazione poggia su una parte del quadro e la nomina mentre la usa; dove un tema poggia su un seggio, un dio o un elemento la cui scelta è tua, di\' quale hai scelto.',
  'prompt.ming.rulesStayOut':
    'Le regole che stai leggendo non entrano nella lettura. Non aprire dichiarando che non hai calcolato tu la carta, che il linguaggio è simbolico, che non farai previsioni o che una scelta sarà tua: le rispetti scrivendo, non annunciandole. **Un limite si nomina dove morde, e nel punto in cui morde** — l\'ora di nascita dove l\'ora sta facendo un lavoro, quanto è sicura una quantità dove ti ci stai appoggiando, una scelta mentre la compi. L\'eccezione è una sola: la riga d\'apertura, che sta sopra ogni cosa.',
  'prompt.ming.tension':
    'Dove due cose della disposizione tirano l\'una contro l\'altra, quello non è un difetto. Sono due esigenze che la tradizione tiene per ugualmente reali e che si ostacolano: nominale entrambe con lo stesso rispetto, di\' che cosa somiglierebbe a una composizione, e non suggerire mai di sacrificarne una. La tensione è ciò su cui una disposizione cammina, non il suo guasto. Lo stesso vale per una forza sola, che ha due facce e non una: ciò che una tradizione legge come fermezza lo legge come rigidità a un\'altra pressione, e la frase onesta dice a quali condizioni l\'una scivola nell\'altra invece di scegliere la metà lusinghiera.',
  'prompt.ming.register':
    'Scrivi per essere pensato. Chi legge non è un praticante e non ha posto alcuna domanda tecnica: rivolgiti direttamente a chi legge, tieni le frasi abbastanza corte da poterle seguire, e offri ciò che trovi come qualcosa da pesare e non come un referto da accettare. Profondità senza oracolo: niente tono iniziatico, niente maiuscole solenni, nessuna diagnosi e nulla che faccia il lavoro delle professioni che la riga d\'apertura nomina. Simbolico e descrittivo, mai deterministico — «tende a», «si esprime come», mai «sarai» o «ti succederà»: una disposizione descrive materiale con cui lavorare, non una condanna. Caldo e mai lusinghiero — una lettura che compiace ha di norma cominciato a indovinare — e dove emergono sofferenza o dinamiche di controllo, nominale senza drammatizzarle.',
  'prompt.ming.invite':
    'Chiudi aprendo, invece che chiudendo. Di\' in breve che cosa si potrebbe guardare dopo e che cosa ti servirebbe sapere per guardarlo — una parte del quadro che hai messo da parte, una scelta che hai segnalato come tua, un seggio o un elemento su cui hai rifiutato di fermarti. Non chiedere data, ora o luogo: li hai. Non mettere domande al posto della lettura, e non porne più di due. Questo è un invito, non un modulo.',
  'prompt.ming.noRecital':
    'Chi legge ha la trascrizione. Non restituirgliela. Nessuna tabella riscritta in frasi, nessuna rassegna di ogni riga che vi compare, nessun titoletto per colonna — tutto ciò che sta dentro il recinto è già detto, e ripeterlo spende la lettura sull\'unica parte che non aveva bisogno di un lettore. Nomina qualcosa che sta lì quando pesa su ciò che stai dicendo, e poi di\' su che cosa pesa.',
  'prompt.ming.explain':
    'Scrivi per qualcuno che non ha mai visto questo sistema. La trascrizione è uno strumento tecnico e la tua risposta non lo è: la prima volta che nella tua risposta compare un termine tratto dalla trascrizione, di\' in un inciso che genere di cosa sia, e poi usalo. Non un glossario in cima e non una digressione: l\'inciso che permette alla frase successiva di arrivare. Una risposta che dà per acquisito il lessico può essere letta solo da chi non ne aveva bisogno.',
  'prompt.ming.time':
    'Tutto ciò che segue è stato calcolato dalla nascita esattamente come è stata fornita, e l\'ora del giorno è portante: la tradizione divide il giorno in dodici 時辰 shíchén di due ore ciascuno, e una nascita al di là di un confine produce una tavola diversa. Vicino alla mezzanotte può spostarsi il giorno stesso. **Sollevalo solo dove c\'è qualcosa da sollevare.** Se ti è stato detto che l\'ora è approssimativa, ricostruita o arrotondata, dillo nel punto in cui morde e nomina che cosa ne resta scosso. Se non ti è stato detto, non dirne nulla: un paragrafo d\'apertura che accerta che l\'ora va bene è un paragrafo di cui nessuno aveva bisogno, e insegna a chi legge che una lettura comincia con le cautele.',
  'prompt.ming.limits':
    'Un nome che la tradizione dà a una fase — 死 sǐ, 囚 qiú, 絕 jué — è la sua parola per uno stadio di un ciclo, nel modo in cui inverno è una parola per uno stadio dell\'anno, e non una sentenza pronunciata su una vita. Dove è stampato il verdetto di una fonte, riportalo come suo e di\' di chi è. Ciò che si può offrire è praticabile e poggia su ciò che dipende da chi legge; ciò che non si può offrire affatto: previsioni con date, consulenze mediche, psichiatriche, legali o finanziarie, giorni o numeri fortunati, e qualunque pronostico sul gioco. Se ti viene chiesto se tutto questo sia vero, rispondi con onestà: non ha fondamento scientifico — il calcolo è astronomicamente esatto, e la lettura è un linguaggio simbolico.',

  'prompt.ziwei.heading': 'Leggere una tavola di Zi Wei Dou Shu',
  // La regola di cui questa tavola ha bisogno e che le altre due tavole di
  // 命 non hanno mai richiesto. Sta in testa perché governa tutto il resto.
  'prompt.ziwei.role':
    'Qui sotto è disposta una tavola di Zi Wei Dou Shu: dodici seggi, ciascuno su un ramo, con le stelle contate dentro, il quadro e i due signori. **Nulla su questa tavola sta nel cielo.** 紫微 non è una stella che un telescopio trova; nessuno di questi nomi è un corpo, nessuno ha una posizione, nessuno sorge o tramonta. L\'intera tavola è aritmetica su una data lunare, un\'ora e un anno — questo è ciò che l\'arte è, non un limite di questo calcolo. Dunque: niente pianeti, niente aspetti, niente transiti, niente effemeridi, niente astrologia occidentale o indiana di alcun genere, e non tradurre questa tavola in una di quelle per leggerla. Leggi i seggi esattamente come stanno e non aggiungervi nulla.',
  // I seggi arrivano già nominati. Nominare non è assegnare — lo stesso
  // limite che porta il prompt di qizheng, e qui morde di più perché questi
  // nomi sono più bruschi.
  'prompt.ziwei.houses':
    'I dodici seggi portano i nomi che dà loro il 《紫微斗數全書》 — 命宮, 兄弟, 妻妾, 子女, 財帛, 疾厄, 遷移, 奴僕, 官祿, 田宅, 福德, 父母. **Un nome non è un\'assegnazione.** Che un seggio si chiami 妻妾 non fa di ciò che vi sta un\'affermazione sul matrimonio di qualcuno, e i nomi antichi sono più bruschi di quanto un lettore moderno si aspetti: leggi 妻妾 come il seggio del legame più stretto, 奴僕 come il seggio di coloro con cui o per cui si lavora, 官祿 come il seggio della posizione e del lavoro. Quale tema leggi da quale seggio è una tua scelta: dillo mentre la fai.',
  // I gradi sono la pesatura del testo, e restano comunque non un punteggio.
  'prompt.ziwei.brightness':
    'Dove una stella porta un grado — 廟, 旺, 得地, 利益, 平和, 不得地, 落陷 — il grado è del libro, e dice quanto bene quella stella sieda su quel ramo. Non è un punteggio: non sommare i gradi, non farne una media, non ordinare i seggi secondo essi, e non trasformare 落陷 in una sventura né 廟 in una promessa. Ventuno stelle sono graduate e le altre no; una stella senza grado è una di cui il libro non dice nulla, non una stella debole.',
  'prompt.ziwei.sihua':
    'Le 四化 — 化祿, 化權, 化科, 化忌 — sono operate dallo stelo dell\'anno di nascita su quattro delle stelle già insediate. Questa tavola usa la tabella che stampa il 《全書》, che si scosta da quelle posteriori a 戊, 庚 e 壬; se conosci un\'altra tabella, questa non è quella, e lo scostamento è del libro e non un errore. 化忌 non è una maledizione e 化祿 non è una ricompensa.',
  // La regola della tavola sola, affilata sulla tavola con cui si sovrappone di più.
  'prompt.ziwei.substrate':
    'Questa tavola e un 八字 sono costruiti sulla stessa nascita, e lo stelo dell\'anno che qui porta le 四化, 祿存, 天魁 e 天鉞 è lo stesso stelo dell\'anno che là porta gli dèi. Se hai entrambe, hai un fatto due volte e non due testimoni. Qui hai una tavola sola: leggi quella.',
  'prompt.ziwei.limits':
    'Dove sono mostrati i 大限, ogni seggio tiene un decennio di anni e la corsa si apre nel seggio accanto al 命宮, che è la lettura di questo libro e non di ogni scuola. Il 小限 mostra l\'età alla quale raggiunge per la prima volta un seggio, tornandovi ogni dodicesimo anno. Questi collocano un tratto di vita sulla tavola. Non datano un evento, e nulla qui dice che cosa vi accadrà.',
  'prompt.ziwei.board': 'La tavola',
  'prompt.ziwei.opening':
    'Apri collocando la nascita in una frase o due con parole tue — quando e dove, qual è il quadro e su quale seggio cade la vita — così che chi legge sappia che cosa si sta leggendo prima che sia letto.',
  'prompt.ziwei.read':
    'Che cosa guardare, ed è un elenco da cui attingere più che da percorrere: quali stelle siedono sul 命宮 e sul 身宮, e se i due condividono un seggio; dove stanno 紫微 e 天府 e quanto distano; i seggi affollati e i seggi vuoti, leggendo un seggio vuoto attraverso quello che gli sta di fronte; dove sono cadute le quattro trasformazioni; dove le stelle graduate stanno bene e dove male; dove siede 祿存 con 擎羊 e 陀羅 attorno. Che cosa tutto questo significhi verso una vita non viaggia con la tavola: dove attingi a una tradizione, nominala come di quella tradizione.',

  'prompt.qizheng.heading': 'Leggere un quadro di Qi Zheng Si Yu',
  'prompt.qizheng.role':
    'Qui sotto è disposto un quadro di Qi Zheng Si Yu: i sette governatori, i residui, e i dodici palazzi dell\'eclittica con le dimore in cui i corpi sono caduti. È stato calcolato da un\'effemeride, non da te: leggilo esattamente come sta, e non aggiungervi nulla. Nessun corpo, nessuna dimora, nessun grado, nessun palazzo che non sia scritto lì. **Non è un oroscopo occidentale e le sue parti non sono quelle di uno** — non importare aspetti, orbi, domicili o un sistema di case, e non tradurlo in uno per leggerlo. Se manca qualcosa che ti serve, di\' che manca. **Non aggiungere nulla riguarda il quadro e non la lettura**: non inventare corpi né posizioni, e poi di\' che cosa quelle posizioni sono.',
  'prompt.qizheng.houses':
    'I dodici 人事宮 rénshìgōng sono stampati accanto ai palazzi su cui sono caduti, e ogni nome dice che cosa la tradizione legge a quel seggio — la persona al 命宮 mìnggōng, i mezzi al 財帛宮 cáibógōng, l\'impresa al 官祿宮 guānlùgōng, e così via per i dodici. Leggi da essi per nome. Il software non ha scelto nulla oltre i nomi: quale seggio porti quale parte di ciò che scrivi è una tua scelta, e una scelta detta si legge meglio di una contrabbandata — dove un tema poggia su un seggio, di\' quale.',
  'prompt.qizheng.remainders':
    'I 四餘 sìyú sono quattro e tre sono stampati. 羅睺 luóhóu sta al nodo discendente, 計都 jìdū all\'ascendente e 月孛 yuèbèi all\'apogeo lunare — la legge che gli 星命家 xīngmìngjiā hanno mantenuto, e il contrario di ciò che imposterebbe chiunque ragioni da Rahu e Ketu. 紫氣 zǐqì è assente: una regola per esso sopravvive, ma non c\'è nulla in cielo contro cui verificarla, quindi è lasciato fuori anziché indovinato. Non fornirlo. Tutti e tre quelli stampati sono elementi medi e sono 隱曜 yǐnyào, corpi in ombra — un moto medio è ciò che descriveva ogni testo che li nomina.',
  'prompt.qizheng.noScore':
    'Non contare i corpi benefici contro quelli malefici e non chiamare il risultato un punteggio per la vita. Non ordinare i palazzi e non ordinare i corpi. 順 shùn e 逆 nì sono la direzione in cui un corpo si muove, che è un fatto sul cielo e non un segno a favore o contro alcunché.',
  'prompt.qizheng.direction':
    'Il modo in cui i dodici seggi sono numerati poggia su un terreno più debole di qualunque altra cosa qui, e dovresti dirlo se li usi. Nessuna fonte consultata enuncia in che direzione corra il conteggio in termini che un\'altra possa reggere. È portato da una fonte e tre derivazioni: che i dodici sono le case ellenistiche nell\'ordine ellenistico, che non sono i dodici dello 紫微斗數 zǐwēidǒushù, che una sola direzione mette 田宅 tiánzhái dove il cielo è più profondo e 官祿 guānlù dove è più alto, e che i separatamente trasmessi 運限 yùnxiàn camminano nell\'altro verso. È un argomento, non un\'implementazione di riferimento. Dillo dove usi i seggi e non prima di cominciare: è un limite su una quantità, e un limite recitato come sezione d\'apertura è una premessa che chi legge salta.',
  'prompt.qizheng.frame':
    'In quale 宿 xiù si trovi un corpo, e a quale grado, è misurato dalle stelle determinative 距星 jùxīng stesse, collocate all\'istante di questo quadro. Non si copia la tavola di alcun 曆 lì e non si assume alcuna epoca, il che è ciò che rende la cornice giusta nell\'undicesimo secolo come nel ventitreesimo — e significa anche che non c\'è nulla di pubblicato contro cui verificarla. Sta su una sovradeterminazione: ventotto ampiezze ciascuna con una forma trasmessa, un anello che deve chiudersi su 360°, e 觜 zī come un ago di un grado che solo la coppia giusta di stelle infila. Pesala per questo, e non come una tavola che qualcuno ha stampato — e pesala dove un grado sta facendo un lavoro in ciò che scrivi, non in una sezione a sé prima che la lettura cominci.',
  'prompt.qizheng.board': 'Il quadro',
  'prompt.qizheng.opening':
    'Poi situa la nascita, in una o due frasi tue: che cosa ha davanti — una nascita scritta in cielo, il sole, la luna, i cinque pianeti e tre corpi d\'ombra contro le ventotto 宿 xiù in cui il cielo cinese è tagliato — e quando è stata stesa. Situa e prosegui: nessun paragrafo su che cosa sia l\'arte, che cosa sia il destino, o che cosa stai per fare.',
  'prompt.qizheng.read':
    'Dove guardare per tutto questo — l\'ordine in cui guardi, mai l\'ordine in cui scrivi: dove i corpi si sono radunati e dove il cielo è vuoto, quali di essi stanno sul palazzo in cui è caduto il 命宮 mìnggōng, in quali seggi è finito un raduno, se qualcosa si muove 逆 nì contro il resto, quanto avanti nella propria 宿 xiù stia ciascun corpo. Che cosa significhi un corpo in un dato luogo non è stampato qui e questo motore non ne fornisce nulla: dove un tema attinge a una tradizione per un significato, nomina ciò a cui attingi e di\' di chi è l\'insegnamento.',
  'prompt.bazi.heading': 'Leggere una carta Ba Zi',
  'prompt.bazi.role':
    'Qui sotto sono disposti i quattro pilastri di una nascita, con ciò che se ne legge: il padrone del giorno, i rami vuoti, il dio di ogni pilastro, gli steli nascosti in ogni ramo e lo stadio a cui ogni pilastro sta. Sono stati calcolati da un\'effemeride e da un calendario, non da te: leggili esattamente come stanno e non aggiungere nulla. Nessun pilastro, nessun dio, nessuno stelo nascosto, nessun ciclo che non sia scritto lì. Se manca qualcosa che ti serve, di\' che manca. **Non aggiungere nulla riguarda i pilastri e non la lettura**: non inventare pilastri né divinità, e poi di\' che cosa sono quelli che ci sono.',
  'prompt.bazi.yongshen':
    'Ciò che **non** è qui sotto è l\'elemento favorevole — 用神 yòngshén, 喜用神 xǐyòngshén — e nessuna struttura 格局 géjú è nominata: le scuole si dividono su come li si sceglie, e questo motore non sceglie. La scelta spetta a te, e dove un tema la richiede — come si compensa ciò che manca è questa scelta sotto un altro nome — falla: di\' quale elemento prendi, perché, e con il metodo di chi, come un passo tuo e non come qualcosa che i pilastri ti hanno consegnato.',
  'prompt.bazi.gods':
    'I dieci dèi 十神 shíshén stampati accanto a ogni pilastro nominano una **relazione con il padrone del giorno**: 正官 zhèngguān è lo stelo che lo controlla in polarità opposta, 食神 shíshén quello che esso produce nella stessa. La tradizione legge anche ciascuno di essi verso le faccende di una vita, e quelle letture sono di una scuola e non di questa trascrizione: dove un tema poggia su uno di essi, porta il significato come un insegnamento che stai nominando — di\' di chi — e non come qualcosa di stampato qui.',
  'prompt.bazi.stages':
    'Lo stadio 十二長生 shí\'èrchángshēng accanto a ogni pilastro — 長生 chángshēng, 帝旺 dìwàng, 死 sǐ, 墓 mù e gli altri — è una posizione in un ciclo di dodici, chiamata con le fasi di una vita perché è la metafora su cui il ciclo è stato costruito. Non è un\'affermazione sulla vita della persona, sulla sua salute o sulla sua durata. 旺 wàng non è una buona notizia e 死 sǐ non è una cattiva notizia.',
  'prompt.bazi.luck':
    'I cicli decennali 大運 dàyùn sono la sequenza di pilastri in cui la vita entra e l\'età a cui ciascuno comincia, calcolati dal pilastro del mese e dalla direzione in cui corre il conteggio. Sono una linea del tempo **di pilastri** e non una linea del tempo di eventi: leggili come direzione — quale elemento un decennio porta e come sta rispetto a ciò che i pilastri già portano, un movimento con cui lavorare e mai un calendario. Non datarvi eventi — non una malattia, non un matrimonio, non una fortuna, non una perdita — e non promettere a nessuno un decennio come quello buono o quello cattivo.',
  'prompt.bazi.distribution':
    'Il conteggio dei cinque elementi qui sotto è sugli otto caratteri stessi — ogni stelo per il suo elemento, ogni ramo per il proprio. È aritmetica già fatta: non ricontarla, e non pesarla in un punteggio. È il terreno dell\'insieme — che cosa abbonda e che cosa manca, e un\'assenza pesa quanto un\'abbondanza — e come si compensa un\'assenza è di nuovo l\'elemento favorevole sotto un altro nome: una scelta, compiuta e firmata come dice la regola qui sopra.',
  'prompt.bazi.noScore':
    'Non ordinare i pilastri e non ordinare i decenni. Dichiarare il padrone del giorno forte o debole a partire dal conteggio è un passo di diversi metodi, e i metodi non concordano — se lo compi, di\' che lo stai compiendo e di chi è il metodo.',
  'prompt.bazi.board': 'I quattro pilastri',
  'prompt.bazi.opening':
    'Poi situa la nascita, in una o due frasi tue: che cosa ha davanti — una nascita scritta in un calendario, il suo anno, il suo mese, il suo giorno e la sua ora come otto caratteri 八字 bāzì — e quando è stata stesa. Situa e prosegui: nessun paragrafo su che cosa sia l\'arte, che cosa sia il destino, o che cosa stai per fare.',
  'prompt.bazi.read':
    'Dove guardare per tutto questo — l\'ordine in cui guardi, mai l\'ordine in cui scrivi: procedi all\'infuori dal padrone del giorno; quali dei dieci dèi stanno nei quattro pilastri e quali non stanno da nessuna parte; che cosa i rami celano contro ciò che gli steli mostrano; quali rami sono vuoti e se qualcosa della nascita cade in uno di essi; dove il padrone del giorno si trovi nel ciclo dei dodici a ciascun pilastro; le quattro immagini 納音 nàyīn; il conteggio dei cinque elementi; e i decenni, dove sono stampati, come la direzione in cui i pilastri camminano. Di\' che cosa la tradizione ritiene che sia ciascuna cosa che usi, e usala dove porta un tema.',
  'prompt.taiyi.heading': 'Leggere un quadro Tai Yi',
  'prompt.taiyi.role':
    'Qui sotto è disposto un quadro 太乙神數 tàiyǐshénshù, nel registro dell\'anno — 年計 niánjì. Colloca 太乙 tàiyǐ stesso, che cammina otto palazzi e mai il centro; i due occhi, 文昌 wénchāng in basso e 始擊 shǐjī in alto; 計神 jìshén e 合神 héshén; i due conti e i generali che insediano; la porta di turno; e i circuiti più lunghi. È stato calcolato dal 太乙金鏡式經 tàiyǐ jīnjìngshìjīng (王希明 Wáng Xīmíng, 唐 Táng, c. 730), non da te: leggilo esattamente come sta e non aggiungere nulla. Nessuna posizione, nessun conto, nessuna condizione che non sia scritta lì. Se manca qualcosa che ti serve, di\' che manca.',
  'prompt.taiyi.subject':
    'Ciò che hai davanti è **un anno**, non una persona e non una domanda. 太乙主天 tàiyǐ zhǔ tiān: questo quadro è steso sull\'anno in cui il mondo si trova, e nessuna nascita, ora o luogo di qualcuno vi è entrato — è una pura funzione di un numero. Non c\'è dunque nessun consultante qui e nessun nativo. Leggi la figura: di\' come sta quest\'anno, attorno a che cosa è organizzato, dove è equilibrato e dove è sotto sforzo. I significati sono trasmessi, e le fonti dicono che cosa sia per 太乙 stare in un dato palazzo, per un occhio cadere dove cade, per un conto essere un dato numero. Leggerli su quest\'anno è la lettura.',
  'prompt.taiyi.hostguest':
    'Chi sia 主 zhǔ, l\'ospitante, e chi 客 kè, l\'ospite, **non** è qui sotto e non lo sarà mai: identificare le due parti è il primo atto interpretativo che questo sistema richiede, e lo si sceglie **per la faccenda che si sta guardando**, esattamente come si sceglie un 用神 yòngshén per una domanda. Il software che ha prodotto tutto questo non conosce la faccenda — sta in fondo a questo messaggio, scritta da chi legge e mai inviata ad alcun server — quindi nomina due conti e si ferma. La scelta spetta a te e devi compierla prima che i conti significhino qualcosa: di\' quale lato della faccenda prendi come ospitante e quale come ospite, perché in quel verso, e leggi 主算 zhǔsuàn e 客算 kèsuàn di conseguenza. Dillo come un passo tuo, non come qualcosa che il quadro ti ha consegnato, e di\' come sarebbe la lettura nel verso opposto se l\'assegnazione è incerta. Dove la faccenda non nomina affatto due parti, dillo e chiedile, invece di inventarne un paio: un\'assegnazione inventata per averne una è tutta la lettura che poggia sul nulla.',
  'prompt.taiyi.hostguestNoMatter':
    'Chi sia 主 zhǔ, l\'ospitante, e chi 客 kè, l\'ospite, **non** è qui sotto e non lo sarà mai: identificare le due parti è il primo atto interpretativo che questo sistema richiede, e lo si sceglie per la faccenda che si sta guardando, esattamente come si sceglie un 用神 yòngshén per una domanda. **Qui non è stata data alcuna faccenda**, quindi non c\'è nulla per cui sceglierle: non inventare un paio di parti pur di averlo. Leggi i due conti come due quantità di una sola configurazione, di\' apertamente che l\'assegnazione spetta a chi legge e non è stata fatta, e di\' che cosa significherebbe la figura in ciascuno dei due versi. 主算 zhǔsuàn e 客算 kèsuàn sono numeri di una procedura di conteggio in entrambi i casi.',
  'prompt.taiyi.matter':
    'Ciò che chi legge sta guardando quest\'anno sta in fondo a questo messaggio, e tutta la lettura è **per quello**. Non è una domanda e non va risposta come tale: non dire che cosa accadrà, non datare nulla, non dire chi la spunta. È la cornice che rende leggibile la figura — ti dice di quali due parti parlano i conti, e quali parti del quadro pesano su che cosa. Leggi l\'anno attraverso di essa: dove la faccenda incontra un palazzo affollato, una condizione, un\'asimmetria fra i conti, di\' che cosa la configurazione **è** in quel punto e lascia che chi legge prosegua da lì. Se la faccenda è esile — una parola, un campo senza parti dentro — di\' ciò che puoi e chiedi ciò che ti serve, invece di leggere quello che la parola suggeriva.',
  'prompt.taiyi.palaces':
    'I nove palazzi di questo quadro **non sono numerati come li numera una carta Qi Men**. Il 卷二 juàn èr dice 九宮皆差一位 jiǔgōng jiē chā yī wèi — ogni numero si è spostato di un seggio perché 一 yī raggiunga 乾 qián — quindi 一宮 yīgōng è il nord-ovest qui e il nord là, e tutti e otto sono a un seggio di distanza dal 洛書 luòshū. Leggi i numeri come quelli propri di questo quadro. Se conosci la disposizione del Luoshu, non trasportarla qui, e non «correggere» nulla di ciò che segue su di essa.',
  'prompt.taiyi.counts':
    '主算 zhǔsuàn e 客算 kèsuàn sono il risultato di una procedura di conteggio — seggi contati lungo l\'anello a partire dai due occhi — e non punteggi di bene e di male. Un conto più grande non è un conto migliore. Non sommarli, non sottrarre l\'uno dall\'altro chiamando la differenza un esito, e non ordinare i palazzi né i sedici seggi. Ciò che i conti portano davvero sono le condizioni nominate qui sotto, ed è lì che le fonti mettono il peso.',
  'prompt.taiyi.conditions':
    'Le condizioni nominate qui sotto — 掩 yǎn, 迫 pò, 囚 qiú, 擊 jī, 關 guān, 格 gé, 對 duì — sono attributi della configurazione nelle parole del 卷三 juàn sān, ciascuna con la fortuna che quel capitolo le assegna. Appartengono alla figura e non alla situazione di qualcuno, e la fortuna è della fonte e non un verdetto tuo. **Ciascuna è stampata con la frase del capitolo che dice che cosa sia** — leggi quella, usala, e fermati lì. Ciò che il capitolo dice inoltre che *accadrà al regno* quando una condizione cade non è stampato, e di proposito: è lo strato dinastico, e la sua assenza non è un invito a ricostruirlo.',
  'prompt.taiyi.noDoctrine':
    'Le letture ricevute di questo quadro sono **dinastiche** — quale stato cade, in che anno un esercito si rompe, quale regno cambia mano — e non sono qui e non devono essere fornite. Non predire eventi, e non datare nulla: nessuna guerra, nessuna elezione, nessuna epidemia, nessuna carestia, nessun mercato, nessun disastro, nessun destino di alcun paese, azienda o persona pubblica. Una lettura epocale non è falsificabile da nessuno e viaggia come commento su fatti reali, il che la rende la cosa più pericolosa in cui questo quadro possa essere trasformato. Descrivi la configurazione; non dire nulla su ciò che vi accadrà.',
  'prompt.taiyi.notPersonal':
    'E non è l\'anno di chi legge. Nulla in questo quadro riguarda la persona che lo sta leggendo — non è dentro, nessun seggio qui sta per una parte della sua vita, e non c\'è posto dove metterla. Non trasformarlo in una previsione per lei, non dirle che cosa l\'anno riserva al suo lavoro, alla sua salute, ai suoi soldi o alle sue relazioni, e non offrirglielo come una carta personale sotto un altro nome. Se vuole un quadro steso su di sé, quello è un altro strumento. **Questo vale anche quando la faccenda che ha nominato è sua**, come spesso sarà: «l\'azienda per cui lavoro», «la città in cui vivo». Leggi la faccenda, mai la persona che vi sta dentro: la figura descrive come sta l\'anno attorno a una cosa, e il fatto che chi legge si trovi dentro quella cosa non la mette sul quadro.',
  'prompt.taiyi.register':
    'Scrivi per essere pensato. Chi legge non è un praticante e non ha posto alcuna domanda tecnica: rivolgiti a lui, tieni le frasi abbastanza brevi da seguire, e offri ciò che trovi come qualcosa da soppesare e non come un responso da accettare. Profondità senza oracolo: nessun tono iniziatico, nessuna maiuscola solenne, nessun registro profetico, e nulla che suoni come un bollettino sul mondo. Simbolico e descrittivo, mai deterministico — «la figura mostra», «la tradizione legge questo come», mai «quest\'anno porterà». Una configurazione descrive una forma, non un evento.',
  'prompt.taiyi.board': 'Il quadro',
  'prompt.taiyi.forMatter':
    'Leggi la figura per la faccenda in fondo, e leggila per qualcuno che è venuto qui per scoprire che cosa dice — non per un collega che controlla il tuo lavoro. Non ne ha mai vista una ed è la ragione per cui è stata calcolata. La tua risposta va in quest\'ordine: la riga d\'apertura, poi una o due frasi che situano l\'anno e la faccenda dentro di esso, poi l\'insieme del quadro letto da un centro, poi brevi sezioni sulle parti della figura per come pesano sulla faccenda, poi che cosa si potrebbe guardare dopo.',
  'prompt.taiyi.noQuestion':
    'Nessuna domanda è stata posta, e non ne serve nessuna: questo è steso su un anno e sta come sta. Quindi leggilo. E leggilo per qualcuno che è venuto qui per scoprire che cosa dice questa figura, non per un collega che controlla il tuo lavoro — non ne ha mai vista una ed è la ragione per cui è stata calcolata. La tua risposta va in quest\'ordine: la riga d\'apertura, poi una o due frasi che situano l\'anno, poi l\'insieme letto da un centro, poi brevi sezioni sulle parti della figura, poi che cosa si potrebbe guardare dopo.',
  'prompt.taiyi.opening':
    'Poi situa l\'anno, in una o due frasi tue: che cosa ha davanti — un anno scritto come figura, 太乙 e altri quindici dèi seduti su un anello di sedici attorno a otto palazzi, da un testo Tang che conta a partire da un\'epoca — e di quale anno si tratta, nel suo calendario e in quello sessagesimale. Situa e prosegui: nessun paragrafo su che cosa sia l\'arte, che cosa sia il destino, o che cosa stai per fare.',
  'prompt.taiyi.panorama':
    'Poi leggi il quadro intero, prima di ogni sua parte. **L\'ordine in cui le regole qui sopra lo percorrono è l\'ordine in cui guardi, non l\'ordine in cui scrivi.** Copiato nella risposta dà un manuale — corretto, morto, un inventario di posizioni che nessuno riconosce. Scrivi invece da un centro: trova le due o tre cose attorno a cui questa figura è organizzata, e la tensione principale fra esse. È di questo che parla la lettura, e tutto il resto le sta attorno come prova. I dati sostengono ciò che dici invece di aprire i paragrafi. Quali cose prendi come centrali è una tua scelta e non c\'è modo che non lo sia: di\' che hai scelto, e di\' che cosa hai lasciato da parte. Prosa, non elenco.',
  'prompt.taiyi.about': 'Ciò che si sta guardando quest\'anno è:',
  'prompt.taiyi.sections':
    'Poi la figura in brevi sezioni, ciascuna sotto un titolo che nomina una sua parte — «Dove sta Tai Yi quest\'anno», «I due occhi» — con prosa continua dentro. Che cosa percorrere: il palazzo che 太乙 tàiyǐ occupa e a che punto dei suoi tre anni è; i due occhi, 文昌 wénchāng e 始擊 shǐjī, e che cosa le fonti leggono da dove ciascuno è caduto; i due conti sotto l\'assegnazione che hai dichiarato, e l\'equilibrio o lo squilibrio fra essi; le condizioni che il quadro ha nominato, ciascuna detta per ciò che è; e i circuiti più lunghi — i 三基 sānjī, i 五福 wǔfú, il 大遊 dàyóu, la porta di turno — che si muovono su scale di decenni e sono ciò che colloca quest\'anno dentro una figura più lunga. Ogni sezione dice che cosa la configurazione **è**. Nessuna dice che cosa accadrà.',
  'prompt.taiyi.read':
    'Dove guardare per tutto questo — l\'ordine in cui guardi, mai l\'ordine in cui scrivi: il palazzo in cui sta 太乙 tàiyǐ e l\'anno a cui è dentro di esso; il 局 jú e il 紀 jì a cui il conteggio è arrivato; dove sono caduti i due occhi e che cosa sta con loro; i due conti e i generali che ciascuno insedia; ogni condizione che il quadro nomina; il 計神 jìshén e il 合神 héshén; e i circuiti più lunghi con l\'anno a cui ciascuno sta nel proprio periodo. Che cosa significhi una **posizione** — un palazzo, un seggio, un occhio dove è caduto — non è stampato qui e questo motore non ne fornisce nulla: dove una sezione attinge alla tradizione per un significato, nomina ciò a cui attingi e, dove è la lettura di una scuola e non del testo, di\' di chi è. Le **condizioni** sono l\'eccezione, e l\'unica: ciascuna è stampata con la frase che il 卷三 juàn sān usa per dire che cosa sia, quindi lì usa le parole che ci sono e non andare oltre.',
  'prompt.taiyi.invite':
    'Chiudi aprendo, non chiudendo. Di\' brevemente che cosa si potrebbe guardare dopo e che cosa ti servirebbe sapere per guardarlo — una parte della figura che hai lasciato da parte, l\'assegnazione di ospitante e ospite che hai fatto e che cosa la cambierebbe, un circuito che hai rinunciato a leggere. Non porre più di due domande, e non mettere domande al posto della lettura. È un invito, non un modulo.',

  'prompt.source': 'Il quadro è all\'indirizzo {url}',
  'prompt.chart': 'La carta',
  'prompt.asked': 'La domanda posta è:',
  'prompt.noQuestion':
    'Nessuna domanda è stata posta. Descrivi come si presenta la carta — che cosa giace e che cosa sta in ciascun palazzo, e in quali configurazioni è caduta — e fermati lì. Non scegliere un palazzo, non leggere una fortuna per nessuno, e non dare consigli.',

  'cli.heading.moment': 'Istante',
  'cli.heading.pillars': 'Quattro pilastri',
  'cli.heading.qimen': 'Carta Qi Men',
  'cli.heading.palaces': 'Nove palazzi',
  'cli.heading.standing': 'Che cosa vi sta',
  'cli.heading.weighed': 'Come vi stanno',
  'cli.heading.reading': 'Lettura',
  'cli.heading.luck': 'Cicli decennali',
  'cli.heading.terms': 'Termini solari del {year}',
  'cli.heading.calendar': 'Data lunare',
  'cli.heading.patterns': 'Configurazioni',
  'cli.heading.readings': 'Come si leggono i nomi',
  'cli.field.lodged': 'Il centro si alloggia nel palazzo {palace}, dove si legge il suo {stem}.',
  'cli.field.lodgedShort': 'qui si alloggia il centro: {stem}',
  'cli.field.horse': '{from}: {branch}, palazzo {palace}',
  // 年命 — la nascita cercata dentro una carta posta per un momento, che è il
  // verso classico: la carta è quella dell'ora, e la persona vi si colloca
  // dentro. Non è la carta di una nascita; vedi docs/sources.md.
  'cli.heading.nianming': 'Dove sta la nascita',
  // L'unica divergenza del Liu Ren offerta al lettore. Ogni opzione dice a
  // parole di quale verso si tratta: un'opzione che recitasse `chou` sarebbe
  // una che nessuno può scegliere di proposito.
  // A quale quadro si pone la domanda. Le opzioni guidano con ciò a cui
  // servono, perché chi arriva con una domanda ne riconosce la forma e non ha
  // modo di pesare due nomi cinesi. Qui c'è solo la faccenda: il nome dell'arte
  // sta sotto queste parole e non dentro, perché 奇門遁甲 è qíméndùnjiǎ in ogni
  // lingua e un nome non si traduce. Vive in `instruments.ts`.
  // Ciò che la consultazione nomina in chiaro. Solo la circostanza prende un
  // nome: i campi sopra sono quelli che la riga d'apertura già annuncia, e un
  // titolo su di essi direbbe una terza volta ciò che dicono due etichette.
  'form.group.standing': 'Da dove chiedi',
  'form.group.birth': 'La nascita su cui il quadro è steso',
  'form.instrument': 'Che tipo di lettura è',
  'form.instrument.qimen': 'Quando muovermi, e da che parte',
  'form.instrument.liuren': 'Cosa sta succedendo, e con chi',
  'form.instrument.qizheng': 'Il cielo sotto cui una vita è cominciata',
  'form.instrument.ziwei': 'I seggi in cui una vita è contata',
  'form.instrument.bazi': "Di che cosa è fatta una vita, all'ora di una nascita",
  'form.instrument.taiyi': 'Come sta un anno, per tutti quelli che ci stanno dentro',
  'form.guiren': 'Quale verso insedia il nobile (貴人)',
  'form.guiren.chou': '甲 con 戊 e 庚, a 丑 e 未',
  'form.guiren.wei': '甲 da solo, a 未 e 丑',
  'form.guiren.note': 'Muove i dodici generali e lascia stare le tre trasmissioni.',
  'cli.column.general': 'generale',
  // 七政四餘. `lodge` e `ci` intestano dei gradi, quindi entrambi dicono da
  // che cosa i gradi sono misurati: uno da una stella, l'altro dal bordo di
  // un palazzo.
  'cli.column.body': 'corpo',
  'cli.column.inLodge': 'dimora, e gradi oltre la sua stella',
  'cli.column.inPalace': 'palazzo, e gradi dentro',
  'cli.column.motion': 'corre',
  'cli.column.house': 'palazzo di',
  'cli.column.standing': 'vi sta',
  'cli.column.seat': 'seggio',
  // Il nome accessibile delle dodici aree sensibili sovrapposte al
  // disegno. Non portano testo proprio — il seggio sta sotto, sulla
  // figura — quindi è l'unico nome che un lettore di schermo ha.
  'board.seatLink': 'Mostra che cosa sta in {seat}',
  'board.seatBack': 'Trova {seat} sul grafico qui sopra',
  'cli.column.ground': 'terreno',
  'cli.column.starsThere': 'contate dentro',
  'cli.column.rings': 'anelli',
  'cli.column.limit': 'decennio',
  'cli.heading.liuren': 'Il quadro del Liu Ren',
  'cli.field.yuejiang': 'generale del mese',
  'cli.field.plate': 'cielo sopra terra',
  'cli.field.courses': 'le quattro lezioni',
  'cli.field.transmissions': 'le tre trasmissioni',
  'cli.field.drawnBy': 'tratto per',
  'cli.field.keti': 'figura',
  'cli.field.half': 'metà del giorno',
  'cli.value.dayHalf': 'giorno, da 卯 a 申',
  'cli.value.nightHalf': 'notte, da 酉 a 寅',
  'cli.value.emptyBranch': 'vuoto',
  'cli.value.liurenUnverified':
    'nessuna implementazione di riferimento copre questa regola; il testo classico enumera ogni quadro che essa può trarre, e questo motore li restituisce tutti',
  'cli.heading.qizheng': 'I sette governatori e i quattro residui',
  'cli.field.governors': 'i sette',
  'cli.field.remainders': 'i residui',
  'cli.field.minggong': 'palazzo della vita',
  'cli.field.houses': 'i dodici palazzi',

  'cli.heading.ziwei': 'La tavola di Zi Wei Dou Shu',
  // Detto nella trascrizione perché è un dato che ha mosso la tavola: gira il
  // 大限 e il 小限, dunque ogni decennio stampato ne dipende. Ed è l'unico
  // fatto biografico che la tavola porta, mentre una lettura è rivolta a una
  // persona — un modello lasciato a indovinarlo indovina, e in una lingua che
  // concorda sbaglia in modo visibile una volta su due.
  'cli.field.gender': 'sesso',
  'label.gender.male': 'maschile',
  'label.gender.female': 'femminile',
  'cli.field.bureau': 'il quadro',
  'cli.field.minggongPalace': 'palazzo della vita',
  'cli.field.shengong': 'palazzo del corpo',
  'cli.field.lifeMaster': 'signore della vita',
  'cli.field.bodyMaster': 'signore del corpo',
  'cli.field.ziweiPalaces': 'i dodici seggi',
  'cli.field.lunarDate': 'la data lunare',
  // Detto una volta, dove chi legge può soppesarlo. Si veda `docs/history/`, fase 23.
  'cli.value.ziweiSource':
    'collocazioni dal 《紫微斗數全書》 卷二 in ogni punto — la trasmissione delle quattordici stelle, non quella delle diciotto, i 十八飛星 del 《全集》 e del 《捷覽》; dove le sue tavole si scostano da quelle moderne — 火星 e 鈴星 slegate dall\'ora, 魁鉞 a 丙丁辛, 解神 preso dall\'anno, 壬 che dà 科 a 天府 — si segue questo libro e lo scostamento è registrato',
  'form.luohou': 'Quale nodo è 羅睺',
  'form.luohou.descending': 'il nodo discendente — la legge degli astrologi',
  'form.luohou.ascending': 'il nodo ascendente — 湯若望 e il 時憲曆',
  'form.copyStars': 'Copia la tavola',
  'form.luohou.note':
    'Scambia i due nomi e non muove altro: i due nodi sono i capi di una sola linea, a mezzo giro l\'uno dall\'altro. Il default è quello che gli astrologi hanno tenuto, che è il rovescio della convenzione indiana.',
  // Stampato sotto ogni tavola, perché a chi conta quattro nomi e ne trova
  // tre la ragione è dovuta sulla pagina, non in un documento.
  'cli.value.threeRemainders':
    'tre, non quattro: 紫氣 è una tavola e non un corpo, quindi non esiste una posizione in cielo con cui verificarne la tavola',
  // Detto una volta sotto una tavola il cui quadro non ha nulla di pubblicato
  // contro cui essere verificato. Vedi `docs/history/`, fase 16.
  'cli.value.qizhengFrame':
    'le dimore cominciano alle loro stelle di riferimento, collocate a questo istante; nessuna tavola di 宿度 e nessuna epoca vi entra',

  'cli.heading.taiyi': 'La tavola di Tai Yi del {year}',
  'cli.field.taiyiSui': 'anno',
  'cli.field.taiyiJu': 'disposizione',
  'cli.field.taiyiEyes': 'i due occhi',
  'cli.field.taiyiCounts': 'i due conti',
  'cli.field.taiyiBases': 'le tre basi',
  'cli.field.taiyiCircuits': 'i giri lunghi',
  'cli.field.taiyiGate': 'porta di turno',
  'cli.field.taiyiConditions': 'condizioni',
  // Due righe che ogni tavola di 太乙 porta con sé, perché su entrambe un
  // lettore che le tenga accanto a una carta di Qi Men sbaglierebbe in
  // silenzio.
  'cli.value.taiyiPalaces':
    'i palazzi sono numerati come li numera 太乙, a un seggio dal 洛書: qui 一宮 è il nord-ovest, in una carta di Qi Men il nord',
  'cli.value.taiyiEvidence':
    'verificata sulle tavole e sulle carte svolte del 《太乙金鏡式經》 stesso; di questa tavola non esiste alcuna implementazione indipendente su cui controllarla',

  'cli.heading.scan': 'Carte dal {from} al {to}',
  'cli.heading.criteria': 'Richiesto',
  'cli.heading.warnings': 'Avvertenze',

  'cli.field.local': 'locale',
  'cli.field.utc': 'universale',
  'cli.field.solar': 'solare vero',
  'cli.field.correction': 'correzione',
  'cli.field.term': 'termine',
  'cli.field.jie': 'mese aperto il',
  'cli.field.monthGods': 'Virtù del mese',
  'cli.field.shensha': 'Il giorno porta',
  'cli.field.yearGods': 'Dèi dell\'anno',
  'cli.field.lodge': 'Dimora del giorno',
  'cli.field.dayGod': 'Dio del giorno',
  'web.calendar.heading': 'Il calendario',
  'web.almanac.heading': 'La pagina dell\'almanacco',
  'cli.field.jianchu': 'Ufficiale del giorno',
  'cli.field.lunar': 'lunare',
  'cli.field.ju': 'ju',
  'cli.field.chief': 'capo',
  'cli.field.chiefGate': 'porta del capo',
  'cli.field.instrument': 'cela 甲',
  'cli.field.dayMaster': 'padrone del giorno',
  'cli.field.empty': 'rami vuoti',
  'cli.field.distribution': 'cinque elementi',
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
  'cli.column.stem': 'stelo',
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

  'cli.value.byWeight': 'dal più forte',
  'cli.value.yangDun': 'dun yang',
  'cli.value.yinDun': 'dun yin',
  'cli.value.forward': 'in avanti',
  'cli.value.backward': 'all\'indietro',
  'cli.value.jianchuDoubled': 'raddoppiato: il mese cambia in questa data',
  'cli.value.leapMonth': 'mese intercalare',
  'cli.value.minutes': '{value} min',
  // Quanto dopo la nascita si aprono i cicli decennali: anni, mesi, giorni.
  'cli.value.luckStart': '{years}a {months}m {days}g',
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
  'cli.error.numberRequired': 'L\'opzione "{option}" richiede un numero intero, e "{value}" non lo è.',
  'cli.error.contradiction':
    'L\'opzione "{option}" dice già quale porta cercare, e "{other}" ne dice un\'altra. Togline una.',
  'cli.error.exclusive':
    'Le opzioni "{option}" e "{other}" non possono stare insieme: chiedono due letture diverse della stessa carta. Togline una.',
  'cli.error.unknownValue':
    'L\'opzione "{option}" non accetta il valore "{value}". Se non venisse controllato non corrisponderebbe a nulla, il che si legge esattamente come una disposizione che non si è mai presentata.',
  'cli.error.genderRequired':
    'I cicli decennali richiedono --gender, perché la tradizione ne trae la direzione. Senza, i pilastri restano comunque completi.',
  'cli.error.notAsked':
    'Il comando "{command}" stende un quadro su una nascita, e ad esso non si chiede nulla — quindi "--ask" non ha dove andare. Per quale parte di una vita si legga un quadro di 命 lo sceglie il lettore, ad alta voce, dopo che è stato steso. Togli la domanda, oppure ponila a `chart` o a `liuren`, che sono posti per una.',
  'cli.error.notAbout':
    'Il comando "{command}" non prende "--about". Una faccenda è il campo visivo dentro cui si legge un quadro 太乙 di un anno — ciò che si sta guardando, che è quanto dice chi è 主 e chi è 客 — e `taiyi` è il comando che stende quel quadro. Un quadro di 卜 si pone invece per una domanda ("--ask"), e un quadro di 命 si stende su una persona e non chiede nulla.',
  'cli.error.notCarried': 'Il comando "{command}" non prende "{option}".',
  'cli.error.notAskedYear':
    'Il comando "{command}" stende un quadro su un anno, e ad esso non si chiede nulla — quindi "--ask" non ha dove andare. Su questo quadro non c\'è nessuno: il suo soggetto è l\'anno in cui tutti si trovano, e una domanda è il modo in cui chi legge finisce dentro una figura in cui non è. Quello che questo quadro prende è "--about": la faccenda che stai guardando, che è un campo visivo e non una domanda, ed è ciò che dice chi è 主 e chi è 客. Usa quello, oppure poni la domanda a `chart` o a `liuren`, che sono posti per una.',

  'search.none': 'Nessun luogo trovato per "{query}".',
  'search.coverage':
    'L\'archivio comprende i luoghi abitati sopra i cinquecento abitanti, più ogni capoluogo amministrativo di qualunque dimensione. Vale la pena provare: la grafia locale, il nome del comune invece della frazione, o un luogo più grande lì vicino.',
  'search.candidates': '{count} candidati per "{query}".',
  'search.candidate': 'Un candidato per "{query}".',
  'search.column': 'La prima colonna è location_id.',
};
