/**
 * The English catalog is the source of truth for the set of message keys:
 * every other catalog is typed against it, so a missing translation is a
 * compilation error rather than a silent fallback at runtime.
 *
 * Keys are namespaced by the package that raises them (`geo.`, `core.`) and
 * then by kind (`error.`, `warning.`, `label.`, `cli.`). The suffix of an
 * error or warning key is the code itself, which is what lets a surface
 * translate a caught error without a lookup table of its own; the suffix of a
 * label key is the engine's identifier, for the same reason.
 *
 * The labels are **glosses, not translations**. 休門 is the name of the gate;
 * "Rest" is what a reader who does not read Chinese can hold on to.
 *
 * Which of the two a surface leads with is the surface's decision, and it is
 * not the same everywhere: the drawing and the tables lead with the gloss,
 * because most of the people reading them cannot read the other. The engine
 * still returns both, and the identifier under both, so nothing here decides
 * for anyone downstream.
 *
 * Placeholders are `{name}` and are filled by `format`.
 */
export const en = {
  'geo.error.DATABASE_MISSING':
    'Location database not found at {path}. Build it once with `npm run geo:import -w @qimendunjia/geo` (downloads ~215 MB from GeoNames).',
  'geo.error.EMPTY_QUERY': 'The search string is empty.',
  'geo.error.DATABASE_CORRUPT': 'Cannot open {path}: {reason}',

  'core.error.INVALID_DATE': 'Date "{date}" is not valid: expected the format YYYY-MM-DD.',
  'core.error.INVALID_TIME': 'Time "{time}" is not valid: expected HH:mm or HH:mm:ss.',
  'core.error.UNKNOWN_TIMEZONE':
    'Timezone "{timezone}" is unknown: expected an IANA identifier, e.g. Asia/Shanghai.',
  'core.error.INVALID_COORDINATES':
    'Longitude {longitude} is out of range: expected between -180 and 180 degrees.',
  'core.error.DATE_OUT_OF_RANGE':
    'Date {date} falls outside the range the ephemeris covers ({from} to {to}).',
  'core.error.METHOD_NOT_IMPLEMENTED':
    'The {method} method for determining the ju is not implemented. Only chaibu is, and no other method is substituted for it: a chart cast by the wrong method looks right and is not.',
  'core.error.OPTION_NOT_IMPLEMENTED':
    '"{value}" for {option} is not implemented. Only {implemented} is, and no other value is substituted for it: a chart cast under the wrong option looks right and is not.',
  'core.error.EPHEMERIS_FAILURE': 'Ephemeris calculation failed at Julian Day {julianDay}: {reason}',
  'core.error.EMPTY_INTERVAL': 'The interval from {from} to {to} contains no time: it must end after it begins.',
  'core.error.INTERVAL_TOO_LONG':
    'An interval of {days} days is longer than the {maximum} days that can be scanned at once.',
  'core.error.UNKNOWN_IDENTIFIER':
    '"{value}" is not a {parameter} the engine knows. Left unchecked it would match nothing, which reads exactly like an arrangement that never occurred.',
  'core.error.BIRTH_AFTER_CHART':
    'The birth falls after the chart, so there are no years to count: a 行年 steps forward from a birth and cannot be asked for before one.',
  'core.error.YEARS_OUT_OF_RANGE':
    '{years} is not a count of years a 行年 can be taken for: the count opens at one, in the year of the birth itself.',
  'core.error.TOO_MANY_YEARS':
    'A run of {years} year pillars is longer than the {maximum} that can be asked for at once.',

  'core.warning.AMBIGUOUS_LOCAL_TIME':
    'Local time {time} on {date} occurs twice in {timezone} (clocks went back). The first occurrence was used, the one still on summer time.',
  'core.warning.NONEXISTENT_LOCAL_TIME':
    'Local time {time} on {date} never existed in {timezone} (clocks went forward). The instant immediately after was used.',
  'core.warning.MOSHIER_FALLBACK':
    'Ephemeris files not found in {path}: using the Moshier ephemeris, which needs no files and is accurate to about a tenth of an arc second. Run `npm run ephe:download -w @qimendunjia/core` for the full files.',

  'web.error.UNKNOWN_LOCATION': 'No place has the identifier {id}.',
  // Refused rather than clamped: `Number('abc')` is NaN, and NaN slides
  // through a min/max clamp to be served as garbage that looks like an answer.
  'web.error.INVALID_NUMBER': '"{value}" is not a valid number for {parameter}.',

  // The reader here is a model, and each message says what to do instead:
  // an agent told only that its input was refused invents the correction.
  'mcp.error.UNKNOWN_LOCATION':
    'No place has the GeoNames identifier {id}. Use search_location to get one; do not invent it.',
  'mcp.error.INCOMPLETE_COORDINATES':
    'Coordinates are incomplete. Pass latitude, longitude and timezone together, or pass location_id from search_location instead.',

  'label.stem.jia': 'Yang Wood',
  'label.stem.yi': 'Yin Wood',
  'label.stem.bing': 'Yang Fire',
  'label.stem.ding': 'Yin Fire',
  'label.stem.wu': 'Yang Earth',
  'label.stem.ji': 'Yin Earth',
  'label.stem.geng': 'Yang Metal',
  'label.stem.xin': 'Yin Metal',
  'label.stem.ren': 'Yang Water',
  'label.stem.gui': 'Yin Water',

  'label.branch.zi': 'Rat',
  'label.branch.chou': 'Ox',
  'label.branch.yin': 'Tiger',
  'label.branch.mao': 'Rabbit',
  'label.branch.chen': 'Dragon',
  'label.branch.si': 'Snake',
  'label.branch.wu': 'Horse',
  'label.branch.wei': 'Goat',
  'label.branch.shen': 'Monkey',
  'label.branch.you': 'Rooster',
  'label.branch.xu': 'Dog',
  'label.branch.hai': 'Pig',

  'label.element.mu': 'wood',
  'label.element.huo': 'fire',
  'label.element.tu': 'earth',
  'label.element.jin': 'metal',
  'label.element.shui': 'water',

  'label.palace.kan': 'north',
  'label.palace.kun': 'southwest',
  'label.palace.zhen': 'east',
  'label.palace.xun': 'southeast',
  'label.palace.zhong': 'centre',
  'label.palace.qian': 'northwest',
  'label.palace.dui': 'west',
  'label.palace.gen': 'northeast',
  'label.palace.li': 'south',

  // The same eight directions abbreviated, for the frame around the drawing:
  // a band a twentieth of the picture wide holds "SE" and not "southeast".
  // Two keys for one thing because the abbreviation is not the word cut
  // short — Italian says O for west, from `ovest`, where English says W.
  'label.compass.n': 'N',
  'label.compass.ne': 'NE',
  'label.compass.e': 'E',
  'label.compass.se': 'SE',
  'label.compass.s': 'S',
  'label.compass.sw': 'SW',
  'label.compass.w': 'W',
  'label.compass.nw': 'NW',

  'label.star.tianpeng': 'Canopy',
  'label.star.tianrui': 'Grain',
  'label.star.tianchong': 'Rush',
  'label.star.tianfu': 'Assistant',
  'label.star.tianqin': 'Bird',
  'label.star.tianxin': 'Heart',
  'label.star.tianzhu': 'Pillar',
  'label.star.tianren': 'Charge',
  'label.star.tianying': 'Hero',

  'label.gate.xiumen': 'Rest',
  'label.gate.shengmen': 'Life',
  'label.gate.shangmen': 'Harm',
  'label.gate.dumen': 'Block',
  'label.gate.jing3men': 'View',
  'label.gate.simen': 'Death',
  'label.gate.jing1men': 'Shock',
  'label.gate.kaimen': 'Open',

  'label.spirit.zhifu': 'Chief',
  'label.spirit.tengshe': 'Snake',
  'label.spirit.taiyin': 'Moon',
  'label.spirit.liuhe': 'Union',
  'label.spirit.gouchen': 'Hook',
  'label.spirit.baihu': 'White Tiger',
  'label.spirit.zhuque': 'Vermilion Bird',
  'label.spirit.xuanwu': 'Dark Warrior',
  'label.spirit.jiudi': 'Nine Earth',
  'label.spirit.jiutian': 'Nine Heaven',

  'label.term.lichun': 'start of spring',
  'label.term.yushui': 'rain water',
  'label.term.jingzhe': 'waking of insects',
  'label.term.chunfen': 'spring equinox',
  'label.term.qingming': 'clear and bright',
  'label.term.guyu': 'grain rain',
  'label.term.lixia': 'start of summer',
  'label.term.xiaoman': 'grain buds',
  'label.term.mangzhong': 'grain in ear',
  'label.term.xiazhi': 'summer solstice',
  'label.term.xiaoshu': 'minor heat',
  'label.term.dashu': 'major heat',
  'label.term.liqiu': 'start of autumn',
  'label.term.chushu': 'end of heat',
  'label.term.bailu': 'white dew',
  'label.term.qiufen': 'autumn equinox',
  'label.term.hanlu': 'cold dew',
  'label.term.shuangjiang': 'frost descends',
  'label.term.lidong': 'start of winter',
  'label.term.xiaoxue': 'minor snow',
  'label.term.daxue': 'major snow',
  'label.term.dongzhi': 'winter solstice',
  'label.term.xiaohan': 'minor cold',
  'label.term.dahan': 'major cold',

  'label.yuan.shang': 'upper yuan',
  'label.yuan.zhong': 'middle yuan',
  'label.yuan.xia': 'lower yuan',

  'label.god.bijian': 'Peer',
  'label.god.jiecai': 'Rival',
  'label.god.shishen': 'Output',
  'label.god.shangguan': 'Hurting Officer',
  'label.god.piancai': 'Indirect Wealth',
  'label.god.zhengcai': 'Direct Wealth',
  'label.god.qisha': 'Seven Killings',
  'label.god.zhengguan': 'Direct Officer',
  'label.god.pianyin': 'Indirect Resource',
  'label.god.zhengyin': 'Direct Resource',

  'label.stage.changsheng': 'birth',
  'label.stage.muyu': 'bathing',
  'label.stage.guandai': 'capping',
  'label.stage.linguan': 'office',
  'label.stage.diwang': 'prime',
  'label.stage.shuai': 'decline',
  'label.stage.bing': 'illness',
  'label.stage.si': 'death',
  'label.stage.mu': 'tomb',
  'label.stage.jue': 'severance',
  'label.stage.tai': 'conception',
  'label.stage.yang': 'nurture',

  'label.pattern.kongwang': 'void',
  'label.pattern.rumu': 'entombed',
  'label.pattern.menpo': 'gate oppressed',
  'label.pattern.jixing': 'instrument struck',
  'label.pattern.fuyin': 'the board come home',
  'label.pattern.fanyin': 'the board turned about',
  'label.pattern.wubuyu': 'the hour that does not meet',
  'label.pattern.qinglongfanshou': 'the dragon turns its head',
  'label.pattern.feiniaodiexue': 'the bird falls to the nest',
  // 十干克應. The images are the tradition's own — Venus is 太白, the white
  // one, and Mars is 熒惑, the fiery muddler — and they are kept rather than
  // paraphrased, because a reader who meets 太白入熒 in a book has to be able
  // to recognise what the software called it.
  'label.pattern.taibairuying': 'the white star enters the fire',
  'label.pattern.yingrutaibai': 'the fire enters the white star',
  'label.pattern.dage': 'the great barrier',
  'label.pattern.xingge': 'the barrier of punishment',
  'label.pattern.zhange': 'the barrier of battle',
  'label.pattern.tengsheyaojiao': 'the serpent writhes',
  'label.pattern.zhuquetoujiang': 'the vermilion bird throws itself in the river',
  'label.pattern.qinglongtaozou': 'the dragon runs away',
  'label.pattern.baihuchangkuang': 'the white tiger runs wild',

  // The fortune each configuration is transmitted with. These are the plain
  // translations and not softer ones: 凶 is what the sources say, and a gloss
  // chosen to sound neutral would be the engine editing its material rather
  // than reporting it. What they qualify is the arrangement — never an hour,
  // a chart, or anything somebody is about to do.
  'label.valence.ji': 'auspicious',
  'label.valence.xiong': 'inauspicious',
  'label.valence.jixiong': 'auspicious and inauspicious',

  // How a gate or a star stands to the palace it has come to rest in. 我 is
  // the gate or the star and 宮 is the ground: the five relations of the
  // phases, said from the traveller's side. They are the relations themselves
  // and not the words a school puts on them — see `dunjia/relation.ts`.
  //
  // One word each, because they are read in a column beside the strength and
  // a phrase there is a phrase nobody finishes. The two verbs are the ones
  // the engine already uses for 生 and 剋, so a reader meets the same word for
  // the same cycle wherever it turns up.
  'label.relation.bihe': 'same phase',
  'label.relation.shengwo': 'generated',
  'label.relation.wosheng': 'generating',
  'label.relation.kewo': 'controlled',
  'label.relation.woke': 'controlling',

  // The post horse, and which pillar's branch it was reckoned from. Both are
  // named in the tradition and neither stands for the other.
  'label.horse.day': 'horse of the day',
  'label.horse.hour': 'horse of the hour',

  // The two pairs a person is placed by. 本命 is the year they were born in
  // and never moves; 行年 is the year they are living and moves by one pair a
  // year. Both are looked up in a chart cast for a moment.
  'label.nianming.benming': 'year of the birth',
  'label.nianming.xingnian': 'year being lived',

  // 六壬 — the second board. The names below are glosses beside the hanzi and
  // never in place of them: 登明 is dēngmíng to every reader, and what changes
  // per locale is only the phrase that tells an English reader what the name
  // says.

  // 月將 — the twelve seats of the Sun, which the board is turned by. They step
  // back one branch at each 中氣.
  'label.yuejiang.dengming': 'rising brightness',
  'label.yuejiang.hekui': 'chief of the river',
  'label.yuejiang.congkui': 'attendant chief',
  'label.yuejiang.chuansong': 'the courier',
  'label.yuejiang.xiaoji': 'lesser blessing',
  'label.yuejiang.shengguang': 'victorious light',
  'label.yuejiang.taiyi': 'the great one',
  'label.yuejiang.tiangang': 'pole of the sky',
  'label.yuejiang.taichong': 'great surge',
  'label.yuejiang.gongcao': 'clerk of merits',
  'label.yuejiang.daji': 'greater blessing',
  'label.yuejiang.shenhou': 'divine consort',

  // 十二天將 — laid around the noble, forwards or backwards according to the
  // palace the noble came to stand over.
  'label.general.guiren': 'the noble',
  'label.general.tengshe': 'the flying serpent',
  'label.general.zhuque': 'the vermilion bird',
  'label.general.liuhe': 'the six harmonies',
  'label.general.gouchen': 'the hooked array',
  'label.general.qinglong': 'the azure dragon',
  'label.general.tiankong': 'the void',
  'label.general.baihu': 'the white tiger',
  'label.general.taichang': 'the constant',
  'label.general.xuanwu': 'the dark warrior',
  'label.general.taiyin': 'the great yin',
  'label.general.tianhou': 'the celestial queen',

  // The four lessons and the three transmissions, by position.
  'label.course.1': 'first lesson',
  'label.course.2': 'second lesson',
  'label.course.3': 'third lesson',
  'label.course.4': 'fourth lesson',
  'label.transmission.chu': 'first',
  'label.transmission.zhong': 'middle',
  'label.transmission.mo': 'last',

  // 九宗門 — which of the nine rules drew the transmissions. A rule and not a
  // verdict: it says how the board was read, never how it turned out.
  'label.liurenRule.zeike': 'robbery and control',
  'label.liurenRule.biyong': 'the like one',
  'label.liurenRule.shehai': 'wading the harm',
  'label.liurenRule.yaoke': 'control from afar',
  'label.liurenRule.maoxing': 'at the fixed place',
  'label.liurenRule.bieze': 'the separate charge',
  'label.liurenRule.bazhuan': 'the eight concentrated',
  'label.liurenRule.fuyin': 'the still plate',
  'label.liurenRule.fanyin': 'the turned plate',

  // 課體 — the named shape the board turned out to be. Carried the way a
  // configuration of the nine palaces is: a name for an arrangement.
  // 建除十二神 — the twelve officers of the almanac's day. Names, not
  // verdicts: 危 is the officer called danger exactly as 死門 is the gate
  // called death, and what the 協紀 says each one suits stays in the 協紀.
  'label.officer.jian': 'establish',
  'label.officer.chu': 'remove',
  'label.officer.man': 'full',
  'label.officer.ping': 'level',
  'label.officer.ding': 'settle',
  'label.officer.zhi': 'hold',
  'label.officer.po': 'break',
  'label.officer.wei': 'danger',
  'label.officer.cheng': 'complete',
  'label.officer.shou': 'gather',
  'label.officer.kai': 'open',
  'label.officer.bi': 'shut',

  // 二十八宿 — the lodges, as a count of days. Names only: what the almanacs
  // hang on each one is 宜忌, and 《協紀辨方書》卷三十六 rejects the whole
  // doctrine as an import. The 禽象 — the animal in 鬼金羊 — is not here
  // either; the same source dates it late. See docs/sources.md.
  'label.lodge.jiao': 'the horn',
  'label.lodge.kang': 'the neck',
  'label.lodge.di': 'the root',
  'label.lodge.fang': 'the chamber',
  'label.lodge.xin': 'the heart',
  'label.lodge.wei3': 'the tail',
  'label.lodge.ji': 'the winnowing basket',
  'label.lodge.dou': 'the dipper',
  'label.lodge.niu': 'the ox',
  'label.lodge.nv': 'the maiden',
  'label.lodge.xu': 'the void',
  'label.lodge.wei1': 'the rooftop',
  'label.lodge.shi': 'the encampment',
  'label.lodge.bi13': 'the wall',
  'label.lodge.kui': 'the stride',
  'label.lodge.lou': 'the bond',
  'label.lodge.wei4': 'the stomach',
  'label.lodge.mao': 'the hairy head',
  'label.lodge.bi18': 'the net',
  'label.lodge.zi': 'the beak',
  'label.lodge.shen': 'the three stars',
  'label.lodge.jing': 'the well',
  'label.lodge.gui': 'the ghost',
  'label.lodge.liu': 'the willow',
  'label.lodge.xing': 'the star',
  'label.lodge.zhang': 'the extended net',
  'label.lodge.yi': 'the wings',
  'label.lodge.zhen': 'the chariot crossbar',

  // 七政四餘 — the seven governors and the four remainders. The five planets
  // are the five phases and are named for them; the Sun and the Moon stand
  // outside that count. The four are 隱曜, computed positions rather than
  // bodies, and 紫氣 is named here and placed nowhere: its epoch cannot be
  // cited, so no board carries it. See docs/sources.md.
  'label.qizheng.taiyang': 'the sun',
  'label.qizheng.taiyin': 'the moon',
  'label.qizheng.shuixing': 'Mercury',
  'label.qizheng.jinxing': 'Venus',
  'label.qizheng.huoxing': 'Mars',
  'label.qizheng.muxing': 'Jupiter',
  'label.qizheng.tuxing': 'Saturn',
  'label.qizheng.luohou': 'the eclipse head',
  'label.qizheng.jidu': 'the eclipse tail',
  'label.qizheng.yuebei': 'the lunar apogee',
  'label.qizheng.ziqi': 'the purple vapour',

  // 十二次 — the twelve stretches of sky, which is what a palace of this
  // board is called. They run backwards against the branches because they
  // are named for where the Sun is, and the Sun crosses them as the seasons
  // do: 春分 opens 降婁 at 戌.
  'label.ci.xuanxiao': 'the dark emptiness',
  'label.ci.xingji': 'the star record',
  'label.ci.ximu': 'the split wood',
  'label.ci.dahuo': 'the great fire',
  'label.ci.shouxing': 'the star of long life',
  'label.ci.chunwei': 'the quail tail',
  'label.ci.chunhuo': 'the quail fire',
  'label.ci.chunshou': 'the quail head',
  'label.ci.shichen': 'the deep truth',
  'label.ci.daliang': 'the great beam',
  'label.ci.jianglou': 'the descending bond',
  'label.ci.juzi': 'the gathering',

  // 順 and 逆 — which way a body runs, read off the sign of its daily motion
  // and nothing else. 留, a station, would need a threshold on that number
  // and no source consulted states one.
  'label.motion.shun': 'direct',
  'label.motion.ni': 'retrograde',

  // 人事十二宮 — the twelve palaces under what each is asked about. They are
  // numbered from the 命宮 and climb against the branches, which is forwards
  // through the sky; the direction rests on the names themselves and the
  // check is in docs/sources.md. Glosses translate the *name* and nothing
  // else: what a palace is asked is the reader's, as everywhere here.
  'label.house.ming': 'the life',
  'label.house.caibo': 'wealth',
  'label.house.xiongdi': 'siblings',
  'label.house.tianzhai': 'land and house',
  'label.house.nannv': 'children',
  'label.house.nupu': 'servants',
  'label.house.fuqi': 'husband and wife',
  'label.house.jie': 'illness and hardship',
  'label.house.qianyi': 'removal',
  'label.house.guanlu': 'office and salary',
  'label.house.fude': 'fortune and virtue',
  'label.house.xiangmao': 'countenance',

  // 十六神 — the ring a 太乙 board is read on: twelve branches and the four
  // corner trigrams, each under a name of its own. 卷二 of 《太乙金鏡式經》
  // gives the reason for every one of them, and the glosses follow those
  // reasons rather than the characters alone — 呂申 is 陽氣大申, the breath
  // stretching out, and not a surname.
  //
  // 太乙, the god this board is named for, is not one of the sixteen and is
  // not the 太乙 that names the 月將 巳 of a 六壬 board either. The three are
  // unrelated; see docs/sources.md, which owes the reader the sentence.
  'label.taiyishen.dizhu': 'the lord of earth',
  'label.taiyishen.yangde': 'the yang virtue',
  'label.taiyishen.hede': 'the virtue of concord',
  'label.taiyishen.lushen': 'the stretching breath',
  'label.taiyishen.gaocong': 'the high thicket',
  'label.taiyishen.taiyang': 'the great yang',
  'label.taiyishen.taijiong': 'the great blaze',
  'label.taiyishen.taishen': 'the great spirit',
  'label.taiyishen.dawei': 'the great awe',
  'label.taiyishen.tiandao': 'the way of heaven',
  'label.taiyishen.dawu': 'the great arms',
  'label.taiyishen.wude': 'the martial virtue',
  'label.taiyishen.taicu': 'the great gathering',
  'label.taiyishen.yinzhu': 'the lord of yin',
  'label.taiyishen.yinde': 'the yin virtue',
  'label.taiyishen.dayi': 'the great right',

  // What a 太乙 board places. The two eyes are the whole of it: 文昌, the
  // lower, belongs to the host and 始擊, the upper, to the guest, and the two
  // counts taken from them are what the board exists to produce. **Which
  // party is which is never said here** — that is the reader's first act, for
  // the reason the 用神 is.
  'label.taiyi.taiyi': 'Tai Yi',
  'label.taiyi.wenchang': 'the lower eye, the host',
  'label.taiyi.shiji': 'the upper eye, the guest',
  'label.taiyi.jishen': 'the reckoner',
  'label.taiyi.heshen': 'the year’s companion',
  'label.taiyi.hostCount': 'the host’s count',
  'label.taiyi.guestCount': 'the guest’s count',
  'label.taiyi.general': 'great general',
  'label.taiyi.assistant': 'adjutant',
  'label.taiyi.hostGeneral': 'the host’s great general',
  'label.taiyi.hostAssistant': 'the host’s adjutant',
  'label.taiyi.guestGeneral': 'the guest’s great general',
  'label.taiyi.guestAssistant': 'the guest’s adjutant',
  'label.taiyi.zhishi': 'the gate on duty',
  'label.taiyi.junji': 'the sovereign’s base',
  'label.taiyi.chenji': 'the minister’s base',
  'label.taiyi.minji': 'the people’s base',
  'label.taiyi.wufu': 'the five blessings',
  'label.taiyi.dayou': 'the great circuit',
  'label.taiyi.liuji': 'the six eras',
  'label.taiyi.ju': 'arrangement',
  'label.taiyi.accumulated': 'years accumulated',

  // 五福太乙's five stations, which are named palaces and not numbers: four
  // corners and the centre, forty-five years each. The text places each in a
  // region of the empire; the gloss keeps the name.
  'label.taiyiwufu.huangmi': 'the yellow secret',
  'label.taiyiwufu.huangshi': 'the yellow beginning',
  'label.taiyiwufu.huangshi2': 'the yellow chamber',
  'label.taiyiwufu.huangting': 'the yellow court',
  'label.taiyiwufu.xuanshi': 'the dark master',

  // The conditions 卷三 names and weighs in one line each. They are checkable
  // off the placements — that the upper eye stands where 太乙 stands is
  // something anyone can verify — and every one of them is 凶 in the text's
  // own words, which is why the fortune travels beside the name.
  'label.taiyipattern.yan': 'covering',
  'label.taiyipattern.ji': 'striking',
  'label.taiyipattern.po': 'pressing',
  'label.taiyipattern.qiu': 'imprisonment',
  'label.taiyipattern.guan': 'locking',
  'label.taiyipattern.ge': 'blocking',
  'label.taiyipattern.dui': 'facing',
  // What 卷三 says each condition **is**, glossing the clause the engine quotes
  // beside it. The chapter's omens — what will befall the realm — are not here
  // and are not glossed; see `PATTERNS` in `taiyi.ts` for the line between the
  // two kinds of sentence. 對 has no such clause and so has no gloss: the
  // chapter gives it a trigger and a list of events, and nothing that says what
  // it is.
  'label.taiyimeaning.yan': 'the sense of ambush and violent seizure',
  'label.taiyimeaning.ji':
    'what striking is: the inferior overstepping the superior — a minister over his ruler, the low over the honoured — and this is usurpation',
  'label.taiyimeaning.po':
    'pressing by palace, the harm slight and slow; pressing by branch, the harm urgent and swift',
  'label.taiyimeaning.qiu': 'imprisonment: the sense of usurpation and slaughter',
  'label.taiyimeaning.guan':
    'what the bar means: a matter of dread for the generals and the ministers, and it does not reach the ruler',
  'label.taiyimeaning.ge': 'it speaks of governance blocked between above and below',

  // 前 and 後 are ahead of and behind 太乙 on the ring; 辰 and 宮 are the two
  // distances 卷三 separates — 「宫迫災㣲緩，辰迫災急疾」.
  'label.taiyikind.qianchen': 'one seat ahead',
  'label.taiyikind.houchen': 'one seat behind',
  'label.taiyikind.qiangong': 'one palace ahead',
  'label.taiyikind.hougong': 'one palace behind',

  // 十二神 — the god a day stands under. 《協紀辨方書》卷七 derives them by
  // 天罡加建 after rejecting the two accounts it inherited. Six carry 吉 and
  // six 凶, which the same passage says is all 黃道/黑道 ever meant; what the
  // 神樞經 hangs on that is 宜忌 and is not here.
  'label.daygod.siming': 'the arbiter of fate',
  'label.daygod.gouchen': 'the hook array',
  'label.daygod.qinglong': 'the azure dragon',
  'label.daygod.mingtang': 'the hall of light',
  'label.daygod.tianxing': 'the celestial punishment',
  'label.daygod.zhuque': 'the vermilion bird',
  'label.daygod.jingui': 'the golden coffer',
  'label.daygod.tiande': 'the celestial virtue',
  'label.daygod.baihu': 'the white tiger',
  'label.daygod.yutang': 'the jade hall',
  'label.daygod.tianlao': 'the celestial prison',
  'label.daygod.xuanwu': 'the dark warrior',

  'label.yeargod.taisui': 'the year star',
  'label.yeargod.suipo': 'the year breaker',
  'label.yeargod.dajiangjun': 'the great general',
  'label.yeargod.taiyin': 'the great yin',
  'label.yeargod.huangfan': 'the yellow banner',
  'label.yeargod.baowei': 'the leopard tail',
  'label.yeargod.sangmen': 'the mourning gate',
  'label.yeargod.diaoke': 'the condoling guest',
  'label.yeargod.baihu': 'the white tiger',
  'label.yeargod.bingfu': 'the tally of sickness',
  'label.yeargod.sifu': 'the tally of death',
  'label.yeargod.dasha': 'the great killing',

  'label.yeargod.jiesha': 'the robbing killing',
  'label.yeargod.zaisha': 'the calamity killing',
  'label.yeargod.suisha': 'the year killing',

  'label.yeargod.dahao': 'the great wasting',
  'label.yeargod.xiaohao': 'the small wasting',
  'label.yeargod.suizhide': 'the branch virtue of the year',

  'label.yeargod.suide': 'the virtue of the year',
  'label.yeargod.suidehe': 'the virtue\'s companion',

  'label.yeargod.zoushu': 'the memorialist',
  'label.yeargod.boshi': 'the erudite',
  'label.yeargod.lishi': 'the strong man',
  'label.yeargod.canshi': 'the silkworm chamber',
  'label.yeargod.pobaiwugui': 'the five ghosts of ruin',

  'label.yeargod.jinshen': 'the metal spirit',

  'label.monthgod.tiande': 'the virtue of heaven',
  'label.monthgod.tiandehe': 'heaven\'s virtue joined',
  'label.monthgod.yuede': 'the virtue of the month',
  'label.monthgod.yuedehe': 'the month\'s virtue joined',


  'label.shensha.sanhe': 'the threefold union',
  'label.shensha.linri': 'the overbearing day',
  'label.shensha.liuhe': 'the sixfold union',
  'label.shensha.dashi': 'the great hour',
  'label.shensha.youhuo': 'the roving misfortune',
  'label.shensha.tiancang': 'the granary of heaven',
  'label.shensha.guiji': 'the return forbidden',
  'label.shensha.yinde': 'the hidden virtue',
  'label.shensha.yaoan': 'the needful ease',
  'label.shensha.jintang': 'the golden hall',
  'label.shensha.puhu': 'the general shelter',
  'label.shensha.shengxin': 'the heart of the sage',
  'label.shensha.xushi': 'the line continued',
  'label.shensha.yangde': 'the yang virtue',
  'label.shensha.tianma': 'the horse of heaven',
  'label.shensha.bingjin': 'arms forbidden',
  'label.shensha.tufu': 'the tally of the soil',
  'label.shensha.yuesha': 'the killing of the month',
  'label.shensha.dinang': 'the earth sack',
  'label.shensha.yuehai': 'the harm of the month',
  'label.shensha.tianli': 'the clerk of heaven',
  'label.shensha.sili': 'the four partings',
  'label.shensha.sijue': 'the four severings',
  'label.shensha.tianshe': 'the pardon of heaven',
  'label.shensha.sixiang': 'the four ministers',
  'label.shensha.jieshen': 'the loosener',
  'label.shensha.jiukong': 'the nine voids',
  'label.shensha.wuxu': 'the five emptinesses',
  'label.shensha.wuhe': 'the five unions',
  'label.shensha.wuli': 'the five partings',

  'label.keti.yuanshou': 'the head',
  'label.keti.zhongshen': 'the second hearing',
  'label.keti.zhiyi': 'knowing the one',
  'label.keti.shehai': 'wading the harm',
  'label.keti.haoshi': 'the reed arrow',
  'label.keti.tanshe': 'the pellet shot',
  'label.keti.hushi': "the tiger's gaze",
  'label.keti.dongshe': 'the winter snake, eyes covered',
  'label.keti.bieze': 'the separate charge',
  'label.keti.bazhuan': 'the eight concentrated',
  'label.keti.ziren': 'taking its own',
  'label.keti.zixin': 'trusting its own',
  'label.keti.duchuan': 'the blocked transmission',
  'label.keti.wuyi': 'without support',
  'label.keti.jinglan': 'the well railing',

  // What somebody is choosing a time for. These are not names of gates: they
  // are the errands the transmitted lists put under each one, phrased as the
  // thing a reader recognises as their own. "Open" says a door is open and
  // tells nobody which line to pick; this says which. Each line says what the
  // sources in `docs/sources.md` say and stops there — the modern manuals put
  // more under several of these gates, and the surplus is not shipped.
  'label.purpose.opening': 'Opening, travelling, an office or an official, trade',
  'label.purpose.meeting': 'Meeting somebody, marriage, asking a favour, resting',
  'label.purpose.wealth': 'Money, profit, seeing a thing grow',
  'label.purpose.documents': 'Documents, a proposal, an appointment, a banquet',
  'label.purpose.concealment': 'Keeping out of sight, avoiding, blocking a thing off',
  'label.purpose.pursuit': 'Recovering a debt, competing, going after somebody',
  'label.purpose.ending': 'A funeral, a burial, closing a thing',
  'label.purpose.dispute': 'Catching a thief, recovering what was stolen, alarm',

  'label.strength.wang': 'prospering',
  'label.strength.xiang': 'supported',
  'label.strength.xiu': 'resting',
  'label.strength.qiu': 'imprisoned',
  'label.strength.si': 'dying',

  'label.layer.gate': 'gates',
  'label.layer.star': 'stars',
  'label.layer.both': 'gates and stars',

  // The three methods carry their own names and the two errands do not, and
  // the line between them is what is being named rather than who is reading.
  //
  // Qi Men, Liu Ren and Ba Zi are methods, and a method is a Chinese thing:
  // its name is 奇門遁甲 and not a description of what it does, so it travels
  // romanised and untranslated the way a person's name does. «Four Pillars»
  // read as a translation of 八字 and was one — which left the section beside
  // two named neighbours as the only one wearing a gloss.
  //
  // The consultation and the choosing of a time are **acts**, not methods.
  // What is named there is something the reader does, and that is named in
  // the reader's own language, as everything they operate is.
  //
  // No tone marks here, unlike everywhere else a name is set: these are the
  // spaced, capitalised forms an English or Italian reader meets in print,
  // not the readings the engine carries beside its hanzi.
  'nav.chart': 'Qi Men',
  'nav.bazi': 'Ba Zi',
  'nav.liuren': 'Liu Ren',
  'nav.qizheng': 'Qi Zheng Si Yu',
  'nav.taiyi': 'Tai Yi',
  'nav.moments': 'Choosing a time',
  // Named by the act, which is the one this section is built around: a
  // question put at an instant, and the chart cast for that instant. It was
  // called "AI prompt" — named by the artefact — while it stood last in the
  // nav and had to say what it was for from four words. Leading the sections,
  // it is the classical use of the method and reads as one.
  //
  // Not "Reading" and not "Oracle": both would have this project claim the
  // one thing it declines to do, and the footer says on every page that it
  // does not. What comes out is a prompt, and `consult.lead` — the first line
  // of the page — says so before anybody types into it. That line carries the
  // word this label gave up.
  'nav.consult': 'Consultation',
  'nav.sections': 'Sections',

  // The section that walks Qi Men charts, named with the art it walks. The nav
  // label cannot carry it — a header says where things are, not what they are
  // made of — and this is where somebody reading results needs to know.
  // The 太乙 section. The title glosses the name the nav can only print, and
  // it is said to a tab and to a screen reader rather than set over the
  // board: the nav already says which section this is, as it does for every
  // other board here. The paragraph that stood under it — what this board is
  // a function of, and what it refuses to name — was a preface over a picture
  // somebody came to look at, and where that account belongs is the notes.
  'taiyi.title': 'Tai Yi — the board of a year',
  // On the bar under the board, which is the whole of the form: a 年計 board
  // is a function of the year and of nothing else.
  'form.year': 'Year',
  'form.copyTaiyi': 'Copy the board as text',

  'moments.title': 'Choosing a time — Qi Men',
  'moments.lead':
    'Every hour between two dates is cast as a Qi Men chart, and the ones answering what you name below are listed. Criteria, not recommendations: what makes an hour worth acting in is a reading, and it is yours.',

  'scheme.label': 'Appearance',
  'scheme.auto': 'automatic',
  'scheme.light': 'light',
  'scheme.dark': 'dark',
  'scheme.switch': 'Appearance: {current}. Switch to {next}.',

  'lang.en': 'English',
  'lang.it': 'Italian',
  'lang.switch': 'Read this page in {language}',

  'form.open': 'Change the moment',
  'form.close': 'Close',
  // The × beside the chosen place. Its face is a glyph, so the name a screen
  // reader speaks has to say what pressing it takes away.
  'form.placeRemove': 'Remove {place}',
  'form.legend': 'The moment and the place',

  // What a form offers has to be readable by whoever has to choose from it.
  // `zishi` and `midnight` are what the API takes and stay so; what the
  // reader sees says which hour that is, with the hanzi beside the words
  // because 子時 is a name and 23:00 is not a translation of it.
  'form.options': 'Options',
  // What is set behind a shut disclosure, said on the line that shuts it. A
  // count and not a list: the list is one press away, and what a reader needs
  // from the closed state is to know there is something in there.
  'form.optionsSet': 'Options changed: {count}',
  // The names of the groups the options are read in. A group of fields with
  // no name is a list, and a `legend` is what a screen reader says before
  // every field under it — which is how "Date" comes out as the date of a
  // birth rather than the date of the chart.
  'form.moment': 'The moment',
  'form.momentNote':
    'Leave them empty and the chart is cast for the instant you press, in the time of the place above — which is the classical use. Fill them in to put the question to another moment.',
  // The action, named by the state it restores and not by what it deletes:
  // empty means now, and this is the one press back to it.
  'form.momentNow': 'Back to now',
  'form.calculation': 'How it is computed',
  'form.trueSolarTime': 'Correct to true solar time',
  'form.dayBoundary': 'The day begins',
  'form.dayBoundary.zishi': 'at the hour of the Rat 子時, 23:00',
  'form.dayBoundary.midnight': 'at midnight, 00:00',
  'form.method': 'The ju is determined',
  'form.method.chaibu': 'by thirds of the term — chaibu 拆補',
  'form.method.zhirun': 'by whole blocks, with the leap — zhirun 置閏',
  'form.yuan': 'Under chaibu, the third of the term is counted',
  'form.yuan.term': 'from the instant the term began',
  'form.yuan.futou': 'from the day, by five-day stretches — futou 符頭',
  'form.gender': 'Sex — only the direction of the luck cycles depends on it',
  'form.gender.unset': 'not given',
  'form.gender.male': 'male',
  'form.gender.female': 'female',

  // The scan asks for an interval and for what to look for in it. The
  // criteria are named by what they are — a gate, a direction — and offered
  // as words, because they are what the reader chooses from. The engine's
  // identifiers stay in the address, where they belong.
  'form.interval': 'The interval and the place',
  'form.openInterval': 'Change the interval',
  'form.from': 'From',
  'form.to': 'Until',
  'form.looking': 'What to look for',
  'form.purpose': 'What are you choosing a time for?',
  'form.purposeNote':
    'Choosing one fills in the gate below, which you can then change. It is the association the tradition makes between an undertaking and a gate — the eight gates only, and nothing further: where the rest of that doctrine is concerned the schools disagree, and this takes no side.',
  'form.any': 'any',
  'form.towards': 'Facing',
  'form.minStrength': 'At least as strong as',
  'form.without': 'Ruling out',
  // 本命 — the year pillar of a birth, narrowing the palaces to the two it
  // stands on. A criterion like the others: it says which palaces are this
  // person's, never which hour is good.
  'form.benming': 'Whose year is to stand there',
  'form.benmingNote':
    'With a date of birth, only the palaces that person\'s year pillar (本命 běnmìng) stands on are reported — 《遁甲演義》 has a reading consider it before anything else. It narrows what is shown and weighs nothing: what makes a palace worth standing in is what you asked for above.',
  'form.criteriaNote':
    'These are arrangements, not recommendations. The engine reports where each one stands; whether it is a good hour to act is a reading, and it is yours to make.',
  'form.scan': 'Scan the interval',
  'form.scanned': '{runs} charts in the interval, {matched} of them with a palace that answers.',
  // A row of the scan answers with the board for that hour, shown beside the
  // list; the whole section — where the moment can be stepped and changed —
  // is one link further on. Arriving there from a scan leaves a way back,
  // because a scan is an interval somebody typed, not a page one lands on.
  // The board is square and a screen is not, so a drawing stacked above its
  // own captions is bounded by a reading measure while a third of the window
  // goes unused. Enlarging moves the words alongside it. The two below name a
  // control whose face is a drawing, so they stand alone rather than in a
  // sentence: they are what a screen reader announces and what a tooltip says.
  'form.enlarge': 'Enlarge',
  'form.reduce': 'Reduce',
  'form.showPlate': 'the board',
  'form.openChart': 'the whole board',
  // What is set aside is an hour *and a palace*: the same double hour can
  // hold an answer to the southeast worth keeping and one in the centre
  // worth nothing. Each box says which, because a checkbox in a table is
  // labelled by its column and by nothing a screen reader reads aloud.
  'form.keep': 'keep',
  'form.keepMoment': 'Keep {hour}, {palace}',
  // The shortlist gathers what the table would otherwise scatter over a
  // fortnight, and it outlives the scan: an hour set aside under one set of
  // criteria is still set aside under the next, where it may no longer be a
  // row at all. Which is why the strip stands above the answer and not in it.
  'form.kept': 'Set aside — {count}',
  'form.keptRemove': 'Take {hour}, {palace} off the list',
  'form.keptCopy': 'copy the list',
  'form.keptCopied': 'copied',
  'form.keptClear': 'empty it',
  'form.keptNote':
    'The list is in the address of this page: sharing the address shares it, and the dates and the place along with it.',

  // What the button says about its own state. A form still missing something
  // says what, in words: a button greyed out with no reason given is a dead
  // end, and a colour on its own is not a message — it is invisible to a
  // screen reader and to a good part of the people who can see it.
  'form.working': 'Working…',
  'form.needed.date': 'A date is still needed.',
  'form.needed.interval': 'Both dates of the interval are still needed.',
  'form.needed.question': 'A question is still needed: the prompt is built to be read towards one.',
  // The counterpart on a board of 命, and it says what an empty field would
  // otherwise quietly mean. Under the other two boards empty is the press and
  // the instant is now; here now is nobody's birth.
  'form.needed.birth':
    'A date of birth is still needed. This board is laid on one, and an empty date would be today.',
  // The counterpart under 天, and the field that turned this instrument from a
  // caption into a reading. Not a question: a question about a year is how a
  // reader gets written into a figure they are not in. A matter is what is
  // being *looked at*, and it is what says which side is 主 and which is 客.
  'form.needed.matter':
    'What you are looking at is still needed. Nobody is on this board and nothing is asked of it, so without a matter the reading can only describe the figure.',
  // The hour, and not only the day. A Qi Men chart turns on the hour pillar,
  // so a birth without a time is not a rougher chart — it is a different one.
  // The same thing `cli.error.genderRequired` says, without naming a command
  // line option to somebody looking at a form.
  'form.needed.gender':
    'The luck cycles need the sex, since the tradition takes their direction from it. Without it the pillars are still complete.',
  // The date stays operable with the fields closed, so it needs a name of its
  // own: beside the steps there is no label above it to say what it sets.
  'form.jumpDate': 'The day the chart is cast for',

  // The key to the drawing, which writes the five states as a ramp of marks
  // and nowhere says what they mean. The words for the states themselves are
  // `label.strength.*`; this is the line that says what they qualify — the
  // star and the gate, against the season, and nothing else in the palace.
  'form.strengthLegend': 'How the star and the gate stand to the season',

  // Taking a chart away: as words, and as a prompt for a model that will be
  // asked to read it. Two controls and not one, because they are two
  // different errands — the first is the chart in a form that can be pasted
  // into a notebook, the second is the chart plus everything somebody has to
  // be told before reading it, and offering only the second would make the
  // plain text unreachable to whoever wants nothing to do with a model.
  'form.copyChart': 'Copy the chart as text',
  'form.copyBoard': 'Copy the board as text',
  'form.copyPrompt': 'Copy the prompt',
  // The other way out of a cast chart, and the one that needs no account
  // anywhere: the sheet carries the question, the board, the four pillars and
  // the reading, and can be handed to somebody who reads charts.
  'form.print': 'Print',
  'form.copied': 'Copied',
  'form.copying': 'Preparing…',
  // The clipboard refuses outside a secure context, and this runs on local
  // networks in the clear. Some three thousand characters do not fit in an
  // error message, so they arrive in a box to be selected by hand.
  'form.copyFailed':
    'The clipboard would not take it — that happens outside an encrypted connection. The text is here: select it and copy it by hand.',
  'form.copyFallback': 'The text, to copy by hand',
  'form.copyUnread': 'The chart could not be read again.',

  // The section where a chart is posed in order to be taken away. Two errands
  // that do not overlap: a question asked now, and a chart of a birth read as
  // a chart of a life. Neither is the other, and a chart of a birth with a
  // question on it would be a third thing this project has already declined —
  // comparing a natal chart against the chart of a moment.
  'consult.title': 'Asking an AI to read a board',
  // The birth, offered beside the question rather than instead of it. What it
  // produces is a 年命: the chart stays the chart of the moment and the birth
  // is looked up inside it, which is what 《遁甲演義》 prescribes and the
  // reverse of a natal chart.
  'consult.birth': 'Your birth, if you want it in the chart',
  'consult.birthDate': 'Date of birth',
  'consult.birthGender': 'Sex — only the direction of the 行年 count depends on it',
  // Why the question is above the moment and not below the chart. The order
  // is the whole of it: the instant of asking is the instant that is cast.
  'consult.birthNote':
    'The chart is still cast for the instant you ask. What the birth adds is where it falls inside it — 本命 běnmìng, the year you were born in, and 行年 xíngnián, the year you are living.',
  // The page explains itself here and nowhere else, in one line: the nav says
  // which section this is, and the form says nothing about what comes out of
  // it. What was cut from here was the statement of the stance — that lives in
  // the footer, in the privacy note and in the notes — and not this, which is
  // the only thing a newcomer needs before they start typing.
  'consult.lead':
    'Ask a question, give a birth, or name a year, and get a prompt ready to paste into ChatGPT, Claude or another assistant.',
  'consult.cast': 'Put the question',
  // The press under a board of 命, where there is no question to put. It says
  // the act the way `consult.cast` does, and it is a different act: one is
  // asked at an instant, the other is laid on one.
  'consult.lay': 'Lay the board',
  // The whole of the form under an instrument of 天, which is one number.
  // No place and no hour enter this board: it is a function of the year, so
  // there is nothing else here to ask for and nothing to put under a
  // disclosure.
  'consult.year': 'The year the board is laid on',
  // Empty is the year being stood in, which is this kind's version of the
  // rule that empty is the press — and unlike a birth left empty, a year left
  // empty is somebody's answer rather than nobody's.
  'consult.yearNote': 'Leave it empty for the year we are in.',
  'consult.changeBirth': 'Change the birth',
  'consult.changeYear': 'Change the year',
  'consult.changeMatter': 'Change what you are looking at',
  // What reopening the panel offers, which is the question and not the
  // moment: a second consultation begins by rewriting the question, and
  // everything else in there is setup somebody set once. It is also the only
  // thing that names the panel — the fields label themselves and the first
  // line of the page says what they are for, so there is no heading over
  // them.
  'consult.change': 'Change the question',
  // Over the board, on the sheet somebody prints. The instant is the answer
  // to *which* board this is, and on paper it is the only answer there is.
  // The noun is gone from the words a consultation shows under both
  // instruments: `chart` is the nine palaces and would be wrong over a ring
  // of twelve, and the button says the act rather than the object.
  'consult.castAt': 'Laid for {when}',
  // The request itself failed, so there is no code to translate. Not
  // `form.copyUnread`: on a first press nothing was ever cast to read again.
  'consult.castFailed': 'The board could not be laid.',



  'form.promptPrivacy': 'What you entered goes into the prompt.',
  // Required, and said in the label rather than by a mark nobody can read
  // aloud. It is not a formality: the chart is read *towards* a question, and
  // a prompt built without one asks a model to read towards nothing.
  'form.question': 'Your question',
  'form.questionPlaceholder': 'What are you asking?',
  // Deliberately not «your question». What goes here is a field of view with
  // two parties in it, because that is what the board's two counts are counts
  // *of* — and the placeholder does the teaching, since «matter» alone would
  // be answered with a question by most people.
  //
  // The teaching is all in the placeholder, and a note under the field saying
  // the same three things again was taken out: it sat where nobody is looking
  // once they have started typing, and the field it explained is two lines long.
  'form.matter': 'What you are looking at this year',
  'form.matterPlaceholder': 'A situation with two sides — two organisations, two parties to a negotiation, two forces in one field',

  // The face of each step is the word, in the reader's language: these are
  // controls, and a control nobody can read is a control nobody can press.
  // Only 時辰 keeps its hanzi beside the word, because only it names
  // something Chinese — a day, a month and a year do not.
  'step.shichen': 'double hour',
  'step.day': 'day',
  'step.month': 'month',
  'step.year': 'year',
  'step.now': 'now',

  // What a screen reader says, and what the arrows would say if they could.
  'step.now.title': 'Back to the present moment',
  // The same button on a board whose whole subject is a year: there is no
  // instant to come back to there, and saying there is would promise a board
  // finer than the one being laid.
  'step.now.year': 'Back to the year being lived',
  'step.shichen.back': 'The previous double hour',
  'step.shichen.forward': 'The next double hour',
  'step.day.back': 'The day before',
  'step.day.forward': 'The day after',
  'step.month.back': 'The month before',
  'step.month.forward': 'The month after',
  'step.year.back': 'The year before',
  'step.year.forward': 'The year after',

  // The one line in the footer that is not about provenance. The calculations
  // are checked and the divination is not a science, and the second does not
  // inherit the standing of the first: what is exact here is where the Sun
  // was, never what follows from it for anybody.
  'footer.disclaimer':
    'This site exists only to offer food for thought and entertainment; in no case is it a substitute for professional advice on medical, legal, financial or other matters.',
  'footer.data': 'Astronomical data {ephemeris} · places {geonames} (CC BY 4.0)',
  'footer.licence': 'Source code under AGPL-3.0',
  'footer.privacy': 'Privacy',
  'footer.notes': 'Notes',

  // The section is empty on purpose, and what it is for is as open as what it
  // says: a note written against an engine that is still gaining boards falls
  // behind it, and misinforms exactly the reader who came here to check rather
  // than to read. Both are settled at the end of the project, in one writing,
  // rather than anticipated now and realigned at every change.
  // See PLAN.md § 4 phase 17.
  'notes.title': 'Section still being defined',

  'privacy.title': 'Privacy',
  'privacy.nothing':
    'Nothing you type is stored. Dates, times and places — including a date of birth, if you give one so that a chart can say where it falls — travel in the address of the page, are used to compute an answer, and are not written to any database or log kept by this site.',
  'privacy.address':
    'Because the parameters are in the address, a link to a chart carries a date, a time and a place with it. Share one only with someone you would tell those things to.',
  // The one thing on this site somebody types that is not a date or a place.
  'privacy.prompt':
    'The question you write for a prompt does not leave your browser. The server is told that a question exists, so that the prompt can end on the line that introduces one, and never what it is; the browser adds the sentence itself before putting the whole thing in your clipboard. This site talks to no AI and sends nothing to one — where you paste it afterwards is between you and whoever receives it.',
  'privacy.storage':
    'One thing is kept in your browser, and only if you ask for it: the appearance you chose, under the key {key}. Setting the appearance back to automatic deletes it.',
  'privacy.cookies': 'No cookies are set, and there is no analytics of any kind.',

  // The prompt: the only text in this project written to be obeyed by a
  // machine rather than read by a person.
  //
  // It exists because the alternative is worse. This project computes a chart
  // and refuses to read it, and somebody who wants a reading takes the date
  // to a model that casts the chart from memory and gets it wrong. So the
  // chart travels already computed — and with it everything the reader of it
  // has to be told, which is the same thing `docs/agent-prompt.md` tells an
  // agent holding the same data over MCP. Handing over the chart without the
  // conditions attached would be this project outsourcing in a sentence what
  // it declines to do in code.
  'prompt.heading': 'Reading a Qi Men Dun Jia chart',
  'prompt.role':
    'A chart is set out below. It was computed by an ephemeris, not by you: read it exactly as it stands, and add nothing to it. No palace, no gate, no star, no configuration that is not written there. If something you need is missing, say it is missing.',
  'prompt.language': 'Answer in English.',
  'prompt.yongshen':
    'Which palace bears on the question is the 用神 yòngshén, and it is chosen by the reader for the question asked. Nothing below chooses it, and the software that produced this does not know the question. Say which palace you are reading, and why that one.',
  // A question arrives short — *will it go well* — and a palace cannot be
  // chosen from it. The reader's job is to ask, not to guess and not to give
  // a reading of whatever the sentence happened to suggest.
  //
  // And asking has to stop the turn, or it is not asking. A model that puts
  // its questions at the top and a reading underneath has read on partial
  // information and made the questions decorative: nobody unreads the reading
  // to answer them.
  'prompt.tooLittle':
    'If what you have been told does not let you make that choice, ask before you read — and then stop, with the questions in place of the reading and never alongside it. One or two of them, whichever would actually change the reading, and not a questionnaire. Do not put a reading under them, or a provisional one, or a first impression to be revised once they are answered: whatever you write will be read as the reading, and it will have been given without the answers you just said you needed. Wait for them.',
  'prompt.whatToAsk':
    'What is worth asking for is what the question leaves open: what the matter is really about, whom it concerns and whether that is the person asking, whether it is already under way or not yet begun, whether a place or a direction is part of it, and by when they need to know. What cannot be asked for is more board — nothing missing from what is set out below can be got by conversation, and no answer moves anything on it. If the person answers that they cannot say or would rather not, read then what can be read and name what you are missing instead of filling it in — that is what their answer licenses, and only their answer.',
  'prompt.noScore':
    'Do not count 吉 jí against 凶 xiōng and call the result a score for the hour. That arithmetic is not in the tradition and the chart does not license it. Do not rank the palaces, and do not rank the hours.',
  'prompt.noAdvice':
    'A palace marked 凶 xiōng does not mean "avoid this time". A fortune is a property of the arrangement — 門迫 ménpò is oppression, and the sources name it and weigh it in one breath — and not a verdict about the person, the day, or the undertaking.',
  'prompt.yours':
    'The reading is yours, and it must be given as yours. What the software did was lay out the plates and name what it found; everything past that is you, and the person asking is entitled to know which is which.',
  // The reading rule of the whole project, said to the one surface that
  // could break it: a glyph alone is, to the reader this is written for, a
  // shape with no sound — unsayable, unsearchable, unaskable. The transcript
  // hands every name over with its reading; the answer must not drop it.
  'prompt.names':
    'Every name is given below in Chinese, in pinyin and glossed. Write for someone who does not read Chinese: lead with the gloss. Wherever you write hanzi, write the pinyin immediately beside it — the open gate 開門 kāimén, and never the glyphs on their own — every time they appear and not only the first, and with the tone marks the transcript gives you. If you would rather not repeat the reading, drop the hanzi too and use the gloss alone; what may never travel is a glyph a reader cannot say.',
  // Carried into the reading rather than left on the page it was copied
  // from: the prompt travels, and this is the part that has to travel with
  // it. The instruction is to *say* it — a disclaimer the reader never sees
  // is a disclaimer that was written for somebody else.
  //
  // Fixed words, first, once. Told to say it in its own words, a model writes
  // the disclaimer *about* the question — naming the person, ruling on what
  // the chart cannot establish about them — and that is a reading wearing a
  // caveat's clothes, arriving where nothing licenses it.
  //
  // First rather than last, and it is the once that the position buys: an
  // opening line is either there or it is not, and the model can see in the
  // conversation whether it already said it. A closing line has no such
  // test, so it comes back under every answer until nobody reads it.
  'prompt.disclaimer':
    'Open your first reply with this line, before anything else you write: "Take this as food for thought and entertainment, not as a source of absolute truths. In no case is this reading a substitute for professional advice on medical, legal, financial or other matters. Free will is a precious instrument and is to be cultivated deliberately: the power over your choices and your path is always yours." Those words and no others. Do not fit it to the question, do not name the person or the matter inside it, do not add to it and do not explain it. Then never again: it opens the conversation and it stands for all of it. Every later reply begins with the answer and carries no notice at the top or the bottom — not a reminder, not a shortened version, not a sentence that does its job in other words. If the line is already somewhere in this conversation, you have said it: go straight to the answer.',
  // 年命 — a birth placed inside a chart of a moment, which is the classical
  // direction and the one thing that had to be said around it. The natal
  // frame this replaced could offer a warning and nothing else; this can
  // offer where two pairs fell, and still refuse the mapping.
  'prompt.nianming':
    'The transcript carries a 年命 niánmìng: the year pillar of the person asking (本命 běnmìng) and, where it was given, the year they are living (行年 xíngnián), each looked up inside this chart. **It is who is asking, and not a second reading.** Do not give it a section of its own, and do not list its palace, star, gate, spirit and image back to the reader — the tables above already say all of that. Use it where it bears on the question: where the person stands in relation to the palace you chose for the matter, whether the two are the same palace, whether one generates or controls the other, whether the person stands in the palace the matter has to pass through. That relation is what the pair adds; everything else about it is already on the board. 遁甲演義 dùnjiǎ yǎnyì, the treatise this comes from, has a reading weigh 本命 and 行年 before anything else and looks for the person\'s year to ride a palace where a good star and a good gate stand in strength — that is the tradition\'s criterion, said as theirs, and it is a thing to weigh and not a score to compute. This is not a chart of a birth and no life is to be read from it: nothing here says which palace stands for which part of a life, and none is implied — that mapping is where the schools diverge most and where most of what circulates is one lineage\'s teaching material. If you go further, say plainly that the step is yours.',
  // The other 式, and its own conditions. The instructions it shares with the
  // chart — the language, asking before reading, what may be asked for, whose
  // the reading is, the names, the disclaimer — are the same keys; what is
  // below is what differs, and it differs because the boards differ.
  'prompt.liuren.heading': 'Reading a Da Liu Ren board',
  'prompt.liuren.role':
    'A Da Liu Ren board is set out below. It was computed by an ephemeris and by the rules of the method, not by you: read it exactly as it stands, and add nothing to it. No branch, no general, no course, no transmission that is not written there. If something you need is missing, say it is missing.',
  // The one thing a model gets wrong here by being helpful. It knows enough
  // about 六壬 to try to derive the transmissions, and a board derived wrongly
  // and read well is the failure nothing downstream can catch.
  'prompt.liuren.drawn':
    'The three transmissions 三傳 sānchuán were drawn by procedure — the nine rules 九宗門 jiǔzōngmén, applied in their stated order to the four courses — and the rule that drew them is named in the transcript. Do not re-derive them, do not reorder them, and do not substitute a rule you would have applied instead. They are data, exactly as the plate is.',
  'prompt.liuren.yongshen':
    'That the transmissions arrive drawn does not mean the board has read itself. Which of the four courses 四課 sìkè bears on what was asked is the reader\'s choice, and the software that produced this does not know the question. The first two courses stand on the day stem, which is the person asking; the third and fourth stand on the day branch, which is the matter or the other party. Say which you are reading from, and why that one.',
  'prompt.liuren.noScore':
    'Do not weigh the twelve generals against one another and call the result a verdict on the hour. Do not rank the three transmissions — they are a beginning, a middle and an end, in that order because the procedure produced them in it, and not a first, second and third place. Do not rank the hours.',
  // The 課體 are `Pattern` by another name, and the same rule governs them.
  'prompt.liuren.keti':
    'The named course 課體 kètǐ — 元首 yuánshǒu, 重審 zhòngshěn, 涉害 shèhài and the rest — is a name for the shape the board fell into, in the way a configuration of the nine palaces is. It is not a verdict on the matter and not a fortune for the person. Where the transcript gives a name, report it as a name.',
  'prompt.liuren.unverified':
    'This board was drawn by 返吟 fǎnyín, the one rule here no independent implementation covers. It is not unchecked: 《六壬大全》 names every day this rule can draw a board on and every opening it gives, and this engine returns those and no others. Weigh it as a rule checked against a text rather than against something that runs.',
  'prompt.liuren.board': 'The board',
  'prompt.liuren.noQuestion':
    'No question was asked. Describe how the board stands — what the plate turned, what the four courses hold, which rule drew the transmissions and what they are — and stop there. Do not choose a course, do not read a fortune for anybody, and do not advise.',
  // The boards of 命, and what parts sideways from the two above. A board of
  // 卜 is cast for a question and ends on the line that introduces one; these
  // are laid on a birth, nothing is asked of them, and the prompt ends on how
  // the reading is to be written instead. See `PLAN.md` § 4 phases 18 and 19.
  // The subject of the reading, said first. Everything under it is a bound or
  // a place to look, and a list of bounds with nothing above it reads as an
  // instruction to withhold.
  'prompt.ming.configuration':
    'A reading is not the transcript said again in sentences, and its subject is not the pillars: it is the person they were laid on. Start from who they are — how this arrangement inclines them to feel, what they need in order to stand in the world, how they defend themselves when exposed, what they desire and what they fear to desire, where they look for a sense that exceeds them — and let what is printed below arrive as evidence, after the sentence it supports. The meanings are transmitted: the sources say what it is to meet a given god in a given pillar, for a branch to be void, for two bodies to gather in one palace, and reading them onto this person is the reading. Where you take a step this transcript does not carry — a school\'s method, a meaning not printed here — say that you are taking it and whose it is. **A chart wants nothing**: the one who wants is the person it was laid on.',
  // The shape of the reply, said before it is asked for: five steps in order,
  // because a model that has read every rule below still has not been told
  // what a reading looks like.
  'prompt.ming.noQuestion':
    'No question was asked, and none is needed: this is laid on a birth and it stands as it stands. So read it. And read it for the person who came here to find out what it says of them, not for a colleague checking your work — they have never seen one of these and they are the reason it was computed. Your reply goes in this order: the opening line, then a sentence or two situating the birth, then the whole read from its centre, then short sections on the themes of a life, then what could be looked at next.',
  // The whole before the parts, and a centre before either.
  'prompt.ming.panorama':
    'Then read the board whole, before any part of it. **The order the rules above walk it in is the order you look, not the order you write.** Copied into the reply it gives a manual — correct, dead, an inventory of positions nobody recognises. Write from a centre instead: find the two or three forces this arrangement is organised around, and the main tension between them. That is what the reading is about, and everything else stands around it as evidence. The data supports what you say rather than opening the paragraphs — not "this part holds that one, therefore a tendency to X", but the sentence that says what pulls against what, with the part of the board that shows it arriving after it and in the same breath. What is plentiful and what is missing belongs here, since an absence weighs as much as an abundance. Which forces you take as central is your choice and there is no way for it not to be: say that you chose, and say what you passed over. Prose, not a list. This is the part on which a reader decides whether any of this is for them.',
  // The themes, commissioned by name. Titles name a theme of a life and never
  // a factor, because a reader recognises a life and does not recognise a god
  // — and every theme closes on the same two guards: the claim stands on the
  // board, and a choice is said as it is made.
  'prompt.ming.sections':
    'Then the themes, in short sections, each under a title that names a theme of the life and never a factor — "The mind and the heart", not a god and not a palace — with continuous prose inside. What to traverse: the temperament — what is already mature in this arrangement and what stands in it as a promise not yet spent; the forces in conflict, and what a composition of them would look like; the work on oneself the arrangement points to — a movement, never an assigned destiny and never a debt to pay; the undertakings there is affinity toward — functions, not professions: "mediating between parties", "making the technical plain", with trades at most as examples of a function, promising success nowhere and closing no road; and the ties — how this person tends to bond, to need and to quarrel, what they tend to ask for and tend not to say, with something practicable offered on what depends on them, no partner judged and no compatibility settled, since the other chart is not here. Each claim stands on a part of the board and names it as it is used; where a theme leans on a seat, a god or an element the choosing of which is yours, say which you chose.',
  // The most useful rule here: a rule kept by being obeyed is a rule that
  // never has to be announced. Every «how sure» line in this project is under
  // it, and `prompt.ming.time`, `prompt.qizheng.direction` and
  // `prompt.qizheng.frame` each say it again for themselves because each was,
  // on its own, being recited as an opening section.
  'prompt.ming.rulesStayOut':
    'The rules you are reading now do not go into the reading. Do not open by declaring that you did not compute the board, that the language is symbolic, that you will not predict anything or that a choice will be yours: you keep those by writing, not by announcing them. **A bound is named where it bites and at the point where it bites** — the birth time where the time is doing work, how sure a quantity is where you are leaning on it, a choice as you make it. The one exception is the opening line, which stands above everything.',
  // What to do with a 剋, where the rest of this prompt only says what not to.
  // A relation of control is the commonest thing on either board and the
  // easiest to hand back as a defect — which is a verdict, arriving as a
  // diagnosis rather than as a forecast and slipping past every rule aimed at
  // forecasts.
  'prompt.ming.tension':
    'Where two things in the arrangement pull against one another, that is not a fault in it. They are two demands the tradition takes as equally real, obstructing each other: name both with the same respect, say what a composition of them would look like, and never suggest giving one up. The tension is what an arrangement runs on and not what is wrong with it. The same holds of a single force, which has two faces and not one — what a tradition reads as steadiness it reads as rigidity at a different pressure, and the honest sentence says under what conditions the one becomes the other instead of picking the flattering half.',
  // The register: warm, descriptive, and never deterministic.
  'prompt.ming.register':
    'Write to be thought with. The reader is not a practitioner and has asked no technical question: address them, keep the sentences short enough to follow, and offer what you find as something to weigh rather than as a finding to accept. Depth without oracle: no initiatic tone, no solemn capitals, no diagnosis, and nothing that does the work of the professions the opening line names. Symbolic and descriptive, never deterministic — "tends to", "shows up as", never "you will be" or "this will happen to you": an arrangement describes material to work with, not a sentence passed. Warm and never flattering — a reading that pleases has usually started guessing — and where suffering or a dynamic of control shows, name it without dramatising it.',
  // Ends by opening, because the reader who has something to ask is the reader
  // this was built for.
  'prompt.ming.invite':
    'End by opening rather than by closing. Say briefly what could be looked at next and what you would need to be told in order to look at it — a part of the board you set aside, a choice you flagged as yours, a seat or an element you declined to settle. Do not ask for their date, time or place: you have those. Do not put questions in place of the reading, and do not ask more than two. This is an invitation, not a form.',
  'prompt.ming.noRecital':
    'The reader has the transcript. Do not give it back to them. No table written out again as sentences, no roll of every row in it, no heading per column — everything inside the fence is already said, and repeating it spends the reading on the one part that needed no reader. Name something from it when it bears on what you are saying, and then say what it bears on.',
  // «The interface is read by someone who does not read Chinese, and it must
  // be usable by them without a glossary» — the rule the pages are held to and
  // the prompt never was. `prompt.names` gets the glyph said; nothing until
  // now got the *thing* explained.
  'prompt.ming.explain':
    'Write for somebody who has never seen this system. The transcript is a technical instrument and your reply is not: the first time a term out of the transcript appears in your reply, say in a clause what kind of thing it is, and then use it. Not a glossary at the top and not a digression: the clause that lets the next sentence land. A reply that assumes the vocabulary can only be read by somebody who did not need it.',
  'prompt.ming.time':
    'Everything below was computed from the birth exactly as it was given, and the time of day is load-bearing: the tradition divides the day into twelve 時辰 shíchén of two hours each, and a birth on the far side of a boundary produces a different board. Near midnight the day itself can move. **Raise this only where there is something to raise.** If you were told the time is approximate, reconstructed or rounded to the hour, say so at the point it bites and name what it unsettles. If you were not told that, say nothing about it at all — an opening paragraph establishing that the time is fine is a paragraph nobody needed, and it teaches the reader that a reading begins with caveats.',
  // What a reading may offer and what it may not, in one key: the phases are
  // cycle words and not sentences, the practicable is allowed where it rests
  // on the reader, and the professions the disclaimer names stay out.
  'prompt.ming.limits':
    'A name the tradition gives a phase — 死 sǐ, 囚 qiú, 絕 jué — is its word for a stage in a cycle, in the way winter is a word for a stage in a year, and not a sentence passed on a life. Where a source\'s own verdict is printed, report it as that source\'s and say whose it is. What may be offered is practicable and rests on what depends on the person reading; what may not be offered at all: predictions with dates on them, medical, psychiatric, legal or financial counsel, lucky days or numbers, and any pronouncement on games of chance. If asked whether any of this is true, answer honestly: it has no scientific standing — the computation is astronomically exact, and the reading is a symbolic language.',
  'prompt.qizheng.heading': 'Reading a Qi Zheng Si Yu board',
  'prompt.qizheng.role':
    'A Qi Zheng Si Yu board is set out below: the seven governors, the remainders, and the twelve palaces of the ecliptic with the lodges the bodies fell in. It was computed from an ephemeris, not by you: read it exactly as it stands, and add nothing to it. No body, no lodge, no degree, no palace that is not written there. **It is not a Western horoscope and its parts are not the parts of one** — do not import aspects, orbs, rulerships, or a house system, and do not translate it into one to read it. If something you need is missing, say it is missing. **Adding nothing is about the board and not about the reading**: invent no body and no position, and then say what the positions are.',
  // The twelve seats, read by their transmitted names — with the choosing of
  // which carries which theme said rather than smuggled.
  'prompt.qizheng.houses':
    'The twelve 人事宮 rénshìgōng are printed against the palaces they fell on, and each name says what the tradition reads at that seat — the person at 命宮 mìnggōng, means at 財帛宮 cáibógōng, undertaking at 官祿宮 guānlùgōng, and so on through the twelve. Read from them by their names. The software chose nothing beyond the names: which seat carries which part of what you write is your choice, and a choice reads better said than smuggled — where a theme leans on a seat, say which.',
  'prompt.qizheng.remainders':
    'The 四餘 sìyú are four and three are printed. 羅睺 luóhóu stands at the descending node, 計都 jìdū at the ascending and 月孛 yuèbèi at the lunar apogee — the law the 星命家 xīngmìngjiā kept, and the reverse of what anyone reasoning from Rahu and Ketu would set. 紫氣 zǐqì is absent: a rule for it survives, but there is nothing in the sky to check that rule against, so it is left out rather than guessed at. Do not supply it. All three that are printed are mean elements and are 隱曜 yǐnyào, shadow bodies — a mean motion is what every text naming them was describing.',
  'prompt.qizheng.noScore':
    'Do not count benefic bodies against malefic ones and call the result a score for the life. Do not rank the palaces and do not rank the bodies. 順 shùn and 逆 nì are the direction a body is moving, which is a fact about the sky and not a mark for or against anything.',
  // The two "how sure" lines, said among the rules rather than left in a
  // document: this board's weakest quantity and its unverifiable frame are
  // both things a model will otherwise recite as fact.
  'prompt.qizheng.direction':
    'How the twelve seats are numbered rests on weaker ground than anything else here, and you should say so if you use them. No consulted source states which direction the counting runs in terms another could be held against. It is carried on one source and three derivations: that the twelve are the Hellenistic houses in the Hellenistic order, that they are not 紫微斗數 zǐwēidǒushù\'s twelve, that only one direction puts 田宅 tiánzhái where the sky is deepest and 官祿 guānlù where it is highest, and that the separately transmitted 運限 yùnxiàn walk the other way. That is an argument, not a reference implementation. Say it where you use the seats and not before you begin: it is a bound on a quantity, and a bound recited as an opening section is a preamble the reader skips.',
  'prompt.qizheng.frame':
    'Which 宿 xiù a body is in, and at what degree, is measured from the determinative stars 距星 jùxīng themselves, placed at the instant of this board. No 曆 lì\'s table is copied and no epoch is assumed, which is what makes the frame right in the eleventh century and the twenty-third alike — and it also means there is nothing published to check it against. It stands on over-determination: twenty-eight widths each with a transmitted shape, a ring that must close on 360°, and 觜 zī as a one-degree needle only the right pair of stars threads. Weigh it as that, and not as a table somebody printed — and weigh it where a degree is doing work in what you write, not in a section of its own before the reading starts.',
  'prompt.qizheng.board': 'The board',
  // In the model's own words, situating and nothing else: the frame a reading
  // needs is where and when, and anything more is preamble.
  'prompt.qizheng.opening':
    'Then situate the birth, in a sentence or two of your own: what is in front of them — a birth written in the sky, the sun, the moon, the five planets and three shadow bodies against the twenty-eight 宿 xiù the Chinese sky is cut into — and when it was laid. Situate and move on: no paragraph on what the art is, what fate is, or what you are about to do.',
  // The inspection list. What a body in a given 宿 means is not printed here
  // and is not in this engine, so drawing on a tradition for it is a step
  // that travels named.
  'prompt.qizheng.read':
    'Where to look for all of that — the order you look, never the order you write: where the bodies gathered and where the sky is empty, which of them stand on the palace the 命宮 mìnggōng fell on, which seats a gathering landed in, whether anything moves 逆 nì against the rest, how far into its 宿 xiù each body stands. What a body in a given place means is not printed here and this engine ships none of it: where a theme draws on a tradition for a meaning, name what you are drawing on and whose teaching it is.',
  'prompt.bazi.heading': 'Reading a Ba Zi chart',
  'prompt.bazi.role':
    'The four pillars of a birth are set out below, with what is read off them: the day master, the void branches, the god of each pillar, the stems concealed in each branch, and the stage each pillar stands at. They were computed from an ephemeris and a calendar, not by you: read them exactly as they stand and add nothing. No pillar, no god, no hidden stem, no cycle that is not written there. If something you need is missing, say it is missing. **Adding nothing is about the pillars and not about the reading**: invent no pillar and no god, and then say what the ones that are there are.',
  // The favourable element is still not computed: the schools divide on how
  // it is chosen, and this engine does not choose. What changed is the verb —
  // the choice is commissioned rather than tolerated, and it travels signed.
  'prompt.bazi.yongshen':
    'What is **not** below is the favourable element — 用神 yòngshén, 喜用神 xǐyòngshén — and no structure 格局 géjú is named either: the schools divide on how they are chosen, and this engine does not choose. The choice is yours to make, and where a theme needs it — how what is missing is compensated is this choice under another name — make it: say which element you take, why, and by whose method, as a step of yours and not as something the pillars handed you.',
  'prompt.bazi.gods':
    'The ten gods 十神 shíshén printed against each pillar name a **relation to the day master**: 正官 zhèngguān is the stem that controls it in the opposite polarity, 食神 shíshén the one it produces in the same. The tradition also reads each of them toward the matters of a life, and those readings are a school\'s rather than this transcript\'s: where a theme leans on one, bring the meaning as a teaching you are naming — say whose — and not as something printed here.',
  'prompt.bazi.stages':
    'The stage 十二長生 shí\'èrchángshēng against each pillar — 長生 chángshēng, 帝旺 dìwàng, 死 sǐ, 墓 mù and the rest — is a position in a twelve-part cycle, named after the phases of a life because that is the metaphor the cycle was built on. It is not a statement about the person\'s life, their health, or its length. 旺 wàng is not good news and 死 sǐ is not bad news.',
  'prompt.bazi.luck':
    'The decade cycles 大運 dàyùn are the sequence of pillars the life walks into and the age each begins at, computed from the month pillar and the direction the count runs. They are a timeline **of pillars** and not a timeline of events: read them as direction — which element a decade brings and how it stands to what the pillars already carry, a movement to work with and never a timetable. Do not date events to them — not an illness, not a marriage, not a windfall, not a loss — and promise no decade to anybody as the good one or the bad one.',
  // The count is printed, so the one thing left to forbid is redoing it — and
  // the step past it, strong or weak, is still a method's step and travels
  // signed.
  'prompt.bazi.distribution':
    'The count of the five elements below is over the eight characters themselves — each stem by its element, each branch by its own. It is arithmetic already done: do not recount it, and do not weigh it into a score. It is the ground of the whole — what abounds and what is missing, an absence weighing as much as an abundance — and how an absence is compensated is the favourable element again by another name: a choice, made and signed as the rule above says.',
  'prompt.bazi.noScore':
    'Do not rank the pillars and do not rank the decades. Declaring the day master strong or weak from the count is a step in several methods, and the methods disagree — if you take it, say that you are taking it and whose method it is.',
  'prompt.bazi.board': 'The four pillars',
  // In the model's own words, situating and nothing else: the frame a reading
  // needs is where and when, and anything more is preamble.
  'prompt.bazi.opening':
    'Then situate the birth, in a sentence or two of your own: what is in front of them — a birth written in a calendar, its year, its month, its day and its hour as eight characters 八字 bāzì — and when it was laid. Situate and move on: no paragraph on what the art is, what fate is, or what you are about to do.',
  // The inspection list, working outward from the day master.
  'prompt.bazi.read':
    'Where to look for all of that — the order you look, never the order you write: work outward from the day master; which of the ten gods stand in the four pillars and which are nowhere in them; what the branches conceal against what the stems show; which branches are void and whether anything of the birth falls in one; where the day master finds itself in the cycle of twelve at each pillar; the four images 納音 nàyīn; the count of the five elements; and the decades, where they are printed, as the direction the pillars walk. Say what the tradition holds each thing you use to be, and use it where it carries a theme.',
  // 太乙 — the one board here whose subject is neither a question nor a
  // person, and the one prompt whose register had to be designed rather than
  // adapted. Phase 20 shipped the board without one on exactly that ground.
  // What settles it is that the reading is **descriptive and never
  // predictive**: the subject is the figure of a year, and the received
  // doctrine — which state falls, which year an army breaks — stays out.
  'prompt.taiyi.heading': 'Reading a Tai Yi board',
  'prompt.taiyi.role':
    'A 太乙神數 tàiyǐshénshù board is set out below, in the register of the year — 年計 niánjì. It places 太乙 tàiyǐ itself, which walks eight palaces and never the centre; the two eyes, 文昌 wénchāng below and 始擊 shǐjī above; 計神 jìshén and 合神 héshén; the two counts and the generals they seat; the gate on duty; and the longer circuits. It was computed from the 太乙金鏡式經 tàiyǐ jīnjìngshìjīng (王希明 Wáng Xīmíng, 唐 Táng, c. 730), not by you: read it exactly as it stands and add nothing. No position, no count, no condition that is not written there. If something you need is missing, say it is missing.',
  // The subject first, as it is first under both boards of 命: a list of
  // bounds with nothing above it reads as an instruction to say nothing.
  'prompt.taiyi.subject':
    'What is in front of you is **a year**, not a person and not a question. 太乙主天 tàiyǐ zhǔ tiān: this board is laid on the year the world is standing in, and nobody\'s birth, hour or place went into it — it is a pure function of a number. So there is no querent here and no native. Read the figure: say how this year stands, what it is organised around, where it is even and where it is under strain. The meanings are transmitted, and the sources say what it is for 太乙 to stand in a given palace, for an eye to fall where it falls, for a count to be a given number. Reading those onto this year is the reading.',
  // The 用神 rule, arriving on the board that needs it most. The engine
  // assigns neither party and will not; the model does, and says so.
  'prompt.taiyi.hostguest':
    'Who is 主 zhǔ, the host, and who is 客 kè, the guest, is **not** below and never will be: identifying the two parties is the first interpretive act this system asks for, and it is chosen **for the matter being looked at**, exactly as a 用神 yòngshén is chosen for a question. The software that produced this does not know the matter — it is at the end of this message, written by the reader and never sent to any server — so it names two counts and stops. The choice is yours to make and you must make it before the counts mean anything: say which side of the matter you are taking as host and which as guest, why that way round, and read 主算 zhǔsuàn and 客算 kèsuàn accordingly. Say it as a step of yours, not as something the board handed you, and say what the reading would look like the other way round if the assignment is a close call. Where the matter names no two parties at all, say so and ask for them rather than inventing a pair: an assignment made up to have one is the whole reading resting on nothing.',
  // The same rule where no matter was given — which the CLI and the endpoint
  // still allow, and which is the honest «just the figure» reading. The
  // difference is one clause and it matters: the version above points at a
  // matter at the end of the message, and pointing at something that is not
  // there is exactly the defect this pair was split to fix.
  'prompt.taiyi.hostguestNoMatter':
    'Who is 主 zhǔ, the host, and who is 客 kè, the guest, is **not** below and never will be: identifying the two parties is the first interpretive act this system asks for, and it is chosen for the matter being looked at, exactly as a 用神 yòngshén is chosen for a question. **No matter was given here**, so there is nothing to choose it for: do not invent a pair in order to have one. Read the two counts as two quantities of one configuration, say plainly that the assignment is the reader\'s and has not been made, and say what each way round would mean for the figure. 主算 zhǔsuàn and 客算 kèsuàn are numbers from a counting procedure either way.',
  // The matter, which is what turned this prompt from a caption into a reading.
  // It is **not** a question and the difference is load-bearing: a question
  // asks what will happen and puts the person asking inside a figure they are
  // not in, which is what `notPersonal` refuses. A matter is a field of view —
  // two parties, a situation, a domain — and it is what the assignment above
  // has to be made *for*. Without one the reading has a subject only in the
  // sense that a map has a subject.
  'prompt.taiyi.matter':
    'What the reader is looking at this year is at the end of this message, and the whole reading is **for that**. It is not a question and must not be answered as one: do not say what will happen in it, do not date anything in it, do not say who prevails. It is the frame that makes the figure readable — it tells you which two parties the counts are about, and which parts of the board bear on what. Read the year through it: where the matter meets a dense palace, a condition, an asymmetry of counts, say what the configuration *is* at that point and let the reader take it from there. If the matter is thin — a word, a field with no parties in it — say what you can and ask for what you need, rather than reading whatever the word suggested.',
  // Required of every surface that prints this board, and it earns its place
  // among the instructions rather than beside them: the rules above and below
  // tell a model how to read positions it would otherwise read one seat out.
  'prompt.taiyi.palaces':
    'The nine palaces of this board are **not numbered as a Qi Men chart numbers them**. 卷二 juàn èr says 九宮皆差一位 jiǔgōng jiē chā yī wèi — every number has moved one seat so that 一 yī reaches 乾 qián — so 一宮 yīgōng is the north-west here and the north there, and all eight are one seat off the 洛書 luòshū. Read the numbers as this board\'s own. If you know the Luoshu arrangement, do not carry it across, and do not "correct" anything below to it.',
  'prompt.taiyi.counts':
    '主算 zhǔsuàn and 客算 kèsuàn are the output of a counting procedure — seats told off around the ring from the two eyes — and not scores of good and bad. A larger count is not a better one. Do not add them, do not subtract one from the other and call the difference an outcome, and do not rank the palaces or the sixteen seats. What the counts do carry is the named conditions below, which is where the sources put the weight.',
  'prompt.taiyi.conditions':
    'The conditions named below — 掩 yǎn, 迫 pò, 囚 qiú, 擊 jī, 關 guān, 格 gé, 對 duì — are attributes of the configuration in the words of 卷三 juàn sān, each with the fortune that chapter gives it. They belong to the figure and not to anybody\'s situation, and the fortune is the source\'s and not a verdict of yours. **Each is printed with the chapter\'s own sentence saying what it is** — read that, use it, and leave it there. What the chapter also says will *befall the realm* when a condition falls is not printed, deliberately: it is the dynastic layer, and its absence is not an invitation to reconstruct it.',
  // The load-bearing refusal, and the reason this board waited for a designed
  // register rather than an adapted one.
  'prompt.taiyi.noDoctrine':
    'The received readings of this board are **dynastic** — which state falls, which year an army breaks, which reign changes hands — and they are not here and must not be supplied. Do not predict events, and do not date anything: no war, no election, no epidemic, no famine, no market, no disaster, no fate of any country, company or public person. An epochal reading is falsifiable by nobody and travels as commentary on real events, which makes it the most dangerous thing this board could be turned into. Describe the configuration; say nothing about what will happen in it.',
  'prompt.taiyi.notPersonal':
    'And it is not the reader\'s year. Nothing on this board is about the person reading it — they are not in it, no seat here stands for a part of their life, and there is no place to put them. Do not turn it into a forecast for them, do not tell them what the year holds for their work, their health, their money or their relations, and do not offer it as a personal chart under another name. If they want a board laid on themselves, that is a different instrument. **This holds when the matter they named is their own**, which it often will be — «the company I work for», «the town I live in». Read the matter, never the person inside it: the figure describes how the year stands around a thing, and the reader standing in that thing does not put them on the board.',
  // A sibling of `prompt.ming.register` rather than a reuse: that one is
  // written at a person throughout, and there is no person here.
  'prompt.taiyi.register':
    'Write to be thought with. The reader is not a practitioner and has asked no technical question: address them, keep the sentences short enough to follow, and offer what you find as something to weigh rather than as a finding to accept. Depth without oracle: no initiatic tone, no solemn capitals, no prophetic register, and nothing that reads as a bulletin about the world. Symbolic and descriptive, never deterministic — "the figure shows", "the tradition reads this as", never "this year will bring". A configuration describes a shape, not an event.',
  'prompt.taiyi.board': 'The board',
  'prompt.taiyi.forMatter':
    'Read the figure for the matter at the end, and read it for somebody who came here to find out what it says — not for a colleague checking your work. They have never seen one of these and they are the reason it was computed. Your reply goes in this order: the opening line, then a sentence or two situating the year and the matter in it, then the whole board read from its centre, then short sections on the parts of the figure as they bear on the matter, then what could be looked at next.',
  'prompt.taiyi.noQuestion':
    'No question was asked, and none is needed: this is laid on a year and it stands as it stands. So read it. And read it for somebody who came here to find out what this figure says, not for a colleague checking your work — they have never seen one of these and they are the reason it was computed. Your reply goes in this order: the opening line, then a sentence or two situating the year, then the whole read from its centre, then short sections on the parts of the figure, then what could be looked at next.',
  // In the model's own words, situating and nothing else.
  'prompt.taiyi.opening':
    'Then situate the year, in a sentence or two of your own: what is in front of them — a year written as a figure, 太乙 and fifteen other gods seated on a ring of sixteen around eight palaces, from a Tang text that reckons the count from an epoch — and which year it is, in their calendar and in the sexagenary one. Situate and move on: no paragraph on what the art is, what fate is, or what you are about to do.',
  'prompt.taiyi.panorama':
    'Then read the board whole, before any part of it. **The order the rules above walk it in is the order you look, not the order you write.** Copied into the reply it gives a manual — correct, dead, an inventory of positions nobody recognises. Write from a centre instead: find the two or three things this figure is organised around, and the main tension between them. That is what the reading is about, and everything else stands around it as evidence. The data supports what you say rather than opening the paragraphs. Which things you take as central is your choice and there is no way for it not to be: say that you chose, and say what you passed over. Prose, not a list.',
  // The themes, and here they are parts of a figure rather than themes of a
  // life — the difference between this closing and `mingClosing`'s. A section
  // titled for a part of the world would be the dynastic reading arriving
  // under a heading.
  'prompt.taiyi.about': 'What is being looked at this year is:',
  'prompt.taiyi.sections':
    'Then the figure in short sections, each under a title that names a part of it — "Where Tai Yi stands this year", "The two eyes" — with continuous prose inside. What to traverse: the palace 太乙 tàiyǐ occupies and how far through its three years it is; the two eyes, 文昌 wénchāng and 始擊 shǐjī, and what the sources read from where each fell; the two counts under the assignment you declared, and the balance or imbalance between them; the conditions the board named, each said as what it is; and the longer circuits — the 三基 sānjī, the 五福 wǔfú, the 大遊 dàyóu, the gate on duty — which move on scales of decades and are what places this year inside a longer figure. Each section says what the configuration **is**. None of them says what will happen.',
  'prompt.taiyi.read':
    'Where to look for all of that — the order you look, never the order you write: the palace 太乙 tàiyǐ stands in and the year it is at within it; the 局 jú and the 紀 jì the count has reached; where the two eyes fell and what stands with them; the two counts and the generals each seats; every condition the board names; the 計神 jìshén and 合神 héshén; and the longer circuits with the year each is at in its own period. What a **position** means — a palace, a seat, an eye where it fell — is not printed here and this engine ships none of it: where a section draws on the tradition for one, name what you are drawing on and, where it is a school\'s reading rather than the text\'s, say whose. The **conditions** are the exception and the only one: each is printed with the sentence 卷三 juàn sān uses to say what it is, so there use the words that are there and do not reach past them.',
  'prompt.taiyi.invite':
    'End by opening rather than by closing. Say briefly what could be looked at next and what you would need to be told in order to look at it — a part of the figure you set aside, the host and guest assignment you made and what would change it, a circuit you declined to read. Do not ask more than two questions, and do not put questions in place of the reading. This is an invitation, not a form.',

  'prompt.source': 'The board is at {url}',
  'prompt.chart': 'The chart',
  'prompt.asked': 'The question asked is:',
  'prompt.noQuestion':
    'No question was asked. Describe how the chart stands — what lies and what stands in each palace, and the configurations it fell into — and stop there. Do not choose a palace, do not read a fortune for anybody, and do not advise.',


  'cli.heading.moment': 'Moment',
  'cli.heading.pillars': 'Four Pillars',
  'cli.heading.chart': 'Qi Men chart',
  'cli.heading.palaces': 'Nine palaces',
  'cli.heading.standing': 'What stands in each',
  'cli.heading.weighed': 'How each of them stands',
  'cli.heading.reading': 'Read out',
  'cli.heading.luck': 'Luck cycles',
  'cli.heading.terms': 'Solar terms of {year}',
  'cli.heading.calendar': 'Lunar date',
  'cli.heading.patterns': 'Configurations',
  // The band under a drawing, where every name on it is said aloud. It exists
  // because the picture is what travels: on the page the readings stand in the
  // table beside it, and a picture sent on or printed has nobody to ask.
  'cli.heading.readings': 'How the names are said',
  // `{branch}` is the branch the horse stands on, said in words and in hanzi.
  // 寄宮: the centre has no palace of its own, so its stem is read at one
  // that has a direction, a gate and a spirit.
  'cli.field.lodged': 'The centre lodges in {palace}, where its {stem} is read.',
  // The same fact in a table cell, where there is no room for the sentence.
  'cli.field.lodgedShort': 'the centre lodges here: {stem}',
  'cli.field.horse': '{from}: {branch}, palace {palace}',
  // 年命 — the birth looked up inside a chart cast for a moment, which is the
  // classical direction: the chart is the hour's, and the person is placed in
  // it. Not a chart of a birth; see docs/sources.md.
  'cli.heading.nianming': 'Where the birth stands',
  // The one Liu Ren divergence a reader is offered. Each option says which
  // verse it is in words: an option reading `chou` is one nobody can choose
  // on purpose.
  // Which board the question is put to. The options lead with what they are
  // for, because somebody arriving with a question recognises the shape of
  // their own and has no way to weigh two Chinese names. The name of the art
  // follows the words rather than replacing them: a method is a Chinese
  // thing, and this is the one place on the page where that is what is named.
  // What the consultation names in the open. Only the circumstance takes a
  // name: the fields above it are what the page's lead line already announces,
  // and a heading over them would say a third time what two labels say.
  'form.group.standing': 'Where you are asking from',
  // The instant a board of 命 is laid on, which is a birth and not the press.
  // Named where the other kind names where you stand, because there the moment
  // is the circumstance and here it is the whole of the input.
  'form.group.birth': 'The birth the board is laid on',
  // Widened when the two boards of 命 arrived: two of the four are not asked
  // anything, so a label reading «what kind of question is it» would have named
  // something half the options do not have. What it still refuses to say is
  // *which board* — an option reading `Qi Men` is two words a reader has no way
  // to weigh, and the whole point of these four lines is that somebody arriving
  // recognises the shape of their own errand.
  'form.instrument': 'What kind of reading is it',
  'form.instrument.qimen': 'When to move, and which way — 奇門遁甲 qíméndùnjiǎ',
  'form.instrument.liuren': 'What is going on, and with whom — 大六壬 dàliùrén',
  'form.instrument.qizheng': 'The sky a life began under — 七政四餘 qīzhèngsìyú',
  'form.instrument.bazi': 'What a life is built from, at the hour of a birth — 八字 bāzì',
  // The fifth, and the one whose errand is nobody's. Said in the same register
  // as the other four — what it is for — and what it is for is a year rather
  // than a person or a matter, which the line has to make unmistakable or a
  // reader picks it expecting a forecast of their own.
  'form.instrument.taiyi': 'How a year stands, for everybody in it — 太乙神數 tàiyǐshénshù',
  'form.guiren': 'Which verse seats the noble (貴人)',
  'form.guiren.chou': '甲 with 戊 and 庚, at 丑 and 未',
  'form.guiren.wei': '甲 apart, at 未 and 丑',
  'form.guiren.note': 'It moves the twelve generals and leaves the three transmissions alone.',
  'cli.column.general': 'general',
  // 七政四餘. `lodge` and `ci` head degrees, so both say what the degrees are
  // measured from: one from a star, the other from the edge of a palace.
  'cli.column.body': 'body',
  'cli.column.inLodge': 'lodge, and degrees past its star',
  'cli.column.inPalace': 'palace, and degrees into it',
  'cli.column.motion': 'running',
  'cli.column.house': 'palace of',
  'cli.column.standing': 'standing there',
  'cli.heading.liuren': 'The Liu Ren board',
  'cli.field.yuejiang': 'general of the month',
  'cli.field.plate': 'heaven over earth',
  'cli.field.courses': 'four lessons',
  'cli.field.transmissions': 'three transmissions',
  'cli.field.drawnBy': 'drawn by',
  'cli.field.keti': 'course',
  'cli.field.half': 'half of the day',
  'cli.value.dayHalf': 'day, 卯 to 申',
  'cli.value.nightHalf': 'night, 酉 to 寅',
  'cli.value.emptyBranch': 'empty',
  // Said on a board no reference could check. The other rules were compared
  // against two independent implementations; this one has a clause neither
  // settles. See PLAN.md § 4 phase 13.
  'cli.value.liurenUnverified':
    'no reference implementation covers this rule; the classical text enumerates every board it can draw, and this engine matches them',
  'cli.heading.qizheng': 'The seven governors and the four remainders',
  'cli.field.governors': 'the seven',
  'cli.field.remainders': 'the remainders',
  'cli.field.minggong': 'palace of the life',
  'cli.field.houses': 'the twelve palaces',
  'form.luohou': 'Which node is 羅睺',
  'form.luohou.descending': 'the descending node — the astrologers\u2019 law',
  'form.luohou.ascending': 'the ascending node — 湯若望 and the 時憲曆',
  'form.copyStars': 'Copy the board',
  'form.luohou.note':
    'It swaps the two names and moves nothing else: the two nodes are the ends of one line, half a turn apart. The default is what the astrologers kept, which is the reverse of the Indian convention.',
  // Printed under every board, because a reader counting four names and
  // finding three is owed the reason on the page rather than in a document.
  'cli.value.threeRemainders':
    'three, not four: 紫氣 is a table and not a body, so there is no position in the sky against which its table could be checked',
  // Said once under a board whose frame nothing published can be held
  // against. See PLAN.md § 4 phase 16.
  'cli.value.qizhengFrame':
    'the lodges begin at their determinative stars, placed at this instant; no table of 宿度 and no epoch enters',

  'cli.heading.taiyi': 'The Tai Yi board of {year}',
  'cli.field.taiyiSui': 'year',
  'cli.field.taiyiJu': 'arrangement',
  'cli.field.taiyiEyes': 'the two eyes',
  'cli.field.taiyiCounts': 'the two counts',
  'cli.field.taiyiGenerals': 'the generals',
  'cli.field.taiyiBases': 'the three bases',
  'cli.field.taiyiCircuits': 'the longer circuits',
  'cli.field.taiyiGate': 'gate on duty',
  'cli.field.taiyiConditions': 'conditions',
  // Two lines every 太乙 board carries, because both are things a reader
  // holding a Qi Men chart beside it will otherwise get wrong in silence.
  'cli.value.taiyiPalaces':
    'the palaces are numbered as 太乙 numbers them, one seat from the Luoshu: 一宮 is the north-west here and the north in a Qi Men chart',
  'cli.value.taiyiEvidence':
    'checked against the tables and worked boards of 《太乙金鏡式經》 itself; no independent implementation of this board exists to check it against',

  'cli.heading.scan': 'Charts from {from} to {to}',
  'cli.heading.criteria': 'Asked for',
  'cli.heading.warnings': 'Warnings',

  'cli.field.local': 'local',
  'cli.field.utc': 'universal',
  'cli.field.solar': 'true solar',
  'cli.field.correction': 'correction',
  'cli.field.term': 'term',
  'cli.field.jie': 'month opened at',
  'cli.field.monthGods': 'Virtues of the month',
  'cli.field.shensha': 'The day carries',
  'cli.field.yearGods': 'Year gods',
  'cli.field.lodge': 'Lodge of the day',
  'cli.field.dayGod': 'God of the day',
  'web.calendar.heading': 'The calendar',
  'web.almanac.heading': 'The page of the almanac',
  'cli.field.jianchu': 'Day officer',
  'cli.field.lunar': 'lunar',
  'cli.field.ju': 'ju',
  'cli.field.chief': 'chief',
  'cli.field.chiefGate': 'chief gate',
  'cli.field.instrument': 'concealing 甲',
  'cli.field.dayMaster': 'day master',
  'cli.field.empty': 'void branches',
  'cli.field.distribution': 'five elements',
  'cli.field.place': 'place',
  'cli.field.pair': 'pair',
  'cli.field.earthSeat': 'on the earth plate',
  'cli.field.heavenSeat': 'on the heaven plate',
  // 泊宮 — the palace the branch moors in, fixed by the branch alone.
  'cli.field.mooring': 'moors in',
  'cli.field.image': 'image',
  'cli.field.years': 'years counted',

  'cli.column.year': 'year',
  'cli.column.month': 'month',
  'cli.column.day': 'day',
  'cli.column.hour': 'hour',
  'cli.column.palace': 'palace',
  'cli.column.earth': 'earth',
  'cli.column.heaven': 'heaven',
  'cli.column.star': 'star',
  'cli.column.gate': 'gate',
  'cli.column.spirit': 'spirit',
  'cli.column.pillar': 'pillar',
  'cli.column.stem': 'stem',
  'cli.column.hidden': 'concealed',
  'cli.column.god': 'god',
  'cli.column.nayin': 'image',
  'cli.column.stage': 'stage',
  'cli.column.strength': 'season',
  'cli.column.season': 'season of',
  'cli.column.age': 'from age',
  // The palace names itself by its direction — `label.palace.xun` is
  // "southeast" — so a scan needs no column of its own for where to face.
  'cli.column.from': 'from',
  'cli.column.to': 'until',
  'cli.column.ju': 'ju',

  // Said over the concealed stems, because their order is the whole of what
  // ranks them: 本氣 is the branch's own nature and carries the weight, 中氣
  // and 餘氣 are the season leaving and arriving. A reader who takes the three
  // as equal has read a pillar that is not there.
  'cli.value.byWeight': 'strongest first',
  'cli.value.yangDun': 'yang dun',
  'cli.value.yinDun': 'yin dun',
  'cli.value.forward': 'running forward',
  'cli.value.backward': 'running backward',
  'cli.value.jianchuDoubled': 'doubled: the month turns on this date',
  'cli.value.leapMonth': 'leap month',
  'cli.value.minutes': '{value} min',
  // How long after the birth the luck cycles open, each unit abbreviated.
  'cli.value.luckStart': '{years}y {months}m {days}d',
  'cli.value.nothingAnswered':
    'No palace in the interval answers what was asked. This says the arrangement did not occur, and nothing else.',
  'cli.value.everyPalace': 'every palace, nothing asked for in particular',
  // 甲 stands on no plate, so a year headed by it is looked up under the
  // instrument concealing its decade. Said, never silently substituted.
  'cli.value.concealedUnder': 'looked up under {stem}, since 甲 stands on no plate',
  // The centre has no direction, no gate and no spirit: what falls there is
  // read at the palace the centre lodges in.
  'cli.value.readAt': 'read at {palace}',
  'cli.value.sui': '{count} (虛歲, counting the year of the birth)',
  'cli.value.turns': '{count} (turns of the year pillar)',
  'cli.value.leapTerm': 'intercalated {term}',

  'cli.note.yuanFutou':
    'The yuan is read from the day\'s place in the fifteen-day futou cycle, not from the instant the term began. It is a divergence inside chaibu, and it moves the ju on most days.',
  'cli.note.method':
    'Cast by the {method} method. Other schools lay out other charts from the same instant.',

  'cli.error.unknownCommand': 'Unknown command "{command}". Try `qimen --help`.',
  'cli.error.unknownOption': 'Unknown option "{option}". Try `qimen --help`.',
  'cli.error.missingValue': 'Option "{option}" needs a value.',
  'cli.error.numberRequired': 'Option "{option}" needs a whole number, and "{value}" is not one.',
  'cli.error.contradiction':
    'Option "{option}" already says which gate to look for, and "{other}" says a different one. Drop one of them.',
  // Not a contradiction about a value: two frames that do not overlap. A
  // chart of a birth carrying a question is a third thing, and refusing is
  // how this project answers a request it takes no position on.
  'cli.error.exclusive':
    'Options "{option}" and "{other}" cannot both be given: they ask for two different readings of the same chart. Drop one of them.',
  'cli.error.unknownValue':
    'Option "{option}" does not take the value "{value}". Left unchecked it would match nothing, which reads exactly like an arrangement that never occurred.',
  'cli.error.genderRequired':
    'The luck cycles need --gender, since the tradition takes their direction from it. Without it the pillars are still complete.',
  // The same refusal as `exclusive`, from the other side: there a chart of a
  // birth was asked a question, here a board that is only ever laid on a birth
  // is. It is not that the flag is unimplemented — a question would name one of
  // the seats the board prints, and the reading would arrive at it without ever
  // having chosen it.
  'cli.error.notAsked':
    'The command "{command}" lays a board on a birth, and nothing is asked of it — so "--ask" has nowhere to go. Which part of a life a board of 命 is read for is chosen by the reader, out loud, after it is laid. Drop the question, or ask it of `chart` or `liuren`, which are cast for one.',
  // The same refusal for a third reason. Under 命 the question would name a
  // seat the board already prints; here there is nobody to ask on behalf of —
  // the subject is a year and the reader is not on the board at all.
  'cli.error.notAskedYear':
    'The command "{command}" lays a board on a year, and nothing is asked of it — so "--ask" has nowhere to go. Nobody is on this board: its subject is the year everybody is standing in, and a question is how a reader ends up in a figure they are not in. What this board does take is "--about": the matter you are looking at, which is a field of view and not a question, and which is what says who is 主 and who is 客. Use that, or ask the question of `chart` or `liuren`, which are cast for one.',

  // The place search, as the MCP server words it. The reader here is a model
  // relaying an answer to somebody, so `lang` has to reach the prose too: a
  // tool that returned Italian place names under an English sentence would
  // have translated the half nobody was asking about.
  'search.none': 'No place found for "{query}".',
  'search.coverage':
    'The dataset covers populated places above five hundred inhabitants, plus every administrative seat whatever its size. Worth trying: the local spelling, the name of the municipality rather than the hamlet, or a larger place nearby.',
  'search.candidates': '{count} candidates for "{query}".',
  'search.candidate': 'One candidate for "{query}".',
  'search.column': 'The first column is location_id.',
};

export type MessageKey = keyof typeof en;
