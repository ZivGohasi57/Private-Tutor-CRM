import { useState, useEffect } from 'react';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import StudentsPage from './pages/StudentsPage';
import LoginPage from './pages/LoginPage';
import { Loader2 } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 text-blue-600">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  // Show app if logged in, otherwise show login
  return (
    <>
      {user ? <StudentsPage /> : <LoginPage />}
    </>
  );
}

export default App;