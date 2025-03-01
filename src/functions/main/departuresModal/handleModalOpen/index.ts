/* eslint-disable no-unused-vars */
export const handleModalOpen = (
  prevCode: string,
  currCode: string,
  setPreviousBuildingCode: (code: string) => void,
  setCurrentBuildingCode: (code: string) => void,
  onOpen: () => void
) => {
  setPreviousBuildingCode(prevCode);
  setCurrentBuildingCode(currCode);
  onOpen();
};
