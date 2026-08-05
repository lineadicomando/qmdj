/**
 * @qimendunjia/geo — location lookup with coordinates and timezone.
 *
 * The GeoNames dataset is imported into a local SQLite database: no network
 * call at runtime, no rate limit, no dependency on an external service. The
 * IANA timezone comes from the dataset itself, so one search already returns
 * everything the calculation needs.
 *
 * The timezone is the point of it all. An hour of error moves the hour
 * pillar, and with it the day pillar of anyone born near midnight.
 */

export { searchLocations, getLocation, databaseInfo } from './search.js';
export {
  closeDatabase,
  defaultDatabasePath,
  normalizeName,
  loadSchema,
  openDatabase,
} from './database.js';
export {
  GeoError,
  type GeoErrorCode,
  type Location,
  type SearchOptions,
} from './types.js';
