"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  List,
  ListItem,
  Stack,
  Text,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  keyframes,
  Progress,
  Spinner,
  Flex,
  HStack,
  useColorMode,
  Link,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { FiAlertCircle, FiClock } from "react-icons/fi";
import { FaWheelchair, FaSnowflake } from "react-icons/fa";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { ApiResponse, DeparturesModalProps } from "@/interfaces/main/departuresModal";
import { fetchDepartures } from "@/functions/main/departuresModal/fetchDepartures";
import { getRouteIcon } from "@/functions/main/departuresModal/getRouteIcon";

const DeparturesModal: React.FC<DeparturesModalProps> = ({
  isOpen,
  onClose,
  previousBuildingCode,
  currentBuildingCode,
}) => {
  const [departures, setDepartures] = useState<ApiResponse>([[]]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState(20);
  const [error, setError] = useState<string | null>(null);

  const blink = keyframes`
    0%, 66.66% {
      opacity: 1; 
    }
    66.66%, 100% {
      opacity: 0; 
    }
  `;

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (isOpen) {
      fetchDepartures(
        previousBuildingCode,
        currentBuildingCode,
        setDepartures,
        setIsFirstLoad,
        setRemainingSeconds,
        setError
      );
      intervalId = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            fetchDepartures(
              previousBuildingCode,
              currentBuildingCode,
              setDepartures,
              setIsFirstLoad,
              setRemainingSeconds,
              setError
            );
            return 20;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen]);


  const { colorMode } = useColorMode();
  const filteredDepartures = departures[0].filter((departure) => {
    return departure.trip.is_canceled === false;
  })
  // Pomocné funkce / proměnné
const isAlbertov = (code: string | null) => code === "HON" || code === "HOS";
const isAlbertovPrev = isAlbertov(previousBuildingCode);
const isAlbertovCurr = isAlbertov(currentBuildingCode);

const isMetroStation = 
  (previousBuildingCode === "FLO" && currentBuildingCode === "KON") ||
  (previousBuildingCode === "KON" && currentBuildingCode === "FLO");

const isTramStop = 
  isAlbertovPrev ||
  (previousBuildingCode === "FLO" && isAlbertovCurr) ||
  (previousBuildingCode === "KON" && isAlbertovCurr);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent overflow="hidden">
        {!isFirstLoad && departures[0].length !== 0 && (
          <Box>
            <Progress
              sx={{
                "& > div:first-child": {
                  transitionProperty: "width",
                },
              }}
              height="3px"
              colorScheme="blue"
              value={
                ((20 -
                  (remainingSeconds === 1
                    ? remainingSeconds - 1
                    : remainingSeconds)) /
                  20) *
                100
              }
            />
          </Box>
        )}
        <ModalHeader>
          Aktuální odjezdy
          <HStack gap={1}>
          <Text fontSize="md" fontWeight="400">
            {isTramStop
              ? "tramvají ze zastávky "
              : isMetroStation
              ? "metra ze stanice "
              : ""}
          </Text>
          <Text fontSize="xl" fontWeight="400">
            {isAlbertovPrev
              ? "Albertov"
              : previousBuildingCode === "FLO" && currentBuildingCode === "KON"
              ? "Florenc-B"
              : previousBuildingCode === "FLO" && isAlbertovCurr
              ? "Bílá labuť"
              : previousBuildingCode === "KON"
              ? "Národní třída"
              : ""}
          </Text>

          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {error ? (
            <Alert status="error" mb={6}>
              <AlertIcon />
              {error}
            </Alert>
          ) : isFirstLoad && filteredDepartures.length === 0 ? (
            <Flex align="center" justify="center" height="100%">
              <Spinner size="xl" />
            </Flex>
          ) : filteredDepartures.length > 0 ? (
            <List spacing={4}>
              {filteredDepartures.map((departure, index) => (
                <ListItem
                  key={index}
                  p={4}
                  border="1px solid"
                  borderColor="gray.300"
                  _dark={{ borderColor: "gray.600" }}
                  borderRadius="md"
                >
                  <Stack
                    direction="row"
                    justify="space-between"
                    alignItems="center"
                  >
                    <Stack direction="row" align="center">
                      {getRouteIcon(departure.route.type)}
                      <Text fontSize="xl" fontWeight="bold">
                        {colorMode === "dark" ? (
                          <Badge
                            mr={1}
                            variant="solid"
                            fontSize="sm"
                            colorScheme={
                              departure.route.type === "metro"
                                ? "yellow"
                                : "red"
                            }
                          >
                            {departure.route.short_name}
                          </Badge>
                        ) : (
                          <Badge
                            fontSize="sm"
                            mr={1}
                            variant="outline"
                            colorScheme={
                              departure.route.type === "metro"
                                ? "yellow"
                                : "red"
                            }
                          >
                            {departure.route.short_name}
                          </Badge>
                        )}{" "}
                        {departure.trip.headsign}
                      </Text>
                      {departure.vehicle.is_wheelchair_accessible && (
                        <Box color="blue.600" _dark={{ color: "blue.200" }}>
                          <FaWheelchair />
                        </Box>
                      )}
                      {departure.vehicle.is_air_conditioned && (
                        <Box color="blue.600" _dark={{ color: "blue.200" }}>
                          <FaSnowflake />
                        </Box>
                      )}
                    </Stack>
                    <Badge
                      colorScheme={
                        departure.departure.minutes <= 2
                          ? "red"
                          : departure.departure.minutes <= 5
                          ? "yellow"
                          : "green"
                      }
                      animation={
                        departure.departure.minutes <= 1
                          ? `${blink} 2s steps(1, end) infinite`
                          : "none"
                      }
                    >
                      {departure.departure.minutes} min
                    </Badge>
                  </Stack>
                  <HStack color="gray.500" _dark={{ color: "gray.200" }}>
                    <FiClock />
                    <Text>
                      Pravidelný odjezd:{" "}
                      {new Date(
                        departure.departure.timestamp_scheduled
                      ).toLocaleTimeString()}
                      <br />
                      <Box color="gray.800" _dark={{ color: "white" }}>
                        Reálný odjezd:{" "}
                        {new Date(
                          new Date(
                            departure.departure.timestamp_scheduled
                          ).getTime() +
                            departure.departure.delay_seconds * 1000
                        ).toLocaleTimeString()}
                      </Box>
                      {departure.departure.delay_seconds > 60 &&
                        (() => {
                          const delayMinutes = Math.floor(
                            departure.departure.delay_seconds / 60
                          );
                          const minuteLabel =
                            delayMinutes === 1
                              ? "minuta"
                              : delayMinutes >= 2 && delayMinutes <= 4
                              ? "minuty"
                              : "minut";

                          return (
                            <Box
                              color={
                                delayMinutes <= 5 ? "orange.500" : "red.500"
                              }
                              _dark={{
                                color:
                                  delayMinutes <= 5 ? "orange.200" : "red.200",
                              }}
                            >
                              Zpoždění: {delayMinutes} {minuteLabel}
                            </Box>
                          );
                        })()}
                    </Text>
                  </HStack>
                </ListItem>
              ))}
            </List>
          ) : (
            <Flex align="center" justify="center" height="100%">
              <HStack>
                <FiAlertCircle size={24} />
                <Text>
                  K dispozici nejsou žádné nejbližší odjezdy. Zkuste využít
                  odkaz{" "}
                  <Link href="https://pid.cz/zastavky-pid/" isExternal>
                    PID.cz <ExternalLinkIcon verticalAlign="unset" mx="2px" />
                  </Link>
                </Text>
              </HStack>
            </Flex>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Zavřít
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeparturesModal;
