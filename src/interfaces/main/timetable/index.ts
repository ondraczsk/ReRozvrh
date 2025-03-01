
export interface TimetableEntryStatic {
  start: string;
  end: string;
  subject: string;
  subjectName: string;
  classType: string;
  room: string;
  lecturer: string;
  lecturer2?: string;
}

export interface MergedTimetableEntryStatic {
  start: string;
  end: string;
  subject: string;
  subjectName: string;
  classType: string;
  lecturers: string[];
  rooms: string[];
}



/*new*/
export interface TimetableData {
  timetable: { elements: TimetableEntry[] };
  detailed: { elements: number[] };
  borders: { elements: BordersData[] };
  ics: IcsData[];
}

export interface TimetableEntry {
  id: number;
  parallelClass: ParallelClass;
  faculty: Faculty;
  department: Department;
  courseView?: CourseView;
  semester: Semester;
  dayNumber: number;
  hourNumber: number;
  hourCount: number;
  ticketStart: string;
  ticketEnd: string;
  minuteCount: number;
  type: ParallelType;
  room?: Room;
  weeks: number[];
  teachers: Teacher[];
  whoChanged: string;
  whenChanged: string;
  studyId: number;
  evenOddWeek?: string; // "S" nebo "L"
}
export interface IcsData {
  uid: string;
  summary: string;
  description: string;
  location: string;
  start: string;
  end: string;
}
export interface ParallelClass {
  id: number;
  faculty: Faculty;
  department: Department;
  courseView: CourseView;
  semester: Semester;
  capacity: number;
  capacityChecked: boolean;
  occupiedPlaces: number;
  registration: string;
  parallelType: ParallelType;
  parallelNumber: number;
  teacher1: TeacherReference;
  teachers: Teacher[];
  parallelClassNameCs?: string;
  whoChanged: string;
  whenChanged: string;
}

export interface Faculty {
  id: number;
}

export interface Department {
  id: number;
}

export interface CourseView {
  id: number;
  courseSemesterId: number;
  semester: Semester;
  code: string;
  nameCs: string;
  nameEn: string;
  completion: Completion;
  extent: string;
  credits: number;
  faculty: Faculty;
  department: Department;
  capacity: number;
  state: CourseState;
  studyForm?: StudyForm;
  teachingLanguage: TeachingLanguage;
  withoutSchedule: boolean;
  hasPrerequisite: boolean;
  forProgrammes: Programme[];
  programmeTypes: any[];
  occupied: number;
  module: boolean;
  forRegistration: boolean;
}

export interface Semester {
  id: string;
}

export interface Completion {
  listName: string;
  code: string;
}

export interface CourseState {
  listName: string;
  code: string;
}

export interface StudyForm {
  listName: string;
  code: string;
}

export interface TeachingLanguage {
  listName: string;
  code: string;
}

export interface Programme {
  id: number;
}

export interface ParallelType {
  listName: string;
  code: string;
  nameCs?: string;
  nameEn?: string;
}

export interface Room {
  id: number;
  roomNumber: string;
  nameCs: string;
  faculty: Faculty;
  location: Location;
  examCapacity: number;
  teachingCapacity: number;
  roomCode: string;
  type: RoomType;
}

export interface Location {
  listName: string;
  code: string;
  nameCs: string;
}

export interface RoomType {
  listName: string;
  code: string;
}

export interface Teacher {
  id: number;
  degreeBefore?: string;
  firstName: string;
  lastName: string;
  degreeAfter?: string;
  personEid: number;
  username: string;
  uuid: string;
  email: string;
  department: Department;
  workplace?: string;
  phoneNumber?: string;
}

export interface TeacherReference {
  id: number;
}

export interface BordersData {
  startTime: string;
  faculty: {id: number; };
  endTime: string;
}
