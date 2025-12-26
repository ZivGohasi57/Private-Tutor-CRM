import { useState } from 'react';
import { Bell, Trash2, Calendar, Plus, Download } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';

export function Reminders({ reminders, onSave, onDelete }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  
  // Alert triggers (minutes before event)
  const [alerts, setAlerts] = useState([15]); 
  
  const addAlert = () => setAlerts([...alerts, 30]);
  const removeAlert = (index) => setAlerts(alerts.filter((_, i) => i !== index));
  const updateAlert = (index, val) => {
    const newAlerts = [...alerts];
    newAlerts[index] = Number(val);
    setAlerts(newAlerts);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({
      title,
      date: `${date}T${time}`,
      alerts 
    });
    setTitle('');
    setAlerts([15]);
  };

  // Generate and download ICS calendar file
  const addToCalendar = (reminder) => {
    const startDate = new Date(reminder.date);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Default duration 1 hour
    
    const format = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const alarmBlocks = reminder.alerts.map(minutes => `
BEGIN:VALARM
TRIGGER:-PT${minutes}M
DESCRIPTION:Reminder
ACTION:DISPLAY
END:VALARM`).join('');

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${reminder.title}
DTSTART:${format(startDate)}
DTEND:${format(endDate)}
DESCRIPTION:תזכורת מהקליניקה
${alarmBlocks}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reminder.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDisplayDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth()+1} בשעה ${d.toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'})}`;
  };

  return (
    <div className="animate-in fade-in space-y-6">
      
      {/* Add New Reminder Form */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-orange-100 dark:border-orange-900/50">
        <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
          <Bell size={18} className="text-orange-500"/> תזכורת חדשה לעצמי
        </h3>
        
        <Input label="מה להזכיר?" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="למשל: להכין מבחן לדני" />
        
        <div className="flex gap-3 mt-3">
           <div className="flex-[2]"><Input type="date" value={date} onChange={(e)=>setDate(e.target.value)} /></div>
           <div className="flex-1"><Input type="time" value={time} onChange={(e)=>setTime(e.target.value)} /></div>
        </div>

        {/* Alert Selection */}
        <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl border border-orange-100 dark:border-orange-900/30">
           <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">מתי לצפצף?</p>
           {alerts.map((min, idx) => (
             <div key={idx} className="flex items-center gap-2 mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">⏰ התראה {idx+1}:</span>
                <select 
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm flex-1 text-slate-900 dark:text-white outline-none"
                  value={min} 
                  onChange={(e) => updateAlert(idx, e.target.value)}
                >
                  <option value="0">ממש בזמן</option>
                  <option value="15">15 דקות לפני</option>
                  <option value="30">30 דקות לפני</option>
                  <option value="60">שעה לפני</option>
                  <option value="120">שעתיים לפני</option>
                  <option value="1440">יום לפני</option>
                </select>
                <button onClick={() => removeAlert(idx)} className="text-rose-400 hover:text-rose-600"><Trash2 size={16}/></button>
             </div>
           ))}
           <button onClick={addAlert} className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1 mt-2 hover:underline">
             <Plus size={14}/> הוסף עוד התראה
           </button>
        </div>

        <Button onClick={handleSubmit} className="mt-4 bg-orange-500 hover:bg-orange-600 shadow-orange-200 dark:shadow-none text-white">
          שמור תזכורת
        </Button>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
         {reminders.length === 0 && <p className="text-center text-slate-400 text-sm mt-8">אין תזכורות כרגע</p>}
         
         {reminders.map(r => (
           <div key={r.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center transition-all">
             <div>
               <h4 className="font-bold text-slate-800 dark:text-slate-200">{r.title}</h4>
               <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                 <Calendar size={12}/> {formatDisplayDate(r.date)}
               </p>
               <p className="text-[10px] text-orange-600 dark:text-orange-400 mt-1 font-medium">
                 {r.alerts?.length || 1} התראות מוגדרות
               </p>
             </div>
             
             <div className="flex gap-2">
                <button 
                  onClick={() => addToCalendar(r)} 
                  className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl active:scale-95 transition-all flex flex-col items-center gap-1 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                  title="הוסף ליומן בטלפון"
                >
                  <Download size={18} />
                  <span className="text-[10px] font-bold">סנכרן</span>
                </button>
                
                <button 
                  onClick={() => onDelete(r.id)} 
                  className="p-2 bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 rounded-xl hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 active:scale-95 transition-all"
                >
                  <Trash2 size={18} />
                </button>
             </div>
           </div>
         ))}
      </div>

    </div>
  );
}