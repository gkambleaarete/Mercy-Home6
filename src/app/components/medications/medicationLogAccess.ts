// The medication access adapter lives in data/medicationLogAccess.ts (the one
// every component and the log store use). This path only re-exports it so an
// old import can't pick up a second, divergent copy.
export * from "../../data/medicationLogAccess";
