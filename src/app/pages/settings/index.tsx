"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Badge,
  Container,
  Divider,
  Flex,
  Heading,
  Spacer,
  Spinner,
  Text,
  Switch,
  Card,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { FiAlertTriangle, FiArrowLeft, FiCheck, FiHelpCircle, FiInfo } from "react-icons/fi";
import {
  Select,
  SelectButton,
  SelectList,
  SelectOption,
  StructuredList,
  StructuredListCell,
  StructuredListHeader,
  StructuredListItem,
} from "@saas-ui/react";
import { CZ, UA, GB } from "country-flag-icons/react/3x2";
import ThemeToggleButtonGroup from "@/components/settings/themeToggleButtonGroup";
import Link from "next/link";
import { defaultSettings, SettingsType } from "@/interfaces/settings";

// Jazykové volby
const languageOptions = [
  {
    label: "Čeština",
    value: "cs",
    flag: <CZ title="Čeština" style={{ width: "1.3em", marginRight: "0.5em" }} />,
  },
  {
    label: "English",
    value: "en",
    flag: <GB title="English" style={{ width: "1.3em", marginRight: "0.5em" }} />,
  },
  {
    label: "Українська",
    value: "ua",
    flag: <UA title="Українська" style={{ width: "1.3em", marginRight: "0.5em" }} />,
  },
];

const renderLanguageValue = (value: string) => {
  const option = languageOptions.find((opt) => opt.value === value[0]);
  return option ? (
    <HStack>
      <Box>{option.flag}</Box>
      <Box>{option.label}</Box>
    </HStack>
  ) : (
    value
  );
};

const LanguageSelect: React.FC<{ disabled?: boolean }> = ({ disabled }) => {
  return (
    <Select
      name="language"
      defaultValue="cs"
      size="sm"
      renderValue={renderLanguageValue}
      isDisabled={disabled}
    >
      <SelectButton />
      <SelectList>
        {languageOptions.map((option) => (
          <SelectOption key={option.value} value={option.value}>
            <HStack spacing="2">
              {option.flag}
              <span>{option.label}</span>
            </HStack>
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
};

function SettingsItem({
  title,
  description,
  control,
}: {
  title: string;
  description?: string;
  control: React.ReactNode;
}) {
  return (
    <StructuredListItem>
      <StructuredListCell flex="1">
        <Text fontWeight="bold">{title}</Text>
        {description && (
          <Text fontSize="sm" color="muted">
            {description}
          </Text>
        )}
      </StructuredListCell>
      <StructuredListCell>{control}</StructuredListCell>
    </StructuredListItem>
  );
}

export default function SettingsComponent() {
  // Lazy načtení nastavení z localStorage nebo defaultních hodnot
  const [settings, setSettings] = useState<SettingsType>(() => {
    const stored = localStorage.getItem("rozvrh.settings");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });
  const [isLoading, setIsLoading] = useState<boolean | null>(null);

  // Refs pro debounce logiku
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Uložíme počáteční nastavení – slouží ke kontrole, zda uživatel provedl změnu
  const initialSettingsRef = useRef<SettingsType>(settings);

  useEffect(() => {
    // Pokud se nastavení nezměnilo oproti počátečnímu, debounce se nespustí
    if (JSON.stringify(settings) === JSON.stringify(initialSettingsRef.current)) {
      return;
    }
    // Vyčistíme předchozí timery, pokud existují
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);

    // Nastavíme hlášku "Ukládám..."
    setIsLoading(true);
    // Spustíme timer na uložení – 1 sekundu
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem("rozvrh.settings", JSON.stringify(settings));
      // Aktualizujeme počáteční nastavení, aby se budoucí změny porovnávaly s aktuální hodnotou
      initialSettingsRef.current = settings;
      setIsLoading(false);
      // Po 2 sekundách změníme stav hlášky na výchozí (null)
      resetTimerRef.current = setTimeout(() => {
        setIsLoading(null);
      }, 2000);
    }, 1000);
  }, [settings]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  // Kontrola URL – pokud obsahuje query parametr staticTimetablePrompt=true, otevřeme modal
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const staticTimetablePrompt = searchParams.get("staticTimetablePrompt");
      if (staticTimetablePrompt === "true" && settings.timetableType === "dynamic") {
        onStaticModalOpen();

        // Odstraníme parametr z URL, aby zůstal odkaz čistý
        if (window.history.replaceState) {
          searchParams.delete("staticTimetablePrompt");
          const newQuery = searchParams.toString();
          const newUrl = newQuery ? `${window.location.pathname}?${newQuery}` : window.location.pathname;
          window.history.replaceState(null, "", newUrl);
        }
      }
    }
  }, []);

  // Handler, který přímo přijímá novou hodnotu z Selectu (nikoli event)
  const handleTimetableTypeChange = (value: string) => {
    // Pokud se mění z dynamického na statický, zobrazíme modal
    if (settings.timetableType === "dynamic" && value === "static") {
      onStaticModalOpen();
    } else {
      setSettings((prev) => ({
        ...prev,
        timetableType: value as "dynamic" | "static",
      }));
    }
  };

  const handleLayoutChange = (value: string) => {
    setSettings((prev) => ({
      ...prev,
      layout: value as "normal" | "compact",
    }));
  };

  const handleSwitchChange = (
    key: keyof Omit<SettingsType, "language" | "timetableType" | "layout">
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => ({ ...prev, [key]: e.target.checked }));
  };

  // Modal pro potvrzení smazání dat
  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleDeleteData = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // Modal pro potvrzení přepnutí na statický rozvrh
  const {
    isOpen: isStaticModalOpen,
    onOpen: onStaticModalOpen,
    onClose: onStaticModalClose,
  } = useDisclosure();

  return (
    <Box>
      <Container py={10}>
        <Flex>
          <Heading size="md" as="h1">
            ReRozvrh FD ČVUT{" "}
            <Badge colorScheme="green" verticalAlign="top">
              1.0.1
            </Badge>
          </Heading>
          <Spacer />
          <Link href="/" passHref>
            <Button as="a" size="xs" leftIcon={<FiArrowLeft />} colorScheme="gray">
              Zpět na rozvrh
            </Button>
          </Link>
        </Flex>
        <Divider my={4} />
        <HStack align="stretch">
          <Heading size="lg" as="h2">
            Nastavení
          </Heading>
          <Spacer />
          <Flex justifyContent="flex-end">
            {isLoading === true ? (
              <Text fontSize="md" py={1} color="muted" display="flex" alignItems="center">
                <Spinner size="xs" /><Box ml={1}>Ukládám...</Box>
              </Text>
            ) : isLoading === false ? (
              <Text fontSize="md" py={1} color="muted" display="flex" alignItems="center">
                <FiCheck /><Box ml={1}>Uloženo!</Box>
              </Text>
            ) : (
              <Text fontSize="md" py={1} color="muted" display="flex" alignItems="center">
                <FiInfo /><Box ml={1}>Změny se ukládají automaticky</Box>
              </Text>
            )}
          </Flex>
        </HStack>

        <Card variant="transparent">
          <StructuredList>
            <StructuredListHeader>Obecné</StructuredListHeader>
            <SettingsItem title="Jazyk aplikace" control={<LanguageSelect disabled />} />
            <SettingsItem
              title="Typ rozvrhu"
              description={"Způsob, jakým se budou získávat data pro ReRozvrh"}
              control={
                <Select
                  name="timetableType"
                  size="sm"
                  value={settings.timetableType}
                  onChange={handleTimetableTypeChange}
                  options={[
                    { label: "Dynamický", value: "dynamic" },
                    { label: "Statický", value: "static" },
                  ]}
                >
                  <SelectButton />
                  <SelectList />
                </Select>
              }
            />
            <SettingsItem
              title="Smazat data ReRozvrhu"
              description="Smazání dat uživatele z tohoto zařízení"
              control={<Button colorScheme="red" onClick={onOpen}>Smazat data</Button>}
            />
          </StructuredList>
        </Card>

        <Card variant="transparent">
          <StructuredList>
            <StructuredListHeader>Vzhled</StructuredListHeader>
            <SettingsItem
              title="Motiv aplikace"
              description="Ve výchozím nastavení automaticky"
              control={<ThemeToggleButtonGroup />}
            />
            <SettingsItem
              title="Rozvržení rozvrhu"
              description="Jak budou vypadat karty jednotlivých hodin"
              control={
                <Select
                  name="layout"
                  size="sm"
                  value={settings.layout}
                  onChange={handleLayoutChange}
                  options={[
                    { label: "Normální", value: "normal" },
                    { label: "Kompaktní", value: "compact" },
                  ]}
                >
                  <SelectButton />
                  <SelectList />
                </Select>
              }
            />
          </StructuredList>
        </Card>

        <Card variant="transparent">
          <StructuredList>
            <StructuredListHeader>Rozvrh</StructuredListHeader>
            <SettingsItem
              title="Dynamické mizení hodin"
              description="Hodiny budou v průběhu dne mizet"
              control={
                <Switch
                  aria-label="Dynamické mizení hodin"
                  isChecked={settings.dynamicHiding}
                  onChange={handleSwitchChange("dynamicHiding")}
                />
              }
            />
            <SettingsItem
              title="Barvička předmětu"
              description="Specifická barva vedle názvu předmětu"
              control={
                <Switch
                  aria-label="Barvička předmětu"
                  isChecked={settings.subjectColor}
                  onChange={handleSwitchChange("subjectColor")}
                />
              }
            />           
            <SettingsItem
              title="Zobrazovat volný čas"
              description="Zobrazení volného času mezi hodinami"
              control={
                <Switch
                  aria-label="Zobrazovat volný čas"
                  isChecked={settings.showFreeTime}
                  onChange={handleSwitchChange("showFreeTime")}
                />
              }
            />
            <SettingsItem
              title="Zobrazovat přesuny"
              description="Zobrazení přesunů mezi hodinami"
              control={
                <Switch
                  aria-label="Zobrazovat přesuny"
                  isChecked={settings.showTransfers}
                  onChange={handleSwitchChange("showTransfers")}
                />
              }
            />
            <SettingsItem
              title="Zobrazovat vyučující"
              description="Zobrazení vyučujících u hodiny"
              control={
                <Switch
                  aria-label="Zobrazovat vyučující"
                  isChecked={settings.showTeachers}
                  onChange={handleSwitchChange("showTeachers")}
                />
              }
            />
            <SettingsItem
              title="Nezobrazovat text o aplikaci"
              description="Pod hodinami rozvrhu"
              control={
                <Switch
                  aria-label="Nezobrazovat text o aplikaci"
                  isChecked={settings.dontShowAboutText}
                  onChange={handleSwitchChange("dontShowAboutText")}
                />
              }
            />
          </StructuredList>
        </Card>
      </Container>

      {/* Modal pro smazání dat */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader><Flex alignItems="center" gap={2}><FiAlertTriangle /> Opravdu chcete smazat data?</Flex></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="md">
              Smažou se veškerá data o rozvrhu, včetně nastavení aplikace. Po odstranění budete přesměrováni na úvodní stránku.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose} mr={3}>
              Ne
            </Button>
            <Button colorScheme="red" onClick={handleDeleteData}>
              Ano
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal pro potvrzení přepnutí na statický rozvrh */}
      <Modal
        isOpen={isStaticModalOpen}
        onClose={onStaticModalClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader><Flex alignItems="center" gap={2}><FiHelpCircle /> Změnit na statický rozvrh?</Flex></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="md">
              Přepnutím rozvrhu na statické získávání dat budete získávat pouze obecný rozvrh po celý kruh. To se může hodit například v prváku při obecných předmětech, avšak v pozdějších ročnících se zapsané předměty od obecného rozvrhu kruhu často poměrně liší.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={onStaticModalClose}
              mr={3}
            >
              Ne
            </Button>
            <Button
              colorScheme="primary"
              onClick={() => {
                setSettings((prev) => ({ ...prev, timetableType: "static" }));
                onStaticModalClose();
              }}
            >
              Ano
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
