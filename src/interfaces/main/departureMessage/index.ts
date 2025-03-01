import React from "react";
export type DepartureMessageKey =
| "HON-FLO"
| "HON-KON"
| "FLO-HON"
| "HOS-FLO"
| "HOS-KON"
| "FLO-HOS"
| "FLO-KON"
| "KON-FLO"
| "KON-HON"
| "KON-HOS";
export type DepartureMessageKeyStatic =
"HO-FL" |
"HO-KO" |
"FL-HO" |
"FL-KO" |
"KO-FL" |
"KO-HO";

export interface DepartureMessageProps {
  isCompact: boolean;
  previousBuildingCode: string;
  currentBuildingCode: string;
  setPreviousBuildingCode: React.Dispatch<React.SetStateAction<string | null>>;
  setCurrentBuildingCode: React.Dispatch<React.SetStateAction<string | null>>;
  onOpen: () => void;
}
