"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Spinner,
  Heading,
  Stack,
  Icon,
  HStack,
  Text,
  Badge,
  CardBody,
  CardHeader,
  Card,
  Box,
  Flex,
  Spacer,
  IconButton,
  useDisclosure,
  Alert,
  AlertIcon,
  Button,
  Divider,
} from "@chakra-ui/react";
import { randomColor } from "@chakra-ui/theme-tools";
import {
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateContainer,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  StructuredList,
  StructuredListCell,
  StructuredListItem,
  Timeline,
  TimelineContent,
  TimelineIcon,
  TimelineItem,
  TimelineSeparator,
  TimelineTrack,
} from "@saas-ui/react";
import {
  MdAvTimer,
  MdEmojiFoodBeverage,
  MdInfoOutline,
  MdOutlineTransferWithinAStation,
} from "react-icons/md";
import {
  FiAlertTriangle,
  FiClock,
  FiLoader,
  FiMapPin,
  FiSettings,
  FiUser,
} from "react-icons/fi";
import Link from "next/link";
import InstallPwaIconButton from "@/components/main/installPwaIconButton";
import SyncModal from "@/components/main/syncModal";
import DeparturesModal from "@/components/main/departuresModal";
import DeparturesModalStatic from "@/components/main/departuresModal/static";
import { CircleIcon } from "@/components/main/circleIcon";
import {
  Datepicker,
  DatepickerEvent,
} from "@/components/main/horizontalDatePicker";
import { cs } from "date-fns/locale";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import {
  TimetableData,
  MergedTimetableEntryStatic,
} from "@/interfaces/main/timetable";
import { decodeBuildingLocation } from "@/functions/main/timetable/decodeBuildingLocation";
import { DepartureMessage } from "@/components/main/departureMessage";
import { DepartureMessageStatic } from "@/components/main/departureMessage/static";
import { defaultSettings, SettingsType } from "@/interfaces/settings";
import { fetchTimetable } from "@/functions/main/timetable/static/fetchTimetable";
import { computeTimetableData } from "@/functions/main/timetable/static/computeTimetableData";
import GroupSelector from "@/components/main/static/groupSelector";
import useLocalStorageState from "use-local-storage-state";

dayjs.extend(customParseFormat);
dayjs.extend(weekOfYear);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

/* ========================================
   Dynamická varianta rozvrhu (původní KosTimetable)
   ======================================== */
function DynamicTimetable() {
  
function FreeTimeItem({
  freeStart,
  freeEnd,
  isCompact = false,
}: {
  freeStart: dayjs.Dayjs;
  freeEnd: dayjs.Dayjs;
  isCompact?: boolean;
}) {
  const [now, setNow] = useState(dayjs());
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(dayjs());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isToday = now.isSame(freeStart, "day");

  if (isToday && now.isAfter(freeEnd)) {
    return null;
  }

  const totalMinutes = freeEnd.diff(freeStart, "minute");
  const totalHours = Math.floor(totalMinutes / 60);
  const totalRemainingMinutes = totalMinutes % 60;

  const isActive = isToday && now.isAfter(freeStart) && now.isBefore(freeEnd);

  const remainingSeconds = freeEnd.diff(now, "second");
  const displayRemainingMinutesTotal = Math.ceil(remainingSeconds / 60);
  const remainingHoursDisplay = Math.floor(displayRemainingMinutesTotal / 60);
  const remainingMinutesDisplay = displayRemainingMinutesTotal % 60;

  return (
    <TimelineItem>
      <TimelineSeparator gap={isCompact ? 1 : undefined}>
        <TimelineTrack />
        <TimelineIcon>
          <Icon as={MdEmojiFoodBeverage} boxSize={isCompact ? 4 : 5} />
        </TimelineIcon>
      </TimelineSeparator>
      <TimelineContent>
        <Text color="muted" fontSize={isCompact ? "sm" : "lg"}>
          Volný čas ({totalHours} h {totalRemainingMinutes} min)
        </Text>
        {isActive && (
          <HStack
            ml={
              isCompact
                ? { base: 0, xs: 0, "xs+": 1, sm: 2 }
                : { base: 0, xs: 1, "xs+": 3, sm: 5 }
            }
          >
            <Icon as={MdAvTimer} boxSize={isCompact ? 4 : 5} color="muted" />
            <Text color="muted" fontSize={isCompact ? "xs" : "md"}>
              Zbývá {remainingHoursDisplay} h {remainingMinutesDisplay} min
            </Text>
          </HStack>
        )}
      </TimelineContent>
    </TimelineItem>
  );
}

/**
 * Komponenta pro zobrazení přechodů mezi lekcemi.
 * Přidali jsme parametr isCompact pro úpravu paddingu a velikosti ikon.
 */
function TransferItem({
  fromLocation,
  toLocation,
  children,
  isCompact = false,
}: {
  fromLocation: string;
  toLocation: string;
  children?: React.ReactNode;
  isCompact?: boolean;
}) {
  if (
    (fromLocation === "HON" && toLocation === "HOS") ||
    (fromLocation === "HOS" && toLocation === "HON")
  ) {
    return null;
  }

  const fromMapping: Record<string, string> = {
    HON: "Horské",
    HOS: "Horské",
    FLO: "Florence",
    KON: "Konviktu",
  };

  const toMapping: Record<string, string> = {
    HON: "Horskou",
    HOS: "Horskou",
    FLO: "Florenc",
    KON: "Konvikt",
  };

  let transferText = "Přesun mezi budovami";
  const from = fromMapping[fromLocation];
  const to = toMapping[toLocation];

  if (from && to) {
    transferText = `Přesun z ${from} na ${to}`;
  }

  return (
    <TimelineItem>
      <TimelineSeparator gap={isCompact ? 1 : undefined}>
        <TimelineTrack />
        <TimelineIcon>
          <Icon
            as={MdOutlineTransferWithinAStation}
            boxSize={isCompact ? 4 : 5}
          />
        </TimelineIcon>
        <TimelineTrack />
      </TimelineSeparator>
      <TimelineContent>
        <Box py={isCompact ? 2 : 4}>
          <Text color="muted" fontSize={isCompact ? "sm" : "lg"}>
            {transferText}
          </Text>
          {children}
        </Box>
      </TimelineContent>
    </TimelineItem>
  );
}
  const [settings] = useState<SettingsType>(() => {
    const stored = localStorage.getItem("rozvrh.settings");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error("Chyba při parsování nastavení:", error);
        return defaultSettings;
      }
    }
    return defaultSettings;
  });
  const isCompact = settings.layout === "compact";

  const [error, setError] = useState<{
    status: "error" | "info" | "success" | "warning";
    description: string;
  } | null>(null);
  const [date, setDate] = useState<{ startValue: Date | null }>({
    startValue: null,
  });
  const [timetableDataState, setTimetableDataState] =
    useState<TimetableData | null>(null);
  const [userNew, setUserNew] = useState(false);
  type SemesterDates = { start: dayjs.Dayjs; end: dayjs.Dayjs };
  const [semesterDatesState, setSemesterDatesState] =
    useState<SemesterDates | null>(null);
  const [holidays, setHolidays] = useState<
    Array<{ date: string; isHoliday: boolean; holidayName: string | null }>
  >([]);
  const [hasPicked, setHasPicked] = useState(false);
  const [hasPickedDateBeforeOrToday, setHasPickedDateBeforeOrToday] =
    useState(false);
  const [previousBuildingCode, setPreviousBuildingCode] = useState<
    string | null
  >("");
  const [currentBuildingCode, setCurrentBuildingCode] = useState<string | null>(
    ""
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [now, setNow] = useState(dayjs());
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(dayjs());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Pomocná funkce pro formátování data
  function formatDate(d: Date): string {
    return dayjs(d).format("DD.MM.YYYY");
  }

  // Načtení dat z localStorage a reset vybraného data
  const handleRefresh = () => {
    setUserNew(false);
    setHasPicked(false);
    setDate({ startValue: null });
    const storedData = localStorage.getItem("rozvrh.data");
    const storedSemesterDates = localStorage.getItem("rozvrh.semesterDates");
    const storedFaculty = localStorage.getItem("rozvrh.faculty");

    if (!storedData && !storedSemesterDates && !storedFaculty) {
      setUserNew(true);
      setTimetableDataState(null);
      setSemesterDatesState(null);
      return;
    }
    if (!storedData || !storedSemesterDates || !storedFaculty) {
      setError({
        status: "error",
        description:
          "Nepodařilo se načíst rozvrh. Zkuste rozvrh synchronizovat.",
      });
      setTimetableDataState(null);
      setSemesterDatesState(null);
      return;
    }
    try {
      const parsedData = JSON.parse(storedData);
      setTimetableDataState(parsedData);
    } catch (error) {
      console.error("Invalid timetable data format:", error);
      setError({
        status: "error",
        description:
          "Nepodařilo se načíst rozvrh. Zkuste rozvrh synchronizovat.",
      });
      setTimetableDataState(null);
      return;
    }
    try {
      const semester = JSON.parse(storedSemesterDates);
      setSemesterDatesState({
        start: dayjs(semester.start),
        end: dayjs(semester.end),
      });
    } catch (error) {
      console.error("Invalid semester dates format:", error);
      setError({
        status: "error",
        description:
          "Nepodařilo se načíst rozvrh. Zkuste rozvrh synchronizovat.",
      });
      setSemesterDatesState(null);
      return;
    }
    try {
      JSON.parse(storedFaculty);
    } catch (error) {
      console.error("Invalid faculty format:", error);
      setError({
        status: "error",
        description:
          "Nepodařilo se načíst rozvrh. Zkuste rozvrh synchronizovat.",
      });
      return;
    }
    setError(null);
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  // Nastavení výchozího data dle semestru
  useEffect(() => {
    if (semesterDatesState && !date.startValue && !hasPicked) {
      const today = dayjs();
      let defaultDate;
      if (today.isBefore(semesterDatesState.start)) {
        defaultDate = semesterDatesState.start;
      } else if (today.isAfter(semesterDatesState.end)) {
        defaultDate = semesterDatesState.end;
      } else {
        defaultDate = today;
      }
      setDate({ startValue: defaultDate.toDate() });
    }
  }, [semesterDatesState, date.startValue, hasPicked]);

  // Načtení svátků pro celý semestr
  useEffect(() => {
    if (semesterDatesState) {
      const start = semesterDatesState.start.format("YYYY-MM-DD");
      const days =
        semesterDatesState.end.diff(semesterDatesState.start, "day") + 1;
      fetch(`https://svatkyapi.cz/api/day/${start}/interval/${days}`)
        .then((res) => res.json())
        .then((data) => setHolidays(data))
        .catch((error) => console.error("Chyba při načítání svátků:", error));
    }
  }, [semesterDatesState]);

  const computeLessonsForDate = (d: dayjs.Dayjs) => {
    if (!semesterDatesState || !timetableDataState) {
      return [];
    }
    if (
      d.isBefore(semesterDatesState.start) ||
      d.isAfter(semesterDatesState.end)
    ) {
      return [];
    }
    const semesterWeekNumber =
      Math.floor(d.diff(semesterDatesState.start, "day") / 7) + 1;
    const calendarWeekNumber = d.week();
    const jsDay = d.day() === 0 ? 7 : d.day();

    const dayEntries = timetableDataState.timetable.elements.filter((entry) => {
      if (entry.dayNumber !== jsDay) return false;
      if (entry.weeks.length === 0 && !entry.evenOddWeek) return true;
      if (entry.weeks.length > 0 && !entry.weeks.includes(semesterWeekNumber))
        return false;
      if (entry.evenOddWeek === "S" && calendarWeekNumber % 2 !== 0)
        return false;
      if (entry.evenOddWeek === "L" && calendarWeekNumber % 2 === 0)
        return false;
      return true;
    });
    const computedLessons = dayEntries.map((entry) => {
      const lessonStart = dayjs(
        `${d.format("DD.MM.YYYY")} ${entry.ticketStart}`,
        "DD.MM.YYYY HH:mm"
      );
      const lessonEnd = dayjs(
        `${d.format("DD.MM.YYYY")} ${entry.ticketEnd}`,
        "DD.MM.YYYY HH:mm"
      );
      return { ...entry, start: lessonStart, end: lessonEnd };
    });
    return computedLessons.sort((a, b) => a.start.diff(b.start));
  };

  const allLessons = useMemo(() => {
    if (!date.startValue) return [];
    return computeLessonsForDate(dayjs(date.startValue));
  }, [semesterDatesState, timetableDataState, date.startValue]);

  const isTodaySelected = date.startValue
    ? dayjs(date.startValue).isSame(now, "day")
    : false;
  const activeLessons = useMemo(() => {
    if (isTodaySelected) {
      return allLessons.filter((lesson) =>
        now.isBefore(lesson.end.add(20, "minute"))
      );
    } else {
      return allLessons;
    }
  }, [allLessons, now, isTodaySelected]);

  // Automatické přepínání dne, pokud je vybraný dnešní den a aktivní lekce již neprobíhají
  useEffect(() => {
    if (!date.startValue) return;
    if (!isTodaySelected) return;
    if (hasPickedDateBeforeOrToday) return;
    if (activeLessons.length === 0) {
      let nextDay = dayjs(date.startValue).add(1, "day");
      while (
        semesterDatesState &&
        nextDay.isSameOrBefore(semesterDatesState.end)
      ) {
        const lessonsForNextDay = computeLessonsForDate(nextDay);
        if (lessonsForNextDay && lessonsForNextDay.length > 0) {
          setDate({ startValue: nextDay.toDate() });
          break;
        }
        nextDay = nextDay.add(1, "day");
      }
    }
  }, [
    date.startValue,
    now,
    activeLessons,
    semesterDatesState,
    isTodaySelected,
    hasPickedDateBeforeOrToday,
  ]);

  const transitions = useMemo(() => {
    const result = [];
    for (let i = 0; i < allLessons.length - 1; i++) {
      const currentLesson = allLessons[i];
      const nextLesson = allLessons[i + 1];
      const currentBld =
        currentLesson.room && currentLesson.room.location
          ? currentLesson.room.location.code
          : "Neznámá budova";
      const nextBld =
        nextLesson.room && nextLesson.room.location
          ? nextLesson.room.location.code
          : "Neznámá budova";
      if (currentBld !== nextBld) {
        const showDeparture =
          now.isAfter(currentLesson.end.subtract(20, "minute")) &&
          now.isBefore(nextLesson.start.add(20, "minute"));
        result.push({
          key: i,
          currentBld,
          nextBld,
          showDeparture,
        });
      }
    }
    return result;
  }, [allLessons, now]);

  const renderDailyScheduleTimeline = (selectedDate: Date) => {
    const formattedSelectedDate = dayjs(selectedDate).format("YYYY-MM-DD");
    const selectedDay = dayjs(selectedDate);
    const holiday = holidays.find(
      (h) => h.date === formattedSelectedDate && h.isHoliday
    );
    if (holiday) {
      return (
        <HStack justify="center">
          <Icon as={MdInfoOutline} boxSize={isCompact ? 5 : 6} />
          <Text fontSize={isCompact ? "sm" : "xl"}>
            V tento den neprobíhá výuka ({holiday.holidayName}).
          </Text>
        </HStack>
      );
    }
    const lessonsForDay = allLessons;
    const icsForDay =
      timetableDataState?.ics?.filter((event) =>
        selectedDay.isSame(dayjs(event.start), "day")
      ) || [];
    if (lessonsForDay.length === 0) {
      return (
        <HStack justify="center">
          <Icon as={MdInfoOutline} boxSize={isCompact ? 5 : 6} />
          <Text fontSize={isCompact ? "sm" : "xl"}>
            V tento den není žádná hodina.
          </Text>
        </HStack>
      );
    }
    if (icsForDay.length === 0) {
      return (
        <HStack justify="center">
          <Icon as={MdInfoOutline} boxSize={isCompact ? 5 : 6} />
          <Text fontSize={isCompact ? "sm" : "xl"}>
            V tento den neprobíhá výuka (volno/prázdniny/speciální den).
          </Text>
        </HStack>
      );
    }
    const timelineItems = [];
    for (let i = 0; i < allLessons.length; i++) {
      const lesson = allLessons[i];
      let isActive = false;
      if (!settings.dynamicHiding) {
        isActive = true;
      } else {
        if (isTodaySelected && activeLessons.length === 0) {
          isActive = true;
        } else {
          isActive = isTodaySelected
            ? now.isBefore(lesson.end.add(20, "minute"))
            : true;
        }
      }
      if (isActive) {
        const isParallel = allLessons.some(
          (other, idx) =>
            idx !== i &&
            lesson.start.isBefore(other.end) &&
            other.start.isBefore(lesson.end)
        );
        const isInProgress =
          now.isAfter(lesson.start) && now.isBefore(lesson.end);
        const cardPadding = isInProgress ? (isCompact ? 2 : 4) : 0;
        timelineItems.push(
          <TimelineItem key={`lesson-${i}`} alignItems="start">
            <TimelineSeparator>
              <TimelineTrack flex="0" />
              <TimelineIcon>
                <Badge
                  rounded="full"
                  borderWidth="2px"
                  borderColor={
                    lesson.type.code === "C"
                      ? "yellow.300"
                      : lesson.type.code === "P"
                      ? "green.300"
                      : "gray.300"
                  }
                  bg={
                    lesson.type.code === "C"
                      ? "yellow.300"
                      : lesson.type.code === "P"
                      ? "green.300"
                      : "gray.300"
                  }
                  boxSize="13px"
                />
              </TimelineIcon>
              <TimelineTrack />
            </TimelineSeparator>
            <TimelineContent width="100%">
              <Card mb={isInProgress && isParallel ?  2 : 0} variant={isInProgress ? "outline" : "transparent"}>
                <CardHeader pl={cardPadding} py={isCompact ? 1 : undefined}>
                  <Stack spacing={isCompact ? 1 : 2}>
                    <HStack
                      ml={
                        isCompact
                          ? { base: 0, xs: 0, "xs+": 1, sm: 2 }
                          : { base: 0, xs: 1, "xs+": 3, sm: 5 }
                      }
                    >
                      {settings.subjectColor && (
                        <CircleIcon
                          boxSize={isCompact ? 4 : 6}
                          color={randomColor({
                            string:
                              (lesson.courseView?.code || "") +
                              (lesson.courseView?.nameCs || "Neznámý"),
                          })}
                        />
                      )}
                      <Heading size={isCompact ? "sm" : "md"}>
                        {lesson.courseView
                          ? lesson.courseView.nameCs
                          : "Neznámý předmět"}
                      </Heading>
                    </HStack>
                    <Stack
                      direction="row"
                      spacing={isCompact ? 1 : 2}
                      flexWrap="wrap"
                    >
                      <Badge fontSize={isCompact ? "2xs" : undefined}>
                        {lesson.courseView ? lesson.courseView.code : "-"}
                      </Badge>
                      {lesson.type.code === "C" ? (
                        <Badge
                          colorScheme="yellow"
                          fontSize={isCompact ? "2xs" : undefined}
                        >
                          Cviko
                        </Badge>
                      ) : (
                        lesson.type.code === "P" && (
                          <Badge
                            colorScheme="green"
                            fontSize={isCompact ? "2xs" : undefined}
                          >
                            Přednáška
                          </Badge>
                        )
                      )}
                      {isParallel && (
                        <Badge
                          colorScheme="blue"
                          fontSize={isCompact ? "2xs" : undefined}
                        >
                          Souběžná hodina
                        </Badge>
                      )}
                    </Stack>
                  </Stack>
                </CardHeader>
                <CardBody
                  pt={0}
                  pl={cardPadding}
                  pb={isCompact ? 2 : undefined}
                >
                  <StructuredList p={0}>
                    <StructuredListItem
                      px={isCompact ? 0 : undefined}
                      py={isCompact ? 1 : undefined}
                    >
                      <StructuredListCell
                        fontSize={isCompact ? "sm" : "lg"}
                        pr={isCompact ? 0 : undefined}
                      >
                        <FiClock />
                      </StructuredListCell>
                      <StructuredListCell
                        fontSize={isCompact ? "sm" : "lg"}
                        flex="1"
                      >
                        <Text>
                          {lesson.ticketStart} –&gt; {lesson.ticketEnd}
                        </Text>
                      </StructuredListCell>
                    </StructuredListItem>
                    <StructuredListItem
                      px={isCompact ? 0 : undefined}
                      py={isCompact ? 1 : undefined}
                    >
                      <StructuredListCell
                        fontSize={isCompact ? "sm" : "lg"}
                        pr={isCompact ? 0 : undefined}
                      >
                        <FiMapPin />
                      </StructuredListCell>
                      <StructuredListCell
                        whiteSpace="nowrap"
                        fontSize={isCompact ? "sm" : "lg"}
                        flex="1"
                      >
                        {lesson.room
                          ? decodeBuildingLocation(lesson.room.roomNumber).text
                          : "Neznámá místnost"}
                      </StructuredListCell>
                    </StructuredListItem>
                    {settings.showTeachers &&
                      lesson.teachers &&
                      lesson.teachers.length > 0 && (
                        <StructuredListItem
                          px={isCompact ? 0 : undefined}
                          py={isCompact ? 1 : undefined}
                        >
                          <StructuredListCell
                            fontSize={isCompact ? "sm" : "lg"}
                            pr={isCompact ? 0 : undefined}
                          >
                            <FiUser />
                          </StructuredListCell>
                          <StructuredListCell
                            whiteSpace="nowrap"
                            fontSize={isCompact ? "sm" : "lg"}
                            flex="1"
                          >
                            {lesson.teachers.map((teacher, idx) => (
                              <Text key={idx}>
                                {teacher.lastName}{" "}
                                {teacher.firstName.slice(0, 1)}.
                              </Text>
                            ))}
                          </StructuredListCell>
                        </StructuredListItem>
                      )}
                  </StructuredList>
                </CardBody>
              </Card>
            </TimelineContent>
          </TimelineItem>
        );
      }
      if (i < allLessons.length - 1) {
        const nextLesson = allLessons[i + 1];
        const transition = transitions.find((t) => t.key === i);
        if (
          settings.showTransfers &&
          transition &&
          (!isTodaySelected || now.isBefore(nextLesson.start.add(20, "minute")))
        ) {
          timelineItems.push(
            <TransferItem
              key={`transition-${i}`}
              fromLocation={transition.currentBld}
              toLocation={transition.nextBld}
              isCompact={isCompact}
            >
              {isTodaySelected && transition.showDeparture && (
                <DepartureMessage
                isCompact={isCompact}
                  previousBuildingCode={transition.currentBld}
                  currentBuildingCode={transition.nextBld}
                  setPreviousBuildingCode={setPreviousBuildingCode}
                  setCurrentBuildingCode={setCurrentBuildingCode}
                  onOpen={onOpen}
                />
              )}
            </TransferItem>
          );
        }
        if (
          settings.showFreeTime &&
          nextLesson.start.diff(lesson.end, "minute") > 15
        ) {
          timelineItems.push(
            <FreeTimeItem
              key={`free-${i}`}
              freeStart={lesson.end}
              freeEnd={nextLesson.start}
              isCompact={isCompact}
            />
          );
        }
      }
    }
    return (
      <Box mt={2}>
        <Timeline>{timelineItems}</Timeline>
      </Box>
    );
  };

  return (
    <Box>
      <Container py={10}>
        <Flex>
          <Heading size={isCompact ? "md" : undefined} as="h1" mb={6}>
            ReRozvrh FD ČVUT{" "}
            <Badge colorScheme="green" verticalAlign="top">
              1.0.1
            </Badge>
          </Heading>
          <Spacer />
          <SyncModal handleRefresh={handleRefresh} />
          <Link href="/nastaveni" passHref>
            <IconButton
              colorScheme="gray"
              aria-label="Nastavení"
              ml={2}
              icon={<FiSettings />}
            />
          </Link>
          <InstallPwaIconButton />
        </Flex>
        {userNew ? (
          <EmptyStateContainer colorScheme="white" textAlign="center">
            <EmptyStateBody>
              <EmptyStateIcon as={FiLoader} />
              <EmptyStateTitle mt={4}>Vítejte v ReRozvrhu!</EmptyStateTitle>
              <EmptyStateDescription>
                Začněte synchronizováním vašeho rozvrhu v KOSu s ReRozvrhem.
                Synchronizaci provedete kliknutím na tlačítko níže. Pokud chcete
                používat ReRozvrh bez přihlašování,{" "}
                <Link 
          href={{
            pathname: '/nastaveni',
            query: { staticTimetablePrompt: true },
          }} passHref>
                  <Text as="span" textDecoration="underline">
                    přepněte ReRozvrh do statické verze
                  </Text>
                </Link>
                .
              </EmptyStateDescription>
              <EmptyStateActions>
                <SyncModal buttonTextVisible handleRefresh={handleRefresh} />
              </EmptyStateActions>
            </EmptyStateBody>
          </EmptyStateContainer>
        ) : error ? (
          <Alert status={error.status} mb={6}>
            <AlertIcon />
            {error.description}
          </Alert>
        ) : timetableDataState && semesterDatesState ? (
          <Box>
            <Box mb={isCompact ? "10px" : "20px"}>
              <Datepicker
                onChange={(d: DatepickerEvent) => {
                  const [startValue] = d;
                  setDate({ startValue: startValue || null });
                  if (startValue) {
                    const selectedDay = dayjs(startValue);
                    if (
                      selectedDay.isBefore(dayjs(), "day") ||
                      selectedDay.isSame(dayjs(), "day")
                    ) {
                      setHasPickedDateBeforeOrToday(true);
                    } else {
                      setHasPickedDateBeforeOrToday(false);
                    }
                  }
                  setHasPicked(true);
                }}
                startDate={semesterDatesState?.start.toDate()}
                endDate={semesterDatesState?.end.toDate()}
                locale={cs}
                startValue={date.startValue}
                isCompact={isCompact}
              />
            </Box>
            {date.startValue ? (
              <>
                <Heading pb={isCompact ? 2 : 3} size={isCompact ? "md" : undefined}>
                  {formatDate(date.startValue)}
                  {dayjs(date.startValue).isSame(now, "day") &&
                    ` ${now.format("HH:mm:ss")}`}
                </Heading>
                {renderDailyScheduleTimeline(date.startValue)}
              </>
            ) : (
              <>
                <Heading pb={isCompact ? 2 : 3}>&nbsp;</Heading>
                <HStack justify="center">
                  <Icon as={FiAlertTriangle} boxSize={isCompact ? 5 : 6} />
                  <Text fontSize={isCompact ? "sm" : "xl"}>
                    Nevybrán žádný den.
                  </Text>
                </HStack>
              </>
            )}
          </Box>
        ) : (
          <Flex align="center" justify="center" height="100%">
            <Spinner size="xl" />
          </Flex>
        )}
        {(!userNew && !settings.dontShowAboutText && (<><Divider my={4} />
         <Box my={2}>
          <Text fontSize="sm" color="gray.400" textAlign="center">
            ReRozvrh je neoficiální aplikace pro zobrazování rozvrhu skupin
            studentů FD ČVUT, optimalizovaná pro mobilní zařízení.
            <br />
            Nezodpovídám za obsah uvedený na tomto webu. Veškerá data o rozvrhu
            jsou získávána přes KOS API. Data o dopravě přes Golemio API.
            <br />
            Máte nějaký návrh na zlepšení? Neváhejte mě kontaktovat na
            ja@ondrejsmejkal.cz
          </Text>
        </Box></>)
        )}
      </Container>
      <DeparturesModal
        isOpen={isOpen}
        onClose={onClose}
        previousBuildingCode={previousBuildingCode}
        currentBuildingCode={currentBuildingCode}
      />
    </Box>
  );
}

/* ========================================
   Statická varianta rozvrhu (původní TimetableApp)
   ======================================== */
function StaticTimetable() {
  const [settings] = useState<SettingsType>(() => {
    const stored = localStorage.getItem("rozvrh.settings");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error("Chyba při parsování nastavení:", error);
        return defaultSettings;
      }
    }
    return defaultSettings;
  });
  const isCompact = settings.layout === "compact";
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [timetable, setTimetable] = useState<MergedTimetableEntryStatic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBehind, setIsBehind] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previousBuildingCode, setPreviousBuildingCode] = useState<
    string | null
  >(null);
  const [currentBuildingCode, setCurrentBuildingCode] = useState<string | null>(
    null
  );
  const [date, setDate] = useState<{ startValue: Date | null }>({
    startValue: dayjs().toDate(),
  });
  const [selectedGroup, setSelectedGroup] = useLocalStorageState(
    "selectedGroup",
    {
      defaultValue: { kosid: "233", name: "2-33" },
    }
  );
  const [, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadSelectedGroup = () => {
      const groupFromLocalStorage = localStorage.getItem("selectedGroup");
      if (groupFromLocalStorage) {
        setSelectedGroup(JSON.parse(groupFromLocalStorage));
        fetchTimetable(
          JSON.parse(groupFromLocalStorage).kosid,
          setTimetable,
          setLoading,
          setError
        );
      }
    };
    loadSelectedGroup();
    const intervalId = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setTimetable([]);
    fetchTimetable(selectedGroup.kosid, setTimetable, setLoading, setError);
  };

  const filteredTimetable = timetable.filter((entry) => {
    const entryStartDate = dayjs(entry.start).format("YYYY-MM-DD");
    const selectedDate = dayjs(date.startValue).format("YYYY-MM-DD");
    return entryStartDate === selectedDate;
  });

  const handleChange = (d: DatepickerEvent) => {
    const [startValue] = d;
    setDate({ startValue: startValue || null });
    const onChangeFilteredTimetable = timetable.filter((entry) => {
      const entryStartDate = dayjs(entry.start).format("YYYY-MM-DD");
      const selectedDate = dayjs(startValue).format("YYYY-MM-DD");
      return entryStartDate === selectedDate;
    });
    if (
      onChangeFilteredTimetable.length > 0 &&
      dayjs().isAfter(
        dayjs(
          onChangeFilteredTimetable[onChangeFilteredTimetable.length - 1].end
        )
      )
    ) {
      setIsBehind(dayjs(startValue).isSameOrBefore(dayjs(), "day"));
    } else {
      setIsBehind(dayjs(startValue).isBefore(dayjs(), "day"));
    }
  };

  return (
    <Box>
      <Container py={10}>
        <Flex>
          <Heading as="h1" mb={6} size={isCompact ? "md" : undefined}>
            ReRozvrh FD ČVUT{" "}
            <Badge colorScheme="green" verticalAlign="top">
              1.0.1
            </Badge>
          </Heading>
          <Spacer />
          <GroupSelector handleRefresh={handleRefresh} />
          <Link href="/nastaveni" passHref>
            <IconButton
              colorScheme="gray"
              aria-label="Nastavení"
              ml={2}
              icon={<FiSettings />}
            />
          </Link>
          
          <InstallPwaIconButton />
        </Flex>
        {loading ? (
          <Flex align="center" justify="center" height="100%">
            <Spinner size="xl" />
          </Flex>
        ) : error ? (
          <Alert status="error" mb={6}>
            <AlertIcon />
            {error}
          </Alert>
        ) : (
          <Box>  <Box mb={isCompact ? "10px" : "20px"}>
            <Datepicker
              onChange={handleChange}
              startDate={
                timetable.length > 0
                  ? dayjs(timetable[0].start).toDate()
                  : dayjs().subtract(4, "days").toDate()
              }
              endDate={
                timetable.length > 0
                  ? dayjs(timetable[timetable.length - 1].start).toDate()
                  : dayjs().add(1, "year").toDate()
              }
              locale={cs}
              startValue={date.startValue}
              isCompact={isCompact}
            />
            </Box>
              <HStack
                justifyContent="space-between"
                alignItems="flex-start"
                w="100%"
              >
                <Heading pb={isCompact ? 2 : 3} size={isCompact ? "md" : undefined}>
                  {filteredTimetable.length > 0 &&
                  dayjs().isSame(filteredTimetable[0].start, "day")
                    ? dayjs().format("DD.MM.YYYY HH:mm:ss")
                    : dayjs(date.startValue).isValid()
                    ? dayjs(date.startValue).format("DD.MM.YYYY")
                    : "-"}
                </Heading>
              </HStack>
              {filteredTimetable.length === 0 && (
                <HStack justify="center">
                  <MdInfoOutline size={isCompact ? 20 : 24} />
                  <Text fontSize={isCompact ? "md" : "xl"}>
                    V tento den není žádná hodina.
                  </Text>
                </HStack>
              )}<Box mt={2}>
              <Timeline>
                {filteredTimetable.map((entry, index) => {
                  const {
                    currentBuilding,
                    currentBuildingCode,
                    currentEndTime,
                    currentStartTime,
                    currentTime,
                    gapHours,
                    gapMinutes,
                    hasGap,
                    isBeforeNextSubjectGap,
                    isTransfer,
                    isParallel,
                    previousBuilding,
                    previousBuildingCode,
                    remainingTime,
                    remainingTimeString,
                    shouldShow,
                    timeGap,
                    twentyMinutesAfter,
                    twentyMinutesBefore,
                  } = computeTimetableData(
                    entry,
                    index,
                    isBehind,
                    filteredTimetable,
                    setDate,
                    setIsBehind
                  );
                  const displayItem = !settings.dynamicHiding
                    ? true
                    : shouldShow;
                  if (!displayItem && !isBehind) return null;
                  return (
                    <React.Fragment key={index}>
                      {settings.showTransfers &&
                        twentyMinutesAfter &&
                        isTransfer &&
                        currentTime.isBefore(twentyMinutesAfter) && (
                          <TimelineItem>
                            <TimelineSeparator gap={isCompact ? 1 : undefined}>
                              <TimelineTrack />
                              <TimelineIcon>
                                <Icon
                                  as={MdOutlineTransferWithinAStation}
                                  boxSize={isCompact ? 4 : 5}
                                />
                              </TimelineIcon>
                            </TimelineSeparator>
                            <TimelineContent>
                              <Box py={isCompact ? 2 : 4}>
                                <Text
                                  color="muted"
                                  fontSize={isCompact ? "sm" : "lg"}
                                >
                                  Přesun z{" "}
                                  {previousBuilding === "Horská"
                                    ? " Horské"
                                    : previousBuilding === "Florenc"
                                    ? " Florence"
                                    : previousBuilding === "Konvikt"
                                    ? " Konviktu"
                                    : previousBuilding === "Sýpka"
                                    ? " Sýpky"
                                    : " neznámo kam 💀"}{" "}
                                  na{" "}
                                  {currentBuilding === "Horská"
                                    ? "Horskou"
                                    : currentBuilding === "Sýpka"
                                    ? "Sýpku"
                                    : currentBuilding === "-"
                                    ? "neznámo kam 💀"
                                    : currentBuilding}
                                </Text>
                                {twentyMinutesBefore &&
                                  currentTime.isSameOrAfter(
                                    twentyMinutesBefore
                                  ) &&
                                  currentTime.isSameOrBefore(
                                    twentyMinutesAfter
                                  ) && (
                                    <HStack
                                      ml={{ base: 0, xs: 1, "xs+": 3, sm: 5 }}
                                    >
                                      <CircleIcon
                                        boxSize={isCompact ? 3 : 4}
                                        color="green.500"
                                      />
                                      {previousBuildingCode &&
                                        currentBuildingCode && (
                                          <DepartureMessageStatic
                                           isCompact={isCompact}
                                             previousBuildingCode={
                                              previousBuildingCode
                                            }
                                            currentBuildingCode={
                                              currentBuildingCode
                                            }
                                            setPreviousBuildingCode={
                                              setPreviousBuildingCode
                                            }
                                            setCurrentBuildingCode={
                                              setCurrentBuildingCode
                                            }
                                            onOpen={onOpen}
                                          />
                                        )}
                                    </HStack>
                                  )}
                              </Box>
                            </TimelineContent>
                          </TimelineItem>
                        )}
                      {settings.showFreeTime &&
                        hasGap &&
                        isBeforeNextSubjectGap && (
                          <TimelineItem>
                            <TimelineSeparator gap={isCompact ? 1 : undefined}>
                            
                              <TimelineTrack />
                              <TimelineIcon>
                                <Icon
                                  as={MdEmojiFoodBeverage}
                                  boxSize={isCompact ? 4 : 5}
                                />
                              </TimelineIcon>
                            </TimelineSeparator>
                            <TimelineContent>
                              <Text
                                color="muted"
                                  fontSize={isCompact ? "sm" : "lg"}
                              >
                                Volný čas ({gapHours > 0 ? `${gapHours}h ` : ""}
                                {gapMinutes}min)
                              </Text>
                              {remainingTime <= timeGap &&
                                remainingTime > 0 && (
                                  <HStack
                                    ml={{ base: 0, xs: 1, "xs+": 3, sm: 5 }}
                                  >
                                    <Icon
                                      as={MdAvTimer}
                                      boxSize={isCompact ? 4 : 5}
                                      color="muted"
                                    />
                                    <Text
                                      color="muted"
                                      fontSize={isCompact ? "xs" : "md"}
                                    >
                                      {remainingTimeString}
                                    </Text>
                                  </HStack>
                                )}
    
                            </TimelineContent>
                          </TimelineItem>
                        )}
                      <TimelineItem alignItems="start">
                        <TimelineSeparator>
                          <TimelineTrack flex="0" />
                          <TimelineIcon>
                            <Badge
                              rounded="full"
                              borderWidth="2px"
                              borderColor={
                                entry.classType === "C"
                                  ? "yellow.300"
                                  : entry.classType === "P"
                                  ? "green.300"
                                  : "gray.300"
                              }
                              bg={
                                entry.classType === "C"
                                  ? "yellow.300"
                                  : entry.classType === "P"
                                  ? "green.300"
                                  : "gray.300"
                              }
                              boxSize="13px"
                            />
                          </TimelineIcon>
                          <TimelineTrack />
                        </TimelineSeparator>
                        <TimelineContent width="100%">
                          <Card
                            mb={
                              currentTime.isSameOrAfter(currentStartTime) &&
                              (currentTime.isSameOrBefore(currentEndTime) ||
                                (twentyMinutesAfter &&
                                  currentTime.isSameOrBefore(
                                    twentyMinutesAfter
                                  )))
                                ? 2
                                : 0
                            }
                            variant={
                              currentTime.isSameOrAfter(currentStartTime) &&
                              (currentTime.isSameOrBefore(currentEndTime) ||
                                (twentyMinutesAfter &&
                                  currentTime.isSameOrBefore(
                                    twentyMinutesAfter
                                  )))
                                ? "outline"
                                : "transparent"
                            }
                          >
                            <CardHeader
                            py={isCompact ? 1 : undefined}
                              pl={
                                currentTime.isSameOrAfter(currentStartTime) &&
                                (currentTime.isSameOrBefore(currentEndTime) ||
                                  (twentyMinutesAfter &&
                                    currentTime.isSameOrBefore(
                                      twentyMinutesAfter
                                    )))
                                  ? isCompact
                                    ? 2
                                    : 4
                                  : 0
                              }
                            >
                              <Stack spacing={isCompact ? 1 : 2}>
                                <HStack
                                  ml={{ base: 0, xs: 1, "xs+": 3, sm: 5 }}
                                >
                                  <CircleIcon
                                    boxSize={isCompact ? 4 : 6}
                                    color={randomColor({
                                      string: entry.subject + entry.subjectName,
                                    })}
                                  />
                                  <Heading size={isCompact ? "sm" : "md"}>
                                    {entry.subjectName}
                                  </Heading>
                                </HStack>
                                <Stack
                                  direction="row"
                                  spacing={isCompact ? 1 : 2}
                                >
                                  <Badge fontSize={isCompact ? "2xs" : undefined}>
                                    {entry.subject}
                                  </Badge>
                                  {entry.classType === "C" ? (
                                    <Badge
                                      colorScheme="yellow"
                                      fontSize={isCompact ? "2xs" : undefined}
                                    >
                                      Cviko
                                    </Badge>
                                  ) : (
                                    entry.classType === "P" && (
                                      <Badge
                                        colorScheme="green"
                                        fontSize={isCompact ? "2xs" : undefined}
                                      >
                                        Přednáška
                                      </Badge>
                                    )
                                  )}
                                  {entry.rooms.length > 1 &&
                                    entry.lecturers.length > 1 && (
                                      <Badge
                                        colorScheme="purple"
                                        fontSize={isCompact ? "2xs" : undefined}
                                      >
                                        Dělená hodina
                                      </Badge>
                                    )}
                                  {isParallel && (
                                    <Badge
                                      colorScheme="red"
                                      fontSize={isCompact ? "2xs" : undefined}
                                    >
                                      Souběžná hodina
                                    </Badge>
                                  )}
                                </Stack>
                              </Stack>
                            </CardHeader>
                            <CardBody
                              pt={0}
                                  
                              pb={isCompact ? 2 : undefined}
                              pl={
                                currentTime.isSameOrAfter(currentStartTime) &&
                                (currentTime.isSameOrBefore(currentEndTime) ||
                                  (twentyMinutesAfter &&
                                    currentTime.isSameOrBefore(
                                      twentyMinutesAfter
                                    )))
                                  ? isCompact
                                    ? 2
                                    : 4
                                  : 0
                              }
                            >
                              <StructuredList p={0}>
                                <StructuredListItem
                      px={isCompact ? 0 : undefined}
                      py={isCompact ? 1 : undefined}
                    >
                                  <StructuredListCell
                                    fontSize={isCompact ? "sm" : "lg"}
                                    pr={isCompact ? 0 : undefined}
                                  >
                                    <FiClock />
                                  </StructuredListCell>
                                  <StructuredListCell
                                    fontSize={isCompact ? "sm" : "lg"}
                                    flex="1"
                                  >
                                    <Text>
                                      {new Date(entry.start).toLocaleTimeString(
                                        [],
                                        {
                                          timeStyle: "short",
                                        }
                                      )}{" "}
                                      –{" "}
                                      {new Date(entry.end).toLocaleTimeString(
                                        [],
                                        {
                                          timeStyle: "short",
                                        }
                                      )}
                                    </Text>
                                  </StructuredListCell>
                                </StructuredListItem>
                                <StructuredListItem
                      px={isCompact ? 0 : undefined}
                      py={isCompact ? 1 : undefined}
                    >
                                  <StructuredListCell
                                    fontSize={isCompact ? "sm" : "lg"}
                                    pr={isCompact ? 0 : undefined}
                                  >
                                    <FiMapPin />
                                  </StructuredListCell>
                                  <StructuredListCell
                                    whiteSpace="nowrap"
                                    fontSize={isCompact ? "sm" : "lg"}
                                    flex="1"
                                  >
                                    {entry.rooms.length > 1 &&
                                    entry.lecturers.length > 1
                                      ? entry.rooms.map((room, index) => {
                                          const roomInfo =
                                            decodeBuildingLocation(room).text;
                                          const lecturer =
                                            entry.lecturers[index] || "?";
                                          return (
                                            <Text key={index}>
                                              {roomInfo} ({lecturer})
                                            </Text>
                                          );
                                        })
                                      : entry.rooms
                                          .map(
                                            (room) =>
                                              decodeBuildingLocation(room).text
                                          )
                                          .join(", ")}
                                  </StructuredListCell>
                                </StructuredListItem>
                                {entry.rooms.length === 1 &&
                                  entry.lecturers.length === 1 &&
                                  entry.lecturers[0] !== null && (
                                    <StructuredListItem
                                    px={isCompact ? 0 : undefined}
                                    py={isCompact ? 1 : undefined}
                                  >
                                      <StructuredListCell
                                        fontSize={isCompact ? "sm" : "lg"}
                                        pr={isCompact ? 0 : undefined}
                                      >
                                        <FiUser />
                                      </StructuredListCell>
                                      <StructuredListCell
                                        whiteSpace="nowrap"
                                        fontSize={isCompact ? "sm" : "lg"}
                                        flex="1"
                                      >
                                        <Text>
                                          {entry.lecturers.join(", ")}
                                        </Text>
                                      </StructuredListCell>
                                    </StructuredListItem>
                                  )}
                              </StructuredList>
                            </CardBody>
                          </Card>
                        </TimelineContent>
                      </TimelineItem>
                    </React.Fragment>
                  );
                })}
              </Timeline></Box>
          </Box>
        )}
        <Stack direction="row" justify="center" mt={6}>
          <Button colorScheme="primary" onClick={handleRefresh}>
            Zaktualizovat rozvrh
          </Button>
        </Stack>
        {(!settings.dontShowAboutText && (<><Box my={2}>
          <Text fontSize="sm" color="gray.400" textAlign="center">
            ReRozvrh je neoficiální aplikace pro zobrazování rozvrhu skupin
            studentů FD ČVUT, optimalizovaná pro mobilní zařízení.
            <br />
            Nezodpovídám za obsah uvedený na tomto webu. Veškerá data o rozvrhu
            jsou získávána přes vyvoj.fd.cvut.cz API. Data o dopravě přes Golemio API.
            <br />
            Máte nějaký návrh na zlepšení? Neváhejte mě kontaktovat na
            ja@ondrejsmejkal.cz
          </Text>
        </Box></>))}
      </Container>
      <DeparturesModalStatic
        isOpen={isOpen}
        onClose={onClose}
        previousBuildingCode={previousBuildingCode}
        currentBuildingCode={currentBuildingCode}
      />
    </Box>
  );
}

/* ========================================
   Sloučená komponenta – výběr podle settings.timetableType
   ======================================== */
export default function MergedTimetable() {
  const [settings] = useState<SettingsType>(() => {
    const stored = localStorage.getItem("rozvrh.settings");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error("Chyba při parsování nastavení:", error);
        return defaultSettings;
      }
    }
    return defaultSettings;
  });
  return settings.timetableType === "dynamic" ? (
    <DynamicTimetable />
  ) : (
    <StaticTimetable />
  );
}
