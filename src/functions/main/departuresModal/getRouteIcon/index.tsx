import { MetroIcon } from "@/components/main/departuresModal/metroIcon";
import { MdTram } from "react-icons/md";

export const getRouteIcon = (type: string) => {
    switch (type) {
      case "tram":
        return <MdTram size={20} />;
      case "metro":
        return <MetroIcon />;
      default:
        return null;
    }
  };