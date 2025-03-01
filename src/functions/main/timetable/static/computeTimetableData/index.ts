/* eslint-disable no-unused-vars */
// utilityFunctions.js
import dayjs from "dayjs";
import { MergedTimetableEntryStatic } from "@/interfaces/main/timetable";
import React from "react";
import { decodeBuildingLocation } from "@/functions/main/timetable/decodeBuildingLocation";
var isSameOrAfter = require("dayjs/plugin/isSameOrAfter");
var isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);


export const computeTimetableData = (
  entry: MergedTimetableEntryStatic,
  index: number,
  isBehind: boolean,
  filteredTimetable: MergedTimetableEntryStatic[],
  setDate: (
    value: React.SetStateAction<{
      startValue: Date | null;
    }>
  ) => void,
  setIsBehind: (value: React.SetStateAction<boolean>) => void
) => {
  const currentBuilding = decodeBuildingLocation(entry.rooms[0]).budova;
  const previousBuilding =
    index > 0
      ? decodeBuildingLocation(filteredTimetable[index - 1].rooms[0]).budova
      : null;
  const currentBuildingCode = decodeBuildingLocation(entry.rooms[0]).kod;
  const previousBuildingCode =
    index > 0
      ? decodeBuildingLocation(filteredTimetable[index - 1].rooms[0]).kod
      : null;

  const previousEndTime =
    index > 0 ? dayjs(filteredTimetable[index - 1].end) : null;
  const currentStartTime = dayjs(entry.start);
  const currentEndTime = dayjs(entry.end);
  const currentTime = dayjs();
  const startTime = dayjs(filteredTimetable[0].start);
  const isToday = currentTime.isSame(startTime, "day");

  if (
    !isBehind &&
    isToday &&
    currentTime.isAfter(
      dayjs(filteredTimetable[filteredTimetable.length - 1].end)
    )
  ) {
    const startValue = dayjs().add(1, "day").toDate();
    setDate((prev) => ({ ...prev, startValue }));
    setIsBehind(true);
  }

  const shouldShow = currentTime.isBefore(currentEndTime.add(15, "minute"));

  const transferTimeStart = previousEndTime;
  const transferTimeEnd = currentStartTime;

  let twentyMinutesBefore = transferTimeStart
    ? transferTimeStart.subtract(20, "minute")
    : null;
  let twentyMinutesAfter = transferTimeEnd
    ? transferTimeEnd.add(20, "minute")
    : null;

  const timeGap = previousEndTime
    ? currentStartTime.diff(previousEndTime, "minute")
    : 0;
  const hasGap = timeGap > 15;

  const gapHours = Math.floor(timeGap / 60);
  const gapMinutes = timeGap % 60;

  if (hasGap) {
    twentyMinutesAfter = transferTimeStart
      ? transferTimeStart.add(30, "minute")
      : null;
  }

  const isBeforeNextSubjectGap = currentTime.isBefore(currentStartTime);

  const remainingTime = currentStartTime.diff(currentTime, "minute");
  const remainingHours = Math.floor(remainingTime / 60);
  const remainingMinutes = remainingTime % 60;
  const remainingTimeString = `Zbývá ${
    remainingHours > 0 ? `${remainingHours} hod ` : ""
  }${remainingMinutes} min`;

  // New condition to check if there are two overlapping subjects
  const isOverlapping =
    previousEndTime && currentStartTime.isBefore(previousEndTime);

  // Modify isTransfer to account for overlapping subjects
  const isTransfer =
    !isOverlapping && previousBuilding && currentBuilding !== previousBuilding;

  // Check for parallel entries
  const previousEntryIsParallel =
    index > 0 &&
    dayjs(filteredTimetable[index - 1].start).isSame(currentStartTime) &&
    dayjs(filteredTimetable[index - 1].end).isSame(currentEndTime);

  const nextEntryIsParallel =
    index < filteredTimetable.length - 1 &&
    dayjs(filteredTimetable[index + 1].start).isSame(currentStartTime) &&
    dayjs(filteredTimetable[index + 1].end).isSame(currentEndTime);

  const isParallel = previousEntryIsParallel || nextEntryIsParallel;

  return {
    currentBuilding,
    currentBuildingCode,
    currentEndTime,
    currentStartTime,
    currentTime,
    gapHours,
    gapMinutes,
    hasGap,
    isBeforeNextSubjectGap,
    isTransfer, // updated isTransfer condition
    isParallel, // new isParallel condition
    previousBuilding,
    previousBuildingCode,
    remainingTime,
    remainingTimeString,
    shouldShow,
    timeGap,
    twentyMinutesAfter,
    twentyMinutesBefore,
  };
};
