export type SettingsType = {
    language: string;
    timetableType: "dynamic" | "static";
    layout: "normal" | "compact";
    subjectColor: boolean;
    dynamicHiding: boolean;
    showFreeTime: boolean;
    showTransfers: boolean;
    showTeachers: boolean;
    dontShowAboutText: boolean;
  };
  export const defaultSettings: SettingsType = {
    language: "cs",
    timetableType: "dynamic",
    layout: "normal",
    subjectColor: true,
    dynamicHiding: true,
    showFreeTime: true,
    showTransfers: true,
    showTeachers: true,
    dontShowAboutText: false,
  };