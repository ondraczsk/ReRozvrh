'use client';
import { useState, useEffect } from 'react';
import {
  Button,
  ButtonGroup,
  IconButton,
  useColorMode,
  useMediaQuery,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { SunMoon } from 'lucide-react';

const ThemeToggleButtonGroup = () => {
  const { setColorMode } = useColorMode(); // Odstranění colorMode, pokud není potřeba
  const [prefersDark] = useMediaQuery('(prefers-color-scheme: dark)');

  // Při prvním načtení zjistíme, jestli v localStorage existuje manuálně vybraná hodnota
  const [modePreference, setModePreference] = useState<'light' | 'dark' | 'auto'>(() => {
    const stored = localStorage.getItem('chakra-ui-color-mode');
    return stored === 'light' || stored === 'dark' ? stored : 'auto';
  });

  // Pokud je volba "auto", sledujeme změnu systémové preference a aktualizujeme color mode
  useEffect(() => {
    if (modePreference === 'auto') {
      setColorMode(prefersDark ? 'dark' : 'light');
      localStorage.removeItem('chakra-ui-color-mode');
    }
  }, [prefersDark, modePreference, setColorMode]);

  const handleThemeChange = (selectedTheme: 'light' | 'dark' | 'auto') => {
    setModePreference(selectedTheme);
    if (selectedTheme === 'auto') {
      localStorage.removeItem('chakra-ui-color-mode');
      setColorMode(prefersDark ? 'dark' : 'light');
    } else {
      localStorage.setItem('chakra-ui-color-mode', selectedTheme);
      setColorMode(selectedTheme);
    }
  };

  return (
    <ButtonGroup size="sm" isAttached variant="outline">
      <Button
        leftIcon={<SunMoon size={14} />}
        onClick={() => handleThemeChange('auto')}
        isActive={modePreference === 'auto'}
      >
        Automaticky
      </Button>
      <IconButton
        aria-label="Světlý"
        icon={<SunIcon />}
        onClick={() => handleThemeChange('light')}
        isActive={modePreference === 'light'}
      />
      <IconButton
        aria-label="Tmavý"
        icon={<MoonIcon />}
        onClick={() => handleThemeChange('dark')}
        isActive={modePreference === 'dark'}
      />
    </ButtonGroup>
  );
};

export default ThemeToggleButtonGroup;
