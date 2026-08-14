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
  'label.keti.wuqin': 'without kin',

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

  'nav.chart': 'Qi Men',
  'nav.bazi': 'Four Pillars',
  'nav.liuren': 'Liu Ren',
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
    'Ask a question and get a prompt, ready to paste into ChatGPT, Claude or another assistant.',
  'consult.cast': 'Put the question',
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

  // Under the board, where somebody who wants a reading will be looking. It
  // sends them on rather than offering a field here: the question belongs
  // before the casting, and this page has already cast.
  'form.toConsult': 'To have a chart read, with a question:',

  // Beside it, the other section that answers about this same instant. The
  // four pillars are already under the board — the chart is cast on them —
  // and what the other section adds is what they conceal and how they stand.
  // It says *this instant* because the section it leads to is more often
  // asked about a birth, and arriving there with a chart's moment in the
  // fields should not read as one.
  'form.toPillars': 'The same instant as four pillars, with the stems they conceal:',

  'form.promptPrivacy': 'What you entered goes into the prompt.',
  // Required, and said in the label rather than by a mark nobody can read
  // aloud. It is not a formality: the chart is read *towards* a question, and
  // a prompt built without one asks a model to read towards nothing.
  'form.question': 'Your question',
  'form.questionPlaceholder': 'What are you asking?',

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

  'notes.title': 'Notes on what this computes',
  'notes.method':
    'Charts are cast by the chaibu method. Other schools lay out other charts from the same instant; the zhirun and maoshan methods are not implemented, and are refused rather than quietly substituted.',
  'notes.interpretation':
    'The engine reports arrangements, and the names and fortunes the tradition attaches to them. That a gate stands over a palace whose phase it controls is a fact anyone can check off the plates, that the arrangement is called 門迫 is its name, and that 門迫 is 凶 is part of that name rather than a judgement about your day: the sources do not name a configuration and rate it separately. What the engine will not do is anything that needs a question to have been asked — it does not choose which palace bears on what you want to know, does not rank the palaces or the hours, and does not advise. Reading is yours.',
  'notes.certainty':
    'The numbers are not equally sure. Solar terms, the lunar calendar and the four pillars were checked against published astronomical tables through an independent implementation, over 1 926 dates from 1902 to 2098. The Qi Men layout was checked against one open implementation, which means consistent with it, not verified. The configurations come from Chinese-language sources with no runnable reference at all.',
  'notes.script':
    'Names are shown in your language with the Chinese beside them. The Chinese is the name, not a translation of one: without it nothing here can be checked against a book or a second implementation.',

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
    'This board was drawn by 返吟 fǎnyín, and that rule rests on a clause no independent implementation covers. Every other rule here was checked against two of them. Say so if you read from it.',
  'prompt.liuren.board': 'The board',
  'prompt.liuren.noQuestion':
    'No question was asked. Describe how the board stands — what the plate turned, what the four courses hold, which rule drew the transmissions and what they are — and stop there. Do not choose a course, do not read a fortune for anybody, and do not advise.',
  'prompt.source': 'The board is at {url}',
  'prompt.chart': 'The chart',
  'prompt.asked': 'The question asked is:',
  'prompt.noQuestion':
    'No question was asked. Describe how the chart stands — what lies and what stands in each palace, and the configurations it fell into — and stop there. Do not choose a palace, do not read a fortune for anybody, and do not advise.',

  // Examples of a question, to show how one is put. Grouped by the eight
  // errands of `purposes.ts`, which is a table the engine already carries:
  // the alternative was a combinatorial one, and a grammar that assembles a
  // question from parts writes nonsense in two languages instead of one.
  //
  // These are not questions to ask. A question nobody has asked has no 用神,
  // which is why the interface offers them as a way of learning the shape of
  // one and says so beside the button.

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
  'form.instrument': 'What kind of question is it',
  'form.instrument.qimen': 'When to move, and which way — 奇門遁甲 qíméndùnjiǎ',
  'form.instrument.liuren': 'What is going on, and with whom — 大六壬 dàliùrén',
  'form.guiren': 'Which verse seats the noble (貴人)',
  'form.guiren.chou': '甲 with 戊 and 庚, at 丑 and 未',
  'form.guiren.wei': '甲 apart, at 未 and 丑',
  'form.guiren.note': 'It moves the twelve generals and leaves the three transmissions alone.',
  'cli.column.general': 'general',
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
  'cli.value.liurenUnverified': 'this rule is unfalsified: no reference implementation covers it',
  'cli.heading.scan': 'Charts from {from} to {to}',
  'cli.heading.criteria': 'Asked for',
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

  'cli.value.yangDun': 'yang dun',
  'cli.value.yinDun': 'yin dun',
  'cli.value.forward': 'running forward',
  'cli.value.backward': 'running backward',
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
