import React, { createContext, useContext, useState, ReactNode } from 'react';
import AlertModal from '../components/AlertModal';

interface AlertContextType {
  showAlert: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info') => Promise<void>;
  showConfirm: (title: string, message: string, type?: 'warning' | 'info') => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'alert' | 'confirm'>('alert');
  const [type, setType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  
  // By using Refs or just separate state for resolvers, we can handle the promise-based logic
  // But a simpler way for global singleton modals is to store the resolve function
  const [resolver, setResolver] = useState<(value: boolean) => void>(() => {});

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): Promise<void> => {
    return new Promise((resolve) => {
      setTitle(title);
      setMessage(message);
      setType(type);
      setMode('alert');
      setIsOpen(true);
      setResolver(() => (val: boolean) => resolve());
    });
  };

  const showConfirm = (title: string, message: string, type: 'warning' | 'info' = 'warning'): Promise<boolean> => {
    return new Promise((resolve) => {
      setTitle(title);
      setMessage(message);
      setType(type);
      setMode('confirm');
      setIsOpen(true);
      setResolver(() => resolve);
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    resolver(false);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    resolver(true);
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <AlertModal
        isOpen={isOpen}
        mode={mode}
        type={type}
        title={title}
        message={message}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    </AlertContext.Provider>
  );
};
