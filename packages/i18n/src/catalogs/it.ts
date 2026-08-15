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
  'core.error.TOO_MANY_YEARS':
    'Una serie di {years} pilastri dell\'anno supera i {maximum} che si possono chiedere in una volta.',

  'core.warning.AMBIGUOUS_LOCAL_TIME':
    'L\'ora locale {time} del {date} ricorre due volte in {timezone} (ritorno all\'ora solare). È stata usata la prima occorrenza, quella ancora in ora legale.',
  'core.warning.NONEXISTENT_LOCAL_TIME':
    'L\'ora locale {time} del {date} non è mai esistita in {timezone} (passaggio all\'ora legale). È stato usato l\'istante immediatamente successivo.',
  'core.warning.MOSHIER_FALLBACK':
    'File di effemeridi non trovati in {path}: si usano le effemeridi Moshier, che non richiedono file e sono accurate a circa un decimo di secondo d\'arco. Esegui `npm run ephe:download -w @qimendunjia/core` per i file completi.',

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
  'nav.chart': 'Qi Men',
  'nav.bazi': 'Ba Zi',
  'nav.liuren': 'Liu Ren',
  'nav.qizheng': 'Qi Zheng Si Yu',
  'nav.moments': 'Scegliere il momento',
  'nav.consult': 'Consultazione',
  'nav.sections': 'Sezioni',

  // La sezione che percorre carte Qi Men, nominata con l'arte che percorre.
  // L'etichetta della nav non può portarlo — un'intestazione dice dove stanno
  // le cose, non di cosa sono fatte — e qui serve a chi legge i risultati.
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

  'form.options': 'Opzioni',
  'form.optionsSet': 'Opzioni modificate: {count}',
  'form.moment': 'L\'istante',
  'form.momentNote':
    'Lasciali vuoti e la carta è posta per l\'istante in cui premi, nell\'ora del luogo qui sopra — che è l\'uso classico. Compilali per porre la domanda a un altro momento.',
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
  'form.needed.gender':
    'I cicli decennali richiedono il sesso, perché la tradizione ne trae la direzione. Senza, i pilastri restano comunque completi.',
  'form.jumpDate': 'Il giorno per cui la carta è posta',

  'form.strengthLegend': 'Come stanno la stella e la porta rispetto alla stagione',

  'form.copyChart': 'Copia la carta come testo',
  'form.copyBoard': 'Copia il quadro come testo',
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
    'Poni una domanda e ottieni un prompt pronto — da incollare in ChatGPT, Claude o un altro assistente.',
  'consult.cast': 'Poni la domanda',
  'consult.change': 'Cambia la domanda',
  'consult.castAt': 'Posto per il {when}',
  'consult.castFailed': 'Non è stato possibile porre il quadro.',



  'form.promptPrivacy': 'I dati inseriti verranno inclusi nel prompt.',
  'form.question': 'La tua domanda',
  'form.questionPlaceholder': 'Che cosa stai chiedendo?',

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
    'Questo sito ha il solo scopo di offrire spunti di riflessione e intrattenimento, in nessun caso sostituisce il parere di professionisti per questioni mediche, legali, finanziarie o altro.',
  'footer.data': 'Dati astronomici {ephemeris} · località {geonames} (CC BY 4.0)',
  'footer.licence': 'Codice sorgente sotto licenza AGPL-3.0',
  'footer.privacy': 'Privacy',
  'footer.notes': 'Note',

  'notes.title': 'Sezione in corso di definizione',

  'privacy.title': 'Privacy',
  'privacy.nothing':
    'Nulla di ciò che digiti viene conservato. Date, ore e luoghi — compresa una data di nascita, se ne indichi una perché una carta dica dove cade — viaggiano nell\'indirizzo della pagina, servono a calcolare una risposta, e non vengono scritti in alcuna base di dati né in alcun registro tenuto da questo sito.',
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
  'prompt.source': 'Il quadro è all\'indirizzo {url}',
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
  // modo di pesare due nomi cinesi. Il nome dell'arte segue le parole invece
  // di sostituirle: un metodo è una cosa cinese, ed è l'unico punto della
  // pagina in cui è quello a essere nominato.
  // Ciò che la consultazione nomina in chiaro. Solo la circostanza prende un
  // nome: i campi sopra sono quelli che la riga d'apertura già annuncia, e un
  // titolo su di essi direbbe una terza volta ciò che dicono due etichette.
  'form.group.standing': 'Da dove chiedi',
  'form.instrument': 'Che tipo di domanda è',
  'form.instrument.qimen': 'Quando muovermi, e da che parte — 奇門遁甲 qíméndùnjiǎ',
  'form.instrument.liuren': 'Cosa sta succedendo, e con chi — 大六壬 dàliùrén',
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
  // contro cui essere verificato. Vedi PLAN.md § 4 fase 16.
  'cli.value.qizhengFrame':
    'le dimore cominciano alle loro stelle di riferimento, collocate a questo istante; nessuna tavola di 宿度 e nessuna epoca vi entra',

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

  'search.none': 'Nessun luogo trovato per "{query}".',
  'search.coverage':
    'L\'archivio comprende i luoghi abitati sopra i cinquecento abitanti, più ogni capoluogo amministrativo di qualunque dimensione. Vale la pena provare: la grafia locale, il nome del comune invece della frazione, o un luogo più grande lì vicino.',
  'search.candidates': '{count} candidati per "{query}".',
  'search.candidate': 'Un candidato per "{query}".',
  'search.column': 'La prima colonna è location_id.',
};
