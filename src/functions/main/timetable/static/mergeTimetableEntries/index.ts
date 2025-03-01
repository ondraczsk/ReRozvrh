import { MergedTimetableEntryStatic, TimetableEntryStatic } from "@/interfaces/main/timetable";

  export const mergeTimetableEntries = (
    data: TimetableEntryStatic[]
  ): MergedTimetableEntryStatic[] => {
    const mergedEntries: Record<string, MergedTimetableEntryStatic> = {};

    data.forEach((entry) => {
      const key = `${entry.start}-${entry.end}-${entry.subject}-${entry.subjectName}`;

      // If the key exists, merge the lecturer and room information
      if (mergedEntries[key]) {
        mergedEntries[key].lecturers.push(entry.lecturer);
        mergedEntries[key].rooms.push(entry.room);
      } else {
        // Create a new entry if it doesn't exist
        mergedEntries[key] = {
          start: entry.start,
          end: entry.end,
          classType: entry.classType,
          subject: entry.subject,
          subjectName: entry.subjectName,
          lecturers: [entry.lecturer],
          rooms: [entry.room],
        };
      }
    });

    // Return the merged entries as an array
    return Object.values(mergedEntries);
  };