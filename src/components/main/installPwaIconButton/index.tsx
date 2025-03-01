// components/InstallPwaIconButton.tsx
import { useEffect, useState } from 'react';
import { IconButton, Tooltip } from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';

// Definice vlastního rozhraní pro událost beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function InstallPwaIconButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      const evt = e as BeforeInstallPromptEvent;
      evt.preventDefault(); // Zabráníme automatickému zobrazení promptu
      setDeferredPrompt(evt);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt(); // Vyvoláme instalační prompt
    setDeferredPrompt(null);
  };

  // Zobrazíme tlačítko pouze pokud je instalace k dispozici
  if (!deferredPrompt) {
    return null;
  }

  return (
    <Tooltip label="Nainstalovat ReRozvrh do zařízení">
      <IconButton
            ml={2}
        aria-label="Nainstalovat aplikaci"
        icon={<DownloadIcon />}
        onClick={handleInstallClick}
      />
    </Tooltip>
  );
}
