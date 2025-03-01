export const decodeBuildingLocation = (
  room: string | null
): { budova: string; kod: string; text: string } => {
  if (!room) {
    return {
      budova: "-",
      kod: "-",
      text: "?",
    };
  }

  let buildingCode = "";
  let roomNumber = "";
  let buildingName = "";

  // Check if the room is in the XX:XXX format
  if (room.includes(":")) {
    [buildingCode, roomNumber] = room.split(":");
  } else {
    // For rooms like S03, S02, S01, treat the whole room as roomNumber
    roomNumber = room;
  }

  // Handle special case for Sýpka rooms
  if (["S03", "S02", "S01"].includes(room)) {
    buildingName = "Sýpka";
  }

  switch (buildingCode) {
    case "HO":
      buildingName = "Horská";
      break;
    case "FL":
      buildingName = "Florenc";
      break;
    case "KO":
      buildingName = "Konvikt";
      break;
    case "DP":
      buildingName = "Pracoviště Děčín";
      break;
    default:
      if (!buildingName) {
        buildingName = buildingCode || ""; // If no match or no buildingCode, use the code itself or leave empty
      }
  }

  return {
    budova: buildingName || "-", // If no buildingCode, return "-"
    kod: buildingCode || roomNumber, // Use the full roomNumber as 'kod' if no buildingCode
    text: buildingName ? `${buildingName}, ${roomNumber}` : roomNumber, // If no buildingCode, display the roomNumber only
  };
};
