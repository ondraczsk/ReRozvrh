"use client";
import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ButtonGroup,
  Spacer,
  Text,
  Alert,
  AlertIcon,
  Divider,
  Flex,
  Heading,
  Icon,
  useBreakpointValue,
  IconButton,
} from "@chakra-ui/react";
import { Form } from "@saas-ui/forms/zod";
import { Form as NoZodForm } from "@saas-ui/react";
import { FormLayout } from "@saas-ui/react";
import Link from "next/link";
import { Steps, StepsItem, StepsCompleted } from "@saas-ui/react";
import { FiCheckCircle, FiInfo, FiRefreshCcw } from "react-icons/fi";
import { KOSAuthSchema } from "@/schemas/main";
import dayjs from "dayjs";
import { getLocalStorageSizeInKB } from "@/functions/main/getLocalStorageSize";

interface MeData {
  person: { id: number; username: string; firstName: string; lastName: string };
  studies: Array<{
    id: number;
    faculty: { id: number; nameCs: string };
    semesters: Array<{
      id: string;
      nameCs: string;
      semesterStart: string;
      semesterEnd: string;
    }>;
  }>;
}

// Komponenta pro autentizační formulář (krok 1)
const AuthForm: React.FC<{
  handleModalClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (data: any) => Promise<void> | void;
  // eslint-disable-next-line no-unused-vars
  setIsStepValid: (valid: boolean) => void;
  submitRef: React.RefObject<HTMLButtonElement>;
}> = ({ onSubmit, setIsStepValid, submitRef, handleModalClose }) => {
  return (
    <Box>
      <Box display="flex" gap="2" alignItems="center">
        <FiInfo size={100} />
        <Text fontSize="md">
          Pro synchronizaci rozvrhu je nutné přihlášení přes KOS. ReRozvrh poté
          stáhne Váš aktuální rozvrh a uloží ho pouze na toto zařízení. Data o
          přihlášení se nikam neukládají
        {/* (viz GitHub)
         (viz{" "}<Link href="#" onClick={handleModalClose} passHref>
          <Text as="span" textDecoration="underline">
            prohlášení</Text>
          </Link>
          ) */}. Pokud se nechcete přihlašovat,{" "}
          <Link 
          href={{
            pathname: '/nastaveni',
            query: { staticTimetablePrompt: true },
          }} passHref onClick={handleModalClose}>
                  <Text as="span" textDecoration="underline">
                    přepněte ReRozvrh do statické verze
                  </Text>
                </Link>.
        </Text>
      </Box>
      <Divider my={3} borderColor="gray" />
      <Form
        schema={KOSAuthSchema}
        onSubmit={onSubmit}
        mode="onChange"
      >
        {({ Field, formState }) => {
          React.useEffect(() => {
            setIsStepValid(formState.isValid);
          }, [formState.isValid, setIsStepValid]);

          return (
            <FormLayout>
              <Field
                name="username"
                label="Uživatelské jméno"
                type="text"
                help="Uživatelské jméno, se kterým se přihlašujete do KOSu."
                rules={{ required: true }}
              />
              <Field
                name="password"
                type="password"
                label="Heslo"
                help="Heslo, se kterým se přihlašujete do KOSu."
              />
              {/* Skrytý submit button, aktivovaný programově */}
              <button
                type="submit"
                ref={submitRef}
                style={{ display: "none" }}
              />
            </FormLayout>
          );
        }}
      </Form>
    </Box>
  );
};

// Komponenta pro formulář ve výběru fakulty (krok 2)
// Komponenta pro formulář ve výběru fakulty (krok 2) bez zod schématu
const FacultyForm: React.FC<{
  // eslint-disable-next-line no-unused-vars
  onSubmit: (data: any) => Promise<void> | void;
  submitRef: React.RefObject<HTMLButtonElement>;
  selectedFacultyState: string | null;
  meData: MeData;
}> = ({ onSubmit, submitRef, selectedFacultyState, meData }) => {
  return (
    <NoZodForm
      onSubmit={onSubmit}
      defaultValues={{ faculty: selectedFacultyState || String(meData.studies[0].faculty.id) }}
    >
      {({ Field }) => (
        <FormLayout>
          <Field
            type="select"
            name="faculty"
            label="Vyberte fakultu"
            options={meData.studies.map((study) => ({
              label: study.faculty.nameCs,
              value: String(study.faculty.id),
            }))}
          />
          <button type="submit" ref={submitRef} style={{ display: "none" }} />
        </FormLayout>
      )}
    </NoZodForm>
  );
};

const SemesterForm: React.FC<{
  // eslint-disable-next-line no-unused-vars
  onSubmit: (data: any) => Promise<void> | void;
  selectedFaculty: string;
  selectedSemesterState: string | null;
  submitRef: React.RefObject<HTMLButtonElement>;
  meData: MeData;
}> = ({ onSubmit, selectedFaculty, selectedSemesterState, submitRef, meData }) => {
  // Vytvoříme pole možností pro select
  const options = meData.studies
  .filter((study) => study.faculty.id === Number(selectedFaculty))
  .flatMap((study) => study.semesters)
  .sort(
    (a, b) =>
      new Date(b.semesterEnd).getTime() - new Date(a.semesterEnd).getTime()
  )
  .filter((semester, index, self) =>
    index === self.findIndex((s) => s.id === semester.id)
  )
  .map((semester) => ({
    label: `${semester.id} - ${semester.nameCs}`,
    value: semester.id,
  }));


  const defaultSemester = options.length > 0 ? options[0].value : "";

  // Uchováme aktuálně vybraný semestr (ID) v state
  const [selectedSemesterId, setSelectedSemesterId] = useState(defaultSemester);

  // Najdeme detailní informace o vybraném semestru
  const selectedSemester = meData.studies
    .filter((study) => study.faculty.id === Number(selectedFaculty))
    .flatMap((study) => study.semesters)
    .find((semester) => semester.id === selectedSemesterId);

  // Pomocná funkce pro formátování data (lze upravit dle potřeby)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("cs-CZ");
  };

  return (
    <Box>
      <NoZodForm
        onSubmit={onSubmit}
        defaultValues={{ semester: selectedSemesterState || defaultSemester }}
      >
        {({ Field }) => (
          <FormLayout>
            <Field
              type="select"
              name="semester"
              label="Vyberte semestr"
              options={options}
              onChange={(value: string | string[]) => {
                // Pokud je value pole, vezmeme první prvek (podle vašich očekávání)
                const newValue = Array.isArray(value) ? value[0] : value;
                setSelectedSemesterId(newValue);
              }}
            />
            <button type="submit" ref={submitRef} style={{ display: "none" }} />
          </FormLayout>
        )}
      </NoZodForm>
      <Divider my={3} borderColor="gray" />
      <Box display="flex" gap="2" alignItems="center">
        <FiInfo size={20} />
        <Text fontSize="md">
          Rozvrh bude získán pro{" "}
          {selectedSemester
            ? `období ${formatDate(
                selectedSemester.semesterStart
              )} - ${formatDate(selectedSemester.semesterEnd)}`
            : "neznámé období"}
        </Text>
      </Box>
    </Box>
  );
};

interface SyncModalProps {
  handleRefresh: () => void;
  buttonTextVisible?: boolean;
}

const SyncModal: React.FC<SyncModalProps> = ({
  handleRefresh,
  buttonTextVisible,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [authCredentials, setAuthCredentials] = useState<{ username: string; password: string } | null>(null);


  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [meData, setMeData] = useState<MeData>();
  const [step, setStep] = useState(0);
  // Stav validity formuláře pro aktuální krok
  const [isStepValid, setIsStepValid] = useState(false);

  // Refs pro skryté submit buttony – krok 1 a krok 2
  const authSubmitRef = useRef<HTMLButtonElement>(null);
  const facultySubmitRef = useRef<HTMLButtonElement>(null);

  const semesterSubmitRef = useRef<HTMLButtonElement>(null);
  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const handleModalCloseAndReset = () => {
    setIsModalOpen(false);
    handleRefresh();
    setStep(0);
  };
  const back = () => {
    setStep(step - 1);
    setError(null);
  };

  // Asynchronní odeslání formuláře pro krok 1 (přihlášení)
  const onAuthSubmit = async (data: any) => {
    // Uložíme username a password do stavu
    setAuthCredentials({ username: data.username, password: data.password });
    setIsLoading(true);
    try {
      const response = await fetch("/api/kos/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            "Chyba při autentizaci. Zkontrolujte připojení k internetu, nebo kontaktujte správce."
        );
      }
      const responseData = await response.json();
      if (!responseData.me.studies[0].faculty.id) {
        throw new Error(
          "Chyba při autentizaci. Zkontrolujte připojení k internetu, nebo kontaktujte správce."
        );
      }
      setMeData(responseData.me);
      setIsLoading(false);
      setError(null);
      // Resetujeme validitu před přechodem na další krok
      setIsStepValid(false);
      setStep(1);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || "Došlo k chybě při odesílání dat");
    }
  };
  
  function getStudyIdByFaculty(selectedFaculty: number, meData: MeData): number | undefined {
    return meData.studies.find((study: any) => study.faculty.id === selectedFaculty)?.id;
}


  // Odeslání formuláře ve výběru fakulty (krok 2)
  const onFacultySubmit = async (data: any) => {
    setSelectedFaculty(data.faculty);
    setError(null);
    // Přechod do kroku 3
    setStep(2);
  };
  const onSemesterSubmit = async (data: any) => {
    setIsLoading(true);
    
    // Ověříme, že máme autentizační data
    if (!authCredentials) {
      setError("Chybí přihlašovací údaje.");
      setIsLoading(false);
      return;
    }
    const genericErrorMessage = "Chyba při získávání rozvrhu. Zkontrolujte připojení k internetu, nebo kontaktujte správce.";
    
    try {      
      if (!meData || !selectedFaculty || !data.semester) {
        throw new Error(genericErrorMessage);
      }
      const response = await fetch("/api/kos/timetable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: authCredentials.username,
          password: authCredentials.password,
          semesterId: data.semester,
          personId: meData.person.id,
          studyId: getStudyIdByFaculty(Number(selectedFaculty), meData)
        }),
      });
      const rozvrhData = await response.json();
      if (!response.ok) {
        throw new Error(genericErrorMessage);
      }
      const study = meData.studies.find((s) => s.faculty.id === Number(selectedFaculty));
      if (!study) {
        throw new Error(genericErrorMessage);
      }
      const semester = study.semesters.find((s) => s.id === data.semester);
      if (!semester) {
        throw new Error(genericErrorMessage);
      }
      // Uložení do localStorage
      const semesterDates = {
        start: dayjs(semester.semesterStart).toISOString(), // nebo můžete použít .format() s konkrétním formátem
        end: dayjs(semester.semesterEnd).toISOString(),
      };
      localStorage.setItem("rozvrh.semesterDates", JSON.stringify(semesterDates));
      localStorage.setItem("rozvrh.faculty", selectedFaculty);
      localStorage.setItem("rozvrh.data", JSON.stringify(rozvrhData));  
      setSelectedSemester(data.semester);
    setIsLoading(false);
    setError(null);
    setStep(3);
    } catch (err: any) {
      
      setIsLoading(false);
      setError(err.message || genericErrorMessage);

    }

  };
  
  
  // Tlačítko "Next" vyvolá příslušný skrytý submit button podle kroku
  const next = () => {
    if (step === 0) {
      authSubmitRef.current?.click();
    } else if (step === 1) {
      facultySubmitRef.current?.click();
    } else if (step === 2) {
      semesterSubmitRef.current?.click();
    } else {
      setStep(step + 1);
    }
  };

  const steps = [
    {
      name: "step 1",
      title: (
        <Text>
          Přihlášení
          <br />
          do KOSu
        </Text>
      ),
      children: (
        <AuthForm
          handleModalClose={handleModalClose}
          onSubmit={onAuthSubmit}
          setIsStepValid={setIsStepValid}
          submitRef={authSubmitRef}
        />
      ),
    },
    {
      name: "step 2",
      title: (
        <Text>
          Výběr
          <br />
          fakulty
        </Text>
      ),
      children: meData ? (
        <FacultyForm
          onSubmit={onFacultySubmit}
          selectedFacultyState={selectedFaculty}
          submitRef={facultySubmitRef}
          meData={meData}
        />
      ) : null,
    },
    {
      name: "step 3",
      title: (
        <Text>
          Výběr
          <br />
          semestru
        </Text>
      ),
      children:
        meData && selectedFaculty ? (
          <SemesterForm
            onSubmit={onSemesterSubmit}
            selectedFaculty={selectedFaculty}
            selectedSemesterState={selectedSemester}
            submitRef={semesterSubmitRef}
            meData={meData}
          />
        ) : null,
    },
  ]; 
  const isVisible = buttonTextVisible ? true : useBreakpointValue({ base: false, md: true });

  return (
    <>
  {isVisible ? (<Button
        leftIcon={<FiRefreshCcw />}
        colorScheme="gray"
        onClick={() => setIsModalOpen(true)}
      >
       Synchronizovat
      </Button>) : (<IconButton
            colorScheme="gray"
            aria-label="Synchronizovat"
            icon={<FiRefreshCcw />}
            
        onClick={() => setIsModalOpen(true)}
          />)
    
      }
      <Modal
        scrollBehavior="outside"
        isOpen={isModalOpen}
        onClose={step === 3 ? handleModalCloseAndReset : handleModalClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Synchronizace rozvrhu</ModalHeader>
          <ModalCloseButton />
          <ModalBody pt={0}>
            <Steps size={{base: "xs", "xs-sm": "sm", md: "md"}} colorScheme="blue" step={step} mb="2">
              {steps.map((args, i) => (
                <StepsItem key={i} {...args} />
              ))}
              <StepsCompleted py="4"><Flex align="center" justify="center" direction="column" gap={2}><Icon 
  as={FiCheckCircle} 
  boxSize="40px"   // místo size, protože Icon očekává boxSize
  stroke="green.500"
/><Heading size='md'>Rozvrh semestru {selectedSemester} byl úspešně stažen!</Heading>
        <Text fontSize="md" textAlign="center">
          Rozvrh je uložen pouze na tomto zařízení a má velikost <Text as='i'>{(getLocalStorageSizeInKB("rozvrh.data") + getLocalStorageSizeInKB("rozvrh.semesterDates")).toFixed(2)}</Text> KB. Platnost dat rozvrhu je neomezená. Pokud budete chtít smazat data rozvrhu, přejděte{" "}
          <Link href="/nastaveni" passHref onClick={handleModalClose}>
          <Text as="span" textDecoration="underline">
          do nastavení
          </Text></Link>. Pro aktualizaci rozvrhu (např. kvůli jinému semestru apod.) je nutné provést synchronizaci znovu.</Text></Flex></StepsCompleted>
            </Steps>
            {error && (
              <Alert status="error" mb={4}>
                <AlertIcon boxSize={5} />
                <Text fontSize="md">{error}</Text>
              </Alert>
            )}
          </ModalBody>
          <ModalFooter>
            <ButtonGroup width="100%">
              <Button onClick={back} isDisabled={step === 0} variant="ghost">
                Zpět
              </Button>
              <Spacer />
              <Button
                onClick={step === 3 ? handleModalCloseAndReset : next}
                isDisabled={(step === 0 && !isStepValid)}
                isLoading={isLoading}
                colorScheme="primary"
              >
                {step === 0 ? "Přihlásit se" : step === 3 ? "Zavřít" : "Další"}
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SyncModal;
