import { useState } from 'react';
import { X, Clock, AlertOctagon, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { checkConflict } from '../lib/storage';

export function BlockForm({ onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  
  const [error, setError] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [endDate, setEndDate] = useState(''); 
  const [loading, setLoading] = useState(false);

  const calculateDuration = () => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    let diff = (end - start) / 1000 / 60 / 60; 
    return diff > 0 ? diff : 0;
  };

  const handleSubmit = async () => {
    setError('');
    if (!title) return;

    const duration = calculateDuration();
    if (duration <= 0) {
      setError('שעת הסיום חייבת להיות אחרי שעת ההתחלה');
      return;
    }
    
    setLoading(true);

    const blocksToSave = [];

    if (!isRecurring) {
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
      
      const conflict = await checkConflict(start, end);
      if (conflict) {
        setError(`הזמן תפוס ב-${start.toLocaleDateString()}`);
        setLoading(false);
        return;
      }
      
      blocksToSave.push({
        type: 'block',
        studentName: title,
        start: start,
        end: end,
        hours: duration,
        price: 0
      });
    } else {
      if (!endDate) { setError('חובה לבחור תאריך סיום למחזוריות'); setLoading(false); return; }
      if (new Date(endDate) < new Date(startDate)) { setError('תאריך סיום שגוי'); setLoading(false); return; }

      let currentDate = new Date(startDate);
      const endLoop = new Date(endDate);
      const conflicts = [];

      while (currentDate <= endLoop) {
        const start = new Date(`${currentDate.toISOString().split('T')[0]}T${startTime}`);
        const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
        
        const conflict = await checkConflict(start, end);
        if (conflict) {
            conflicts.push(start.toLocaleDateString());
        } else {
            blocksToSave.push({
                type: 'block',
                studentName: title + ' (מחזורי)',
                start: start,
                end: end,
                hours: duration,
                price: 0
            });
        }
        currentDate.setDate(currentDate.getDate() + 7);
      }

      if (conflicts.length > 0) {
        setError(`התנגשויות בתאריכים: ${conflicts.slice(0, 2).join(', ')}...`);
        setLoading(false);
        return;
      }
    }

    onSave(blocksToSave);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in p-4" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm p-6 rounded-2xl shadow-2xl relative border border-slate-100 dark:border-slate-800">
        <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><X size={20} /></button>
        
        <div className="flex flex-col items-center mb-6 text-slate-500 dark:text-slate-400">
          <AlertOctagon size={40} className="mb-2 text-slate-400 dark:text-slate-500" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">חסימת יומן</h2>
        </div>

        {error && (
          <div className="mb-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-3 rounded-lg text-sm font-bold border border-rose-100 dark:border-rose-900/50">
            ✋ {error}
          </div>
        )}

        <div className="space-y-4">
          <Input 
            label="שם החסימה" 
            placeholder="למשל: לימודים / חדר כושר" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
             <button onClick={() => setIsRecurring(false)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isRecurring ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>חד פעמי</button>
             <button onClick={() => setIsRecurring(true)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${isRecurring ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}><RefreshCw size={12}/> קבוע</button>
          </div>

          <div className="flex gap-3">
             <div className="flex-[2]"><Input type="date" label="תאריך" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
          </div>

          <div className="flex gap-3 items-end">
             <div className="flex-1"><Input type="time" label="התחלה" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
             <div className="pb-3 text-slate-400 dark:text-slate-600"><ArrowLeft size={16}/></div>
             <div className="flex-1"><Input type="time" label="סיום" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
          </div>

          {isRecurring && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/30 animate-in slide-in-from-top-2">
                <Input type="date" label="תאריך סיום המחזוריות" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500 mt-2">
             <Clock size={12}/>
             <span>סה"כ זמן חסימה: {calculateDuration().toFixed(1)} שעות</span>
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="bg-slate-800 dark:bg-slate-700 hover:bg-black dark:hover:bg-slate-600 text-white shadow-slate-300 dark:shadow-none mt-2">
            {loading ? 'בודק...' : (isRecurring ? 'שריין סדרה' : 'שריין חסימה')}
          </Button>
        </div>
      </div>
    </div>
  );
}