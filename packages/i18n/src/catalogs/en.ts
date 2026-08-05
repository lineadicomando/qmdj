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
  'core.error.EPHEMERIS_FAILURE': 'Ephemeris calculation failed at Julian Day {julianDay}: {reason}',

  'core.warning.AMBIGUOUS_LOCAL_TIME':
    'Local time {time} on {date} occurs twice in {timezone} (clocks went back). The first occurrence was used, the one still on summer time.',
  'core.warning.NONEXISTENT_LOCAL_TIME':
    'Local time {time} on {date} never existed in {timezone} (clocks went forward). The instant immediately after was used.',
  'core.warning.MOSHIER_FALLBACK':
    'Ephemeris files not found in {path}: using the Moshier ephemeris, which needs no files and is accurate to about a tenth of an arc second. Run `npm run ephe:download -w @qimendunjia/core` for the full files.',

  'web.error.UNKNOWN_LOCATION': 'No place has the identifier {id}.',

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

  'label.strength.wang': 'prospering',
  'label.strength.xiang': 'supported',
  'label.strength.xiu': 'resting',
  'label.strength.qiu': 'imprisoned',
  'label.strength.si': 'dying',

  'label.layer.gate': 'gates',
  'label.layer.star': 'stars',
  'label.layer.both': 'gates and stars',

  'nav.chart': 'Qi Men',
  'nav.bazi': 'Four Pillars',
  'nav.sections': 'Sections',

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
  'form.legend': 'The moment and the place',

  // What a form offers has to be readable by whoever has to choose from it.
  // `zishi` and `midnight` are what the API takes and stay so; what the
  // reader sees says which hour that is, with the hanzi beside the words
  // because 子時 is a name and 23:00 is not a translation of it.
  'form.options': 'Options',
  'form.trueSolarTime': 'Correct to true solar time',
  'form.dayBoundary': 'The day begins',
  'form.dayBoundary.zishi': 'at the hour of the Rat 子時, 23:00',
  'form.dayBoundary.midnight': 'at midnight, 00:00',
  'form.gender': 'Sex — only the direction of the luck cycles depends on it',
  'form.gender.unset': 'not given',
  'form.gender.male': 'male',
  'form.gender.female': 'female',

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
  'step.shichen.back': 'The previous double hour',
  'step.shichen.forward': 'The next double hour',
  'step.day.back': 'The day before',
  'step.day.forward': 'The day after',
  'step.month.back': 'The month before',
  'step.month.forward': 'The month after',
  'step.year.back': 'The year before',
  'step.year.forward': 'The year after',

  'footer.data': 'Astronomical data {ephemeris} · places {geonames} (CC BY 4.0)',
  'footer.licence': 'Source code under AGPL-3.0',
  'footer.privacy': 'Privacy',
  'footer.notes': 'Notes',

  'notes.title': 'Notes on what this computes',
  'notes.method':
    'Charts are cast by the chaibu method. Other schools lay out other charts from the same instant; the zhirun and maoshan methods are not implemented, and are refused rather than quietly substituted.',
  'notes.interpretation':
    'The engine reports arrangements and relations, never a reading. That a gate stands over a palace whose phase it controls is a fact anyone can check off the plates; what it means is not in the output and is not for the software to say.',
  'notes.certainty':
    'The numbers are not equally sure. Solar terms, the lunar calendar and the four pillars were checked against published astronomical tables through an independent implementation, over 1 926 dates from 1902 to 2098. The Qi Men layout was checked against one open implementation, which means consistent with it, not verified. The configurations come from Chinese-language sources with no runnable reference at all.',
  'notes.script':
    'Names are shown in your language with the Chinese beside them. The Chinese is the name, not a translation of one: without it nothing here can be checked against a book or a second implementation.',

  'privacy.title': 'Privacy',
  'privacy.nothing':
    'Nothing you type is stored. Dates, times and places travel in the address of the page, are used to compute an answer, and are not written to any database or log kept by this site.',
  'privacy.address':
    'Because the parameters are in the address, a link to a chart carries a date, a time and a place with it. Share one only with someone you would tell those things to.',
  'privacy.storage':
    'One thing is kept in your browser, and only if you ask for it: the appearance you chose, under the key {key}. Setting the appearance back to automatic deletes it.',
  'privacy.cookies': 'No cookies are set, and there is no analytics of any kind.',

  'cli.heading.moment': 'Moment',
  'cli.heading.pillars': 'Four Pillars',
  'cli.heading.chart': 'Qi Men chart',
  'cli.heading.palaces': 'Nine palaces',
  'cli.heading.reading': 'Read out',
  'cli.heading.luck': 'Luck cycles',
  'cli.heading.terms': 'Solar terms of {year}',
  'cli.heading.calendar': 'Lunar date',
  'cli.heading.patterns': 'Configurations',
  'cli.heading.warnings': 'Warnings',

  'cli.field.local': 'local',
  'cli.field.utc': 'universal',
  'cli.field.solar': 'true solar',
  'cli.field.correction': 'correction',
  'cli.field.term': 'term',
  'cli.field.jie': 'month opened at',
  'cli.field.lunar': 'lunar',
  'cli.field.ju': 'ju',
  'cli.field.chief': 'chief',
  'cli.field.chiefGate': 'chief gate',
  'cli.field.instrument': 'concealing 甲',
  'cli.field.dayMaster': 'day master',
  'cli.field.empty': 'void branches',
  'cli.field.place': 'place',

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
  'cli.column.hidden': 'concealed',
  'cli.column.god': 'god',
  'cli.column.nayin': 'image',
  'cli.column.stage': 'stage',
  'cli.column.strength': 'season',
  'cli.column.season': 'season of',
  'cli.column.age': 'from age',

  'cli.value.yangDun': 'yang dun',
  'cli.value.yinDun': 'yin dun',
  'cli.value.forward': 'running forward',
  'cli.value.backward': 'running backward',
  'cli.value.leapMonth': 'leap month',
  'cli.value.minutes': '{value} min',

  'cli.note.methodOnly':
    'Cast by the chaibu method. Other schools lay out other charts from the same instant.',

  'cli.error.unknownCommand': 'Unknown command "{command}". Try `qimen --help`.',
  'cli.error.unknownOption': 'Unknown option "{option}". Try `qimen --help`.',
  'cli.error.missingValue': 'Option "{option}" needs a value.',
  'cli.error.genderRequired':
    'The luck cycles need --gender, since the tradition takes their direction from it. Without it the pillars are still complete.',
};

export type MessageKey = keyof typeof en;
