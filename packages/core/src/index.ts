/**
 * @qimendunjia/core — the calculation engine.
 *
 * A pure library: no dependency on HTTP, on a web framework, or on MCP. The
 * adapters consume it from outside.
 *
 * Two rules govern what comes out of here. **The engine answers no question**:
 * it produces what can be checked — the arrangement, the name the tradition
 * gives it, and the fortune transmitted with that name — and stops before
 * everything that needs to know what somebody wants. It chooses no 用神, ranks
 * nothing and advises nobody. **The engine does not localise**: it returns
 * identifiers, hanzi and numbers, and readable text is made at the surface
 * from the catalogs in `@qimendunjia/i18n`.
 */

export {
  initEphemeris,
  resetEphemerisCache,
  moonLongitude,
  normalize360,
  sunCrossing,
  sunLongitude,
  type EphemerisContext,
  type EphemerisMode,
} from './ephemeris.js';

export {
  ChartError,
  warning,
  type ChartErrorCode,
  type ChartWarning,
  type ChartWarningCode,
} from './errors.js';

export {
  currentMoment,
  fromJulianDay,
  julianDayToMillis,
  resolveTime,
  systemTimezone,
  toJulianDay,
  zoneMeridian,
  type LocalMoment,
  type ResolvedTime,
  type TimeResolution,
} from './time.js';

export { trueSolarTime, type TrueSolarTime } from './true-solar.js';

export {
  SOLAR_TERMS,
  jieAt,
  solarTermAt,
  solarTermsBetween,
  solarTermsOfYear,
  type SolarTerm,
  type SolarTermDefinition,
  type SolarTermId,
} from './solar-terms.js';

export {
  localDayNumber,
  lunarDate,
  newMoonAfter,
  newMoonBefore,
  newMoonNear,
  type LunarDate,
} from './lunar.js';

export { zhirunAssignment, type ZhirunAssignment } from './zhirun.js';

export {
  BRANCHES,
  STEMS,
  dayGanzhi,
  decade,
  ganzhiFrom,
  ganzhiOf,
  hourBranch,
  hourGanzhi,
  monthGanzhi,
  yearGanzhi,
  type Branch,
  type BranchId,
  type Ganzhi,
  type Stem,
  type StemId,
} from './ganzhi.js';

export { resolveMoment, type Moment, type Pillars } from './pillars.js';

export {
  PURPOSES,
  purposeCriteria,
  purposeOfGate,
  type Purpose,
  type PurposeId,
} from './purposes.js';

export {
  MAX_SCAN_DAYS,
  matchRuns,
  scanCharts,
  type ScanCriteria,
  type ScanMatch,
  type ScanRun,
} from './scan.js';

export { chartLabels, sayBranch, sayGanzhi, type ChartLabels } from './labels.js';

export {
  formatBazi,
  formatMoment,
  formatQimenChart,
  formatScan,
  formatSolarTerms,
  formatWarnings,
} from './format.js';

export {
  CONTROLLED_BY,
  CONTROLS,
  GENERATED_BY,
  GENERATES,
  annualPillars,
  computeBazi,
  hiddenStems,
  luckCycles,
  nayin,
  tenGod,
  twelveStage,
  type Bazi,
  type BaziOptions,
  type BaziPillar,
  type Gender,
  type HiddenRank,
  type HiddenStem,
  type LuckCycle,
  type LuckCycles,
  type LuckGranularity,
  type Nayin,
  type PillarPosition,
  type TenGod,
  type TenGodId,
  type TwelveStage,
  type TwelveStageId,
} from './bazi/index.js';

export {
  CENTRE_HOST,
  DIRECTIONS,
  FLIGHT_ASCENDING,
  FLIGHT_DESCENDING,
  GATES,
  PALACES,
  PATTERN_IDS,
  RING_CLOCKWISE,
  RING_COUNTERCLOCKWISE,
  SPIRITS_YANG,
  SPIRITS_YIN,
  SPIRIT_IDS,
  RELATION_IDS,
  STARS,
  VALENCE_IDS,
  YUAN_HANZI,
  YUAN_PINYIN,
  branchesOf,
  computeQimenChart,
  determineJu,
  findPatterns,
  horseBranch,
  horseOf,
  opposite,
  relationOf,
  seasonElement,
  strengthOf,
  unmetHour,
  earthPlate,
  lodge,
  orbitFrom,
  palace,
  palaceOf,
  palaceOfBranch,
  patternName,
  step,
  valenceOf,
  type ByPalace,
  type Direction,
  type Gate,
  type GateId,
  type Ju,
  type Horse,
  type Palace,
  type PalaceContents,
  type PalaceId,
  type Pattern,
  type PatternId,
  type QimenChart,
  type Relation,
  type RelationId,
  type Spirit,
  type SpiritId,
  type Star,
  type StarId,
  type Strength,
  type StrengthId,
  type Valence,
  type ValenceId,
  type Yuan,
} from './dunjia/index.js';

export {
  DEFAULT_OPTIONS,
  ELEMENT_HANZI,
  type ChartOptions,
  type Element,
  type Place,
} from './types.js';
