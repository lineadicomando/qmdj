-- Schema of the location database.
--
-- `location_names` holds one row per known name of a place, all sharing the
-- same `location_id`: it is the simplest way to make exonyms work with a
-- single query ("Munich", "München", "Monaco di Baviera").
--
-- `search_name` holds the normalised name (lowercase, no diacritics). The
-- normalisation applied at import time and the one applied at search time
-- must agree exactly: see `normalizeName` in src/database.ts.
--
-- Names are stored in two languages. GeoNames uses the international exonym
-- as the primary name ("Rome", "Munich"), which is already what an English
-- interface wants; the `*_it` columns hold the Italian variant where one
-- exists. Resolution happens in the query with COALESCE, so an English
-- consumer pays nothing for the second language.

CREATE TABLE IF NOT EXISTS locations (
  id           INTEGER PRIMARY KEY,
  name_en      TEXT    NOT NULL,
  name_it      TEXT,
  country_code TEXT    NOT NULL,
  country_en   TEXT    NOT NULL,
  country_it   TEXT,
  region_en    TEXT,
  region_it    TEXT,
  latitude     REAL    NOT NULL,
  longitude    REAL    NOT NULL,
  timezone     TEXT    NOT NULL,
  population   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS location_names (
  location_id INTEGER NOT NULL REFERENCES locations(id),
  search_name TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_location_names_search
  ON location_names(search_name, location_id);

CREATE INDEX IF NOT EXISTS idx_locations_country
  ON locations(country_code);

CREATE TABLE IF NOT EXISTS metadata (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
