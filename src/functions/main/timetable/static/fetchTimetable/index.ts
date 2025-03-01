/* eslint-disable no-unused-vars */
import { MergedTimetableEntryStatic, TimetableEntryStatic } from "@/interfaces/main/timetable";
import axios from "axios";
import { mergeTimetableEntries } from "@/functions/main/timetable/static/mergeTimetableEntries";


export const fetchTimetable = async (
  group: string,
  setTimetable: (data: MergedTimetableEntryStatic[]) => void,
  setLoading: (state: boolean) => void,
  setError: (state: string | null) => void
) => {

  try {
  // API endpoint
  const API_URL =
    "https://vyvoj.fd.cvut.cz/rozvrh/calendar/groups-schedule/?kosid=" + group + "&history=true";
  
    const response = await axios.get(API_URL);
    const data: TimetableEntryStatic[] = response.data;

    const mergedTimetable = mergeTimetableEntries(data);

    setTimetable(mergedTimetable);
    setLoading(false);
  } catch (error) {
    setError(
      "Nepodařilo se načíst rozvrh. Pokud si myslíte, že chyba není na Vašem příjmači, kontaktujte ja@ondrejsmejkal.cz"
    );
    setLoading(false);
  }
};
