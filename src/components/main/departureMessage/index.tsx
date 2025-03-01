/* eslint-disable no-unused-vars */
import React from 'react';
import { Text, Link } from '@chakra-ui/react';
import { handleModalOpen } from '@/functions/main/departuresModal/handleModalOpen';
import { DepartureMessageKey, DepartureMessageProps } from '@/interfaces/main/departureMessage';



export const DepartureMessage: React.FC<DepartureMessageProps> = ({
  isCompact,
  previousBuildingCode,
  currentBuildingCode,
  setPreviousBuildingCode,
  setCurrentBuildingCode,
  onOpen,
}) => {
  const messages: Record<DepartureMessageKey, string> = {
    "HON-FLO": "linky 14 a 24 ze zastávky Albertov",
    "HON-KON": "linky 18 ze zastávky Albertov",
    "FLO-HON": "linky 14 a 24 ze zastávky Bílá labuť",
    "HOS-FLO": "linky 14 a 24 ze zastávky Albertov",
    "HOS-KON": "linky 18 ze zastávky Albertov",
    "FLO-HOS": "linky 14 a 24 ze zastávky Bílá labuť",
    "FLO-KON": "metra ze stanice Florenc-B",
    "KON-FLO": "metra ze stanice Národní třída",
    "KON-HOS": "linky 18 ze zastávky Národní třída",
    "KON-HON": "linky 18 ze zastávky Národní třída",
  };
  const key = `${previousBuildingCode}-${currentBuildingCode}` as DepartureMessageKey;

  const message = messages[key];

  return message ? (
    <Text color="muted" fontSize={isCompact ? "sm" : undefined}>
      <Link
        color="black"
        _dark={{ color: "white" }}
        onClick={() => {
          handleModalOpen(
            previousBuildingCode,
            currentBuildingCode,
            setPreviousBuildingCode,
            setCurrentBuildingCode,
            onOpen
          );
        }}
      >
        Aktuální odjezdy
      </Link>{" "}
      {message}
    </Text>
  ) : (
    <Text color="muted">
      Aktuální odjezdy nejsou k dispozici
    </Text>
  );
};
