import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { en } from '../locales/en';
import { vi } from '../locales/vi';

type LanguageType = 'en' | 'vi';

interface LocalizationContextType {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => Promise<void>;
  t: (key: string) => string;
  translations: typeof en | typeof vi;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<LanguageType>('en');

  const translations = language === 'en' ? en : vi;

  // Load language preference on app start
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('app-language');
        if (savedLanguage === 'en' || savedLanguage === 'vi') {
          setLanguageState(savedLanguage);
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      }
    };

    loadLanguagePreference();
  }, []);

  // Set language and persist to AsyncStorage
  const setLanguage = async (lang: LanguageType) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem('app-language', lang);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  // Get translation by key path (e.g., 'auth.signIn')
  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations;

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof result === 'string' ? result : key;
  };

  return (
    <LocalizationContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translations,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error(
      'useLocalization must be used within a LocalizationProvider'
    );
  }
  return context;
};
