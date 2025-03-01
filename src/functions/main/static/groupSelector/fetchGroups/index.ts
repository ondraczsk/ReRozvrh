/* eslint-disable no-unused-vars */
import { Group } from "@/interfaces/main/static/groupSelector";

const API_URL =
  "https://vyvoj.fd.cvut.cz/rozvrh/rooms-list/test.php";

export const fetchGroupData = async (
    isDataFetched: boolean,
    setGroups: (state: Group[]) => void,
    setIsDataFetched: (state: boolean) => void,
    setIsLoading: (state: boolean) => void,
    setError: (state: string | null) => void
) => {
    if (!isDataFetched) {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      const filteredGroups: Group[] = data.filter((item: Group) => item.CATEGORY === 'groups');
      setGroups(filteredGroups);
      setIsDataFetched(true);
    } catch (error) {
      setError(
        "Nepodařilo se načíst skupiny. Pokud si myslíte, že chyba není na Vašem příjmači, kontaktujte ja@ondrejsmejkal.cz"
      );
    } finally {
      setIsLoading(false);
    }
  }
  };