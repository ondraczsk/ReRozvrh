/* eslint-disable no-unused-vars */
import React from 'react';
import { Text, Link } from '@chakra-ui/react';
import { handleModalOpen } from '@/functions/main/departuresModal/handleModalOpen';
import { DepartureMessageKeyStatic, DepartureMessageProps } from '@/interfaces/main/departureMessage';



export const DepartureMessageStatic: React.FC<DepartureMessageProps> = ({
  isCompact,
  previousBuildingCode,
  currentBuildingCode,
  setPreviousBuildingCode,
  setCurrentBuildingCode,
  onOpen,
}) => {
  const messages: Record<DepartureMessageKeyStatic, string> = {
    "HO-FL": "linky 14 a 24 ze zastávky Albertov",
    "HO-KO": "linky 18 ze zastávky Albertov",
    "FL-HO": "linky 14 a 24 ze zastávky Bílá labuť",
    "FL-KO": "metra ze stanice Florenc-B",
    "KO-FL": "metra ze stanice Národní třída",
    "KO-HO": "linky 18 ze zastávky Národní třída",
  };

  const key = `${previousBuildingCode}-${currentBuildingCode}` as DepartureMessageKeyStatic;

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
