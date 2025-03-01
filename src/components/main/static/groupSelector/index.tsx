"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Spinner,
  HStack,
  Radio,
  RadioGroup,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Stack,
  ModalFooter,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import {
  StructuredList,
  StructuredListHeader,
  StructuredListItem,
  StructuredListCell,
  ChevronDownIcon,
} from "@saas-ui/react";
import { MdGroups } from "react-icons/md";
import useLocalStorageState from "use-local-storage-state";
import { Group } from "@/interfaces/main/static/groupSelector";
import { fetchGroupData } from "@/functions/main/static/groupSelector/fetchGroups";
import { groupByPrefix } from "@/functions/main/static/groupSelector/groupByPrefix";

const GroupSelector: React.FC<{ handleRefresh: () => void }> = ({ handleRefresh }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDataFetched, setIsDataFetched] = useState<boolean>(false);
  const [isSelectedGroupLoading, setIsSelectedGroupLoading] =
    useState<boolean>(true);
  const [selectedGroup, setSelectedGroup] = useLocalStorageState(
    "selectedGroup",
    { defaultValue: { kosid: "233", name: "2-33" } }
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const initialGroupRef = useRef(selectedGroup); // Store initial group

  useEffect(() => {
    const loadSelectedGroup = () => {
      setIsSelectedGroupLoading(true);
      const groupFromLocalStorage = localStorage.getItem("selectedGroup");
      if (groupFromLocalStorage) {
        setSelectedGroup(JSON.parse(groupFromLocalStorage));
      }
      setIsSelectedGroupLoading(false);
    };

    loadSelectedGroup();
  }, []);

  const handleGroupChange = (group: Group) => {
    setSelectedGroup({ kosid: group.KOSID.toString(), name: group.NAME });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    if (
      initialGroupRef.current.kosid !== selectedGroup.kosid
    ) {
      handleRefresh(); // Call handleRefresh only if the group changed
    }
  };

  const renderGroupItem = (group: Group) => (
    <StructuredListItem
      key={group.KOSID}
      as={HStack}
      spacing="4"
      borderBottom="1px"
      borderColor="gray.100"
      fontSize="md"
      _dark={{
        borderColor: "whiteAlpha.100",
      }}
      onClick={() => handleGroupChange(group)}
    >
      <StructuredListCell>{group.NAME}</StructuredListCell>
      <StructuredListCell>
        <Radio
          colorScheme="blue"
          value={group.KOSID.toString()}
          isChecked={selectedGroup.kosid === group.KOSID.toString()}
          size="md"
          onChange={() => handleGroupChange(group)}
        />
      </StructuredListCell>
    </StructuredListItem>
  );

  const groupedGroups = groupByPrefix(groups);

  return (
    <>
      <Button
        leftIcon={<MdGroups />}
        rightIcon={<ChevronDownIcon />}
        onClick={() => {
          initialGroupRef.current = selectedGroup; // Save the initial group when opening the modal
          setIsModalOpen(true);
          fetchGroupData(
            isDataFetched,
            setGroups,
            setIsDataFetched,
            setIsLoading,
            setError
          );
        }}
        colorScheme="gray"
        isLoading={isSelectedGroupLoading}
        loadingText="Načítám"
      >
        {selectedGroup.name}
      </Button>
      <Modal
        scrollBehavior="inside"
        isOpen={isModalOpen}
        onClose={handleModalClose}  // Use handleModalClose for both modal close actions
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Vyberte skupinu</ModalHeader>
          <ModalCloseButton />
          <ModalBody pt={0}>
            {error ? (
              <Alert status="error" mb={6}>
                <AlertIcon />
                {error}
              </Alert>
            ) : isLoading ? (
              <Stack direction="row" justify="center" mt={6}>
                <Spinner />
              </Stack>
            ) : (
              <RadioGroup value={selectedGroup.kosid}>
                <StructuredList pt={0}>
                  {Object.keys(groupedGroups).map((prefix) => (
                    <Box key={prefix} mb={4}>
                      <StructuredListHeader
                        fontWeight="normal"
                        bg="gray.200"
                        _dark={{ bg: "gray.700" }}
                        color="app-text"
                        position="sticky"
                        top="0"
                        zIndex="popover"
                      >
                        Skupiny {prefix}
                      </StructuredListHeader>
                      {groupedGroups[prefix].map(renderGroupItem)}
                    </Box>
                  ))}
                </StructuredList>
              </RadioGroup>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              isDisabled={!!error}
              colorScheme="blue"
              onClick={handleModalClose}  // Call handleModalClose for button as well
            >
              Uložit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupSelector;
