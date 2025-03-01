import { Group } from "@/interfaces/main/static/groupSelector";

export const groupByPrefix = (groups: Group[]): Record<string, Group[]> => {
    const grouped: Record<string, Group[]> = {};
    groups.forEach(group => {
      const prefix = group.NAME.split('-')[0]; // Get prefix (e.g., '0', '1', etc.)
      if (!grouped[prefix]) {
        grouped[prefix] = [];
      }
      grouped[prefix].push(group);
    });
    return grouped;
  };