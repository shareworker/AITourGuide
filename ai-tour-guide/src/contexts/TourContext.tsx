import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Message, Location, TourContextState } from '../types';

interface TourContextType extends TourContextState {
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateLocation: (location: Location | null) => void;
  setRecording: (isRecording: boolean) => void;
  setProcessing: (isProcessing: boolean) => void;
  clearMessages: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const updateLocation = (location: Location | null) => {
    setCurrentLocation(location);
  };

  const setRecording = (recording: boolean) => {
    setIsRecording(recording);
  };

  const setProcessing = (processing: boolean) => {
    setIsProcessing(processing);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <TourContext.Provider
      value={{
        messages,
        currentLocation,
        isRecording,
        isProcessing,
        addMessage,
        updateLocation,
        setRecording,
        setProcessing,
        clearMessages,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = (): TourContextType => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within TourProvider');
  }
  return context;
};
