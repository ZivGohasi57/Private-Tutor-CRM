import { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      
    } catch (err) {
      setError('שגיאה בהתחברות: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 text-center">
        
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full text-blue-600 dark:text-blue-400">
            <GraduationCap size={48} />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {isSignUp ? 'הרשמה לקליניקה' : 'ברוך הבא לקליניקה'}
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mb-8 text-sm">
          {isSignUp ? 'צור משתמש חדש לניהול העסק' : 'התחבר כדי לנהל את התלמידים שלך'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            type="email" 
            label="אימייל" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
          <Input 
            type="password" 
            label="סיסמה" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
          />

          {error && <p className="text-red-500 dark:text-red-400 text-xs font-bold">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? 'מתחבר...' : (isSignUp ? 'הרשמה' : 'כניסה')}
          </Button>
        </form>

        <div className="mt-6 text-sm">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            {isSignUp ? 'כבר רשום? התחבר כאן' : 'אין לך משתמש? הירשם עכשיו'}
          </button>
        </div>
      </div>
    </div>
  );
}