import { useEffect, useState } from 'react';
import Auth from './components/Auth';
import MessageForm from './components/MessageForm';
import History from './components/History';
import { WalletProvider } from './context/WalletContext';
import HeadlessMfaView from './components/mfa/HeadlessMfaView';

type HistoryItem = {
  signer: string;
  originalMessage: string;
};

function App() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('signedHistory');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setHistory(parsed);
      } catch {
        setHistory([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('signedHistory', JSON.stringify(history));
  }, [history]);

  const handleResult = (data: HistoryItem) => {
    setHistory(prev => [data, ...prev]);
  };

  const handleLogout = () => {
    setHistory([]);
    localStorage.removeItem('signedHistory');
  };

  return (
    <WalletProvider>
      <Auth onLogout={handleLogout} />
      <HeadlessMfaView />
      <MessageForm onResult={handleResult} />
      <History history={history} />
    </WalletProvider>
  );
}

export default App;