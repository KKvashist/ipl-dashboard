// backend/src/utils/teamNames.ts
//
// IPL franchises that changed names but are the SAME ownership/franchise
// should be merged for stats purposes. Franchises that were discontinued
// and replaced by a NEW ownership group in the same city are NOT merged
// (e.g. Gujarat Lions 2016-17 vs Gujarat Titans 2022- are different owners).
//
// Rebrand history handled here:
//   Delhi Daredevils        -> Delhi Capitals        (2019 ownership rebrand)
//   Kings XI Punjab         -> Punjab Kings           (2021 rebrand)
//   Royal Challengers Bangalore -> Royal Challengers Bengaluru (2024 city rename)
//
// Defunct/one-off franchises are left as-is (not merged with anything):
//   Deccan Chargers, Pune Warriors India, Rising Pune Supergiants(t), Gujarat Lions
//
// If your dataset uses different exact strings for any of these, update the
// map below to match — check with:
//   SELECT DISTINCT team1 FROM "Match" ORDER BY team1;

const CANONICAL_NAME_MAP: Record<string, string> = {
  "Delhi Daredevils": "Delhi Capitals",
  "Kings XI Punjab": "Punjab Kings",
  "Royal Challengers Bangalore": "Royal Challengers Bengaluru",
};

/**
 * Returns the canonical (current) franchise name for a given historical name.
 * Names not in the map are returned unchanged.
 */
export function canonicalTeamName(name: string): string {
  return CANONICAL_NAME_MAP[name] ?? name;
}