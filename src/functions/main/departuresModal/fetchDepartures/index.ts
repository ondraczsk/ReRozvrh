/* eslint-disable no-unused-vars */
import { ApiResponse } from "@/interfaces/main/departuresModal";

// Definice API_TOKEN, případně jej načtěte z prostředí
const API_TOKEN = process.env.NEXT_PUBLIC_GOLEMIO_API_KEY; 

export const fetchDepartures = async (
  previousBuildingCode: string | null,
  currentBuildingCode: string | null,
  setDepartures: (data: ApiResponse) => void,
  setIsFirstLoad: (state: boolean) => void,
  setRemainingSeconds: (seconds: number) => void,
  setError: (state: string | null) => void
) => {
  let API_URL = "";

  switch (`${previousBuildingCode}-${currentBuildingCode}`) {
    case "HON-FLO":
      API_URL =
        "https://api.golemio.cz/v2/public/departureboards?stopIds=%7B%220%22%3A%20%5B%22U876Z1P%22%5D%7D&limit=3&routeShortNames=14&routeShortNames=24&minutesAfter=70";
      break;
    case "HOS-FLO":
      API_URL =
        "https://api.golemio.cz/v2/public/departureboards?stopIds=%7B%220%22%3A%20%5B%22U876Z1P%22%5D%7D&limit=3&routeShortNames=14&routeShortNames=24&minutesAfter=70";
      break;
    case "HON-KON":
      API_URL =
        "https://api.golemio.cz/v2/public/departureboards?stopIds=%7B%220%22%3A%20%5B%22U876Z1P%22%5D%7D&limit=3&routeShortNames=18&minutesAfter=70";
      break;  
    case "HOS-KON":
      API_URL =
        "https://api.golemio.cz/v2/public/departureboards?stopIds=%7B%220%22%3A%20%5B%22U876Z1P%22%5D%7D&limit=3&routeShortNames=18&minutesAfter=70";
      break;   
    case "FLO-HON":
      API_URL =
        "https://api.golemio.cz/v2/public/departureboards?stopIds=%7B%220%22%3A%20%5B%22U32Z1P%22%5D%7D&limit=3&routeShortNames=14&routeShortNames=24&minutesAfter=70";
      break;
    case "FLO-HOS":
      API_URL =
        "https://api.golemio.cz/v2/public/departureboards?stopIds=%7B%220%22%3A%20%5B%22U32Z1P%22%5D%7D&limit=3&routeShortNames=14&routeShortNames=24&minutesAfter=70";
      break;
    case "FLO-KON":
      API_URL =
        "https://api.golemio.cz/v2/public/departureboards?stopIds=%7B%220%22%3A%20%5B%22U689Z101P%22%5D%7D&limit=3&routeShortNames=B&minutesAfter=70";
      break;
    case "KON-FLO":
      API_URL =
        "https://api.golemio.cz/v2/public/departureboards?stopIds=%7B%220%22%3A%20%5B%22U539Z102P%22%5D%7D&limit=3&routeShortNames=B&minutesAfter=70";
      break;
    case "KON-HON":
      API_URL =
        "https://api.golemio.cz/v2/public/departureboards?stopIds=%7B%220%22%3A%20%5B%22U539Z1P%22%5D%7D&limit=3&routeShortNames=18&minutesAfter=70";
      break; 
    case "KON-HOS":
      API_URL =
        "https://api.golemio.cz/v2/public/departureboards?stopIds=%7B%220%22%3A%20%5B%22U539Z1P%22%5D%7D&limit=3&routeShortNames=18&minutesAfter=70";
      break;
    default:
      API_URL =
        "https://api.golemio.cz/v2/public/departureboards?stopIds=%7B%220%22%3A%20%5B%22U539Z1P%22%5D%7D&limit=1&routeShortNames=1&minutesAfter=1";
  }

  try {
    if(API_TOKEN){
      const response = await fetch(API_URL, {
        headers: {
          "X-Access-Token": API_TOKEN
        }
      });
      const data: ApiResponse = await response.json();
      setDepartures(data);
      setIsFirstLoad(false);
      setRemainingSeconds(20);
    }    
  } catch (error) {
    setIsFirstLoad(false);
    setError(
      "Nepodařilo se načíst jízdní řád. Pokud si myslíte, že chyba není na Vašem příjmači, kontaktujte ja@ondrejsmejkal.cz"
    );
  }
};
