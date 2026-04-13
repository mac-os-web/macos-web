import { createContext, useState, useContext } from 'react';

type NetworkContextValue = {
  isOnline: boolean;                    
  setOnline: (v: boolean) => void;      
};

const NetworkContext = createContext<NetworkContextValue | null>(null);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
 const [isOnline, setOnline] = useState(true);

 return (
   <NetworkContext.Provider value={{ isOnline, setOnline }}>
     {children}
   </NetworkContext.Provider>
 );

}

export function useNetwork() {
  const context = useContext(NetworkContext);
    if (!context) {
    throw new Error("useNetworkContext must be used within a NetworkProvider");
    }
    return context;
}