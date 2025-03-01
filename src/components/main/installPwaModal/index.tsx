// components/InstallPwaModal.tsx
import { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Text
} from '@chakra-ui/react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function InstallPwaModal() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Nasloucháme události beforeinstallprompt a uložíme událost do stavu
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      const evt = e as BeforeInstallPromptEvent;
      evt.preventDefault(); // Zabráníme automatickému zobrazení promptu
      setDeferredPrompt(evt);

      // Pokud je v localStorage klíč 'rozvrh.data', otevřeme modal okamžitě
      if (localStorage.getItem('rozvrh.data')) {
        onOpen();
      }
      // Jinak modál otevřeme dle další logiky (viz useEffect níže)
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [onOpen]);

  // Otevřeme modal buď po zpoždění, nebo při první uživatelské interakci, pokud
  // localStorage nemá klíč 'rozvrh.data'
  useEffect(() => {
    if (deferredPrompt && !localStorage.getItem('rozvrh.data')) {
      // Zpoždění 5 sekund
      const timer = setTimeout(() => {
        onOpen();
      }, 5000);

      // Otevření modálu při první uživatelské interakci (kliknutí kdekoliv)
      const handleUserInteraction = () => {
        onOpen();
        clearTimeout(timer);
        document.removeEventListener('click', handleUserInteraction);
      };

      document.addEventListener('click', handleUserInteraction);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleUserInteraction);
      };
    }
  }, [deferredPrompt, onOpen]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Spuštění instalačního promptu
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('Uživatel přijal instalaci PWA');
    } else {
      console.log('Uživatel odmítl instalaci PWA');
    }
    setDeferredPrompt(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Instalace aplikace</ModalHeader>
        <ModalBody>
          <Text>
            Chcete nainstalovat tuto aplikaci jako PWA pro rychlejší přístup a lepší zážitek?
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Zavřít
          </Button>
          <Button colorScheme="blue" onClick={handleInstallClick}>
            Instalovat
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
