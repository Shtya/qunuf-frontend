'use client';

import api from '@/libs/axios';
import { Settings } from '@/types/dashboard/settings';
import { Country, State } from '@/utils/country';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Context value type
interface GlobalContextType {
  settings: Settings | null;
  countries: Country[];
  states: State[];
  loadingSettings: boolean;
  loadingCountries: boolean;
  loadingStates: boolean;
}

// Default value
const GlobalContext = createContext<GlobalContextType>({
  settings: null,
  countries: [],
  states: [],
  loadingSettings: true,
  loadingCountries: true,
  loadingStates: true,
});

// Provider
export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(true);

  // Fetch public settings
  const fetchSettings = async () => {
    try {
      setLoadingSettings(true);
      const res = await api.get<Settings>('settings/public');
      setSettings(res.data);
    } catch {
      setSettings(null);
    } finally {
      setLoadingSettings(false);
    }
  };

  // Fetch countries
  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      const res = await api.get<Country[]>('countries');
      setCountries(res.data);
    } catch {
      setCountries([]);
    } finally {
      setLoadingCountries(false);
    }
  };

  // Fetch states
  const fetchStates = async () => {
    try {
      setLoadingStates(true);
      const res = await api.get<State[]>('countries/states');
      setStates(res.data);
    } catch {
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchCountries();
    fetchStates();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        settings,
        countries,
        states,
        loadingSettings,
        loadingCountries,
        loadingStates,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

// Hook
export const useValues = () => useContext(GlobalContext);
