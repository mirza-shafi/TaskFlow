import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { getSystemTimezone } from '../utils/dateUtils';

interface SettingsContextType {
  appDate: Date;
  setAppDate: (date: Date) => void;
  isCustomDate: boolean;
  resetAppDate: () => void;
  timezone: string;
  setTimezone: (timezone: string) => void;
  enableTimezone: boolean;
  setEnableTimezone: (enable: boolean) => void;
  timeFormat: '12h' | '24h';
  setTimeFormat: (format: '12h' | '24h') => void;
  startWeekOn: 'sunday' | 'monday';
  setStartWeekOn: (day: 'sunday' | 'monday') => void;
  showWeekNumbers: boolean;
  setShowWeekNumbers: (show: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appDate, setAppDateState] = useState<Date>(new Date());
  const [isCustomDate, setIsCustomDate] = useState<boolean>(false);
  
  // Initialize from localStorage or default
  const [timezone, setTimezoneState] = useState<string>(() => 
    localStorage.getItem('taskflow_timezone') || getSystemTimezone()
  );
  const [enableTimezone, setEnableTimezoneState] = useState<boolean>(() => 
    localStorage.getItem('taskflow_enable_timezone') === 'true'
  );
  const [timeFormat, setTimeFormatState] = useState<'12h' | '24h'>(() => 
    (localStorage.getItem('taskflow_timeformat') as '12h' | '24h') || '12h'
  );
  const [startWeekOn, setStartWeekOnState] = useState<'sunday' | 'monday'>(() => 
    (localStorage.getItem('taskflow_start_week') as 'sunday' | 'monday') || 'sunday'
  );
  const [showWeekNumbers, setShowWeekNumbersState] = useState<boolean>(() => 
    localStorage.getItem('taskflow_show_week_numbers') === 'true'
  );

  useEffect(() => {
    if (isCustomDate) return;
    const interval = setInterval(() => {
      setAppDateState(new Date());
    }, 1000 * 60);
    return () => clearInterval(interval);
  }, [isCustomDate]);

  // Wrappers to persist on change
  const setTimezone = (tz: string) => {
    setTimezoneState(tz);
    localStorage.setItem('taskflow_timezone', tz);
  };

  const setEnableTimezone = (enable: boolean) => {
    setEnableTimezoneState(enable);
    localStorage.setItem('taskflow_enable_timezone', String(enable));
  };

  const setTimeFormat = (fmt: '12h' | '24h') => {
    setTimeFormatState(fmt);
    localStorage.setItem('taskflow_timeformat', fmt);
  };

  const setStartWeekOn = (day: 'sunday' | 'monday') => {
    setStartWeekOnState(day);
    localStorage.setItem('taskflow_start_week', day);
  };

  const setShowWeekNumbers = (show: boolean) => {
    setShowWeekNumbersState(show);
    localStorage.setItem('taskflow_show_week_numbers', String(show));
  };

  const setAppDate = (date: Date) => {
    setAppDateState(date);
    setIsCustomDate(true);
  };

  const resetAppDate = () => {
    setAppDateState(new Date());
    setIsCustomDate(false);
  };

  return (
    <SettingsContext.Provider 
      value={{ 
        appDate, 
        setAppDate, 
        isCustomDate, 
        resetAppDate,
        timezone,
        setTimezone,
        enableTimezone,
        setEnableTimezone,
        timeFormat,
        setTimeFormat,
        startWeekOn,
        setStartWeekOn,
        showWeekNumbers,
        setShowWeekNumbers
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
