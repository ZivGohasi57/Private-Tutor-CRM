import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, CalendarPlus, CreditCard, TrendingUp, Calendar as CalendarIcon, 
  Users, LogOut, Trash2, Pencil, BookOpen, PieChart, 
  Settings, Clock, MapPin, Video
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { 
  listenToStudents, listenToSchedule, listenToGradings,
  saveStudent, saveBulkLessons, updateLesson,
  savePayment, saveGrading, deleteGrading, deleteStudent,
  deleteLesson,
  getMonthlyStats
} from '../lib/storage';

import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { LessonForm } from '../components/LessonForm'; 
import { PaymentForm } from '../components/PaymentForm';
import { GradingForm } from '../components/GradingForm';
import { GradingsList } from '../components/GradingsList';
import { StudentDetails } from '../components/StudentDetails';
import { CalendarView } from '../components/CalendarView';
import { LessonDetails } from '../components/LessonDetails'; 
import StatsPage from './StatsPage';
import { LEVELS, LEVEL_LABELS } from '../lib/pricing';
import { PricingManager } from '../components/PricingManager';

export default function StudentsPage() {
  const [view, setView] = useState('students'); 
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [gradings, setGradings] = useState([]); 
  const [monthlyStats, setMonthlyStats] = useState({ total: 0 });

  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isReportingLesson, setIsReportingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null); 
  const [viewLesson, setViewLesson] = useState(null); 
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [editingGrading, setEditingGrading] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null); 
  const [newName, setNewName] = useState('');
  const [newLevel, setNewLevel] = useState(LEVELS.HIGH);


  useEffect(() => {
    const unsubStudents = listenToStudents((data) => {
      setStudents(data);
      setLoading(false);
    });
    const unsubSchedule = listenToSchedule(setSchedule);
    const unsubGradings = listenToGradings(setGradings);
    loadPaymentStats();
    return () => {
      unsubStudents();
      unsubSchedule();
      unsubGradings();
    };
  }, []);


  const loadPaymentStats = async () => {
    try {
      const m = await getMonthlyStats();
      setMonthlyStats(m);
    } catch (e) {
      console.error(e);
    }
  };

  const futureIncome = useMemo(() => {
    const now = new Date();
    return schedule
      .filter(l => {
        const lessonDate = l.start?.toDate ? l.start.toDate() : new Date(l.start);
        return lessonDate >= now && l.price && l.type !== 'block';
      })
      .reduce((sum, l) => sum + Number(l.price), 0);
  }, [schedule]);

  const handleAddStudent = async () => {
    if (!newName.trim()) return;
    await saveStudent({ name: newName, level: newLevel, balance: 0 });
    setNewName('');
    setIsAddingStudent(false);
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent || !editingStudent.name.trim()) return;
    await saveStudent(editingStudent);
    setEditingStudent(null);
  };

  const handleDeleteStudent = async (id) => {
    if (confirm('בטוח למחוק?')) { await deleteStudent(id); }
  };

  const handleSaveLesson = async (data) => {
    if (Array.isArray(data)) {
        await saveBulkLessons(data);
    } else if (data.id) {
        await updateLesson(data);
    } else {
        await saveBulkLessons([data]);
    }
    setIsReportingLesson(false);
    setEditingLesson(null);
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setIsReportingLesson(true);
  };

  const handleEditFromHistoryOrCalendar = (lesson) => {
    setSelectedStudent(null); 
    setEditingLesson(lesson);
    setIsReportingLesson(true);
  };

  
  const handleViewLesson = (lesson) => {
    setViewLesson(lesson);
  };

  const handleDeleteLesson = async (id) => {
    await deleteLesson(id);
    setViewLesson(null);
  };

  const handleOpenBlock = () => {
    setEditingLesson({ type: 'block' }); 
    setIsReportingLesson(true);
  };

  const handlePayment = async (p) => { 
    await savePayment(p); 
    setIsPaymentModalOpen(false); 
    loadPaymentStats(); 
  };
  
  const handleSaveGrading = async (g) => { 
    await saveGrading(g); 
    setIsGradingModalOpen(false); 
    setEditingGrading(null);
    loadPaymentStats(); 
  };

  const handleEditGrading = (gradingItem) => {
    setEditingGrading(gradingItem);
    setIsGradingModalOpen(true);
  };

  const handleDeleteGrading = async (id) => {
    if (confirm('למחוק את הדיווח הזה?')) { 
      await deleteGrading(id); 
      loadPaymentStats(); 
    }
  };

  const handleLogout = () => auth.signOut();

  const getUpcomingLessons = () => {
    const now = new Date();
    return schedule
      .filter(item => {
         if (item.type === 'block') return false;
         const start = new Date(item.start);
         const end = new Date(item.end || start.getTime() + (item.hours || 1) * 60 * 60 * 1000);
         return end > now;
      })
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, 5);
  };

  const getTimeStatus = (lesson) => {
    const now = new Date();
    const start = new Date(lesson.start);
    const end = new Date(lesson.end || start.getTime() + (lesson.hours || 1) * 60 * 60 * 1000);
    
    if (now >= start && now < end) {
        return { text: "מתקיים כרגע 🔥", color: "text-rose-600 dark:text-rose-400 animate-pulse font-black" };
    }

    const diffMs = start - now;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays >= 1) return { text: `בעוד ${diffDays} ימים`, color: "text-indigo-600 dark:text-indigo-400" };
    if (diffHours >= 1) return { text: `בעוד ${diffHours} שעות`, color: "text-amber-600 dark:text-amber-400" };
    if (diffMinutes > 0) return { text: `בעוד ${diffMinutes} דקות`, color: "text-emerald-600 dark:text-emerald-400" };
    
    return { text: "בקרוב", color: "text-slate-500" };
  };

  const formatLessonDate = (d) => new Date(d).toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'numeric' });
  const formatLessonTime = (d) => new Date(d).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-4 max-w-lg mx-auto pb-24 relative min-h-screen text-slate-900 dark:text-slate-100 transition-colors">
      <header className="flex justify-between items-center mb-4 pt-2">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">ניהול עבודה</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">ברוך הבא, זיו</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setIsPricingOpen(true)} className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 p-2.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 active:scale-95 transition-all hover:bg-slate-50 dark:hover:bg-slate-700">
             <Settings size={20} />
           </button>
           <button onClick={handleLogout} className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 p-2.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 active:scale-95 transition-all hover:bg-slate-50 dark:hover:bg-slate-700">
             <LogOut size={20} />
           </button>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-800 p-1.5 rounded-2xl flex mb-6 shadow-sm border border-slate-200 dark:border-slate-700">
        {[
          { id: 'students', label: 'תלמידים', icon: Users },
          { id: 'calendar', label: 'לו"ז', icon: CalendarIcon },
          { id: 'gradings', label: 'בדיקות', icon: BookOpen },
          { id: 'stats', label: 'דוחות', icon: PieChart }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setView(tab.id)} 
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all
              ${view === tab.id 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
          >
            <tab.icon size={16}/> {tab.label}
          </button>
        ))}
      </div>

      {view === 'stats' && <StatsPage />}

      {view === 'students' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
           <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                 <p className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1"><TrendingUp size={12}/> הכנסה החודש</p>
                 <p className="text-2xl font-black text-slate-800 dark:text-white">₪{monthlyStats.total.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-4 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none text-white">
                 <p className="text-xs text-indigo-100 mb-1 flex items-center gap-1 font-bold"><CalendarIcon size={12}/> צפי עתידי</p>
                 <p className="text-2xl font-black">₪{futureIncome.toLocaleString()}</p>
              </div>
           </div>

           <div>
              <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-3 text-sm flex items-center gap-2">
                <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-1 rounded-md"><Clock size={14}/></span>
                שיעורים קרובים
              </h3>
              <div className="space-y-2">
                {getUpcomingLessons().length === 0 ? 
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-slate-400 text-sm">אין שיעורים קרובים!</div> 
                  : 
                  getUpcomingLessons().map(lesson => {
                    const status = getTimeStatus(lesson);
                    return (
                        <div 
                            key={lesson.id} 
                            onClick={() => handleViewLesson(lesson)} 
                            className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex justify-between items-center cursor-pointer active:scale-[0.98] transition-all hover:border-indigo-200 dark:hover:border-indigo-800 group"
                        >
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${lesson.type === 'frontal' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-500' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500'}`}>
                            {lesson.type === 'frontal' ? <MapPin size={18} /> : <Video size={18} />}
                            </div>
                            <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{lesson.title || lesson.studentName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex flex-col mt-1">
                                <span className={`font-bold ${status.color}`}>{status.text}</span>
                                <span className="flex items-center gap-1 mt-0.5 opacity-80">
                                    <CalendarIcon size={10} />
                                    {formatLessonDate(lesson.start)} | {formatLessonTime(lesson.start)}
                                </span>
                            </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${lesson.type === 'frontal' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'}`}>
                            {lesson.type === 'frontal' ? 'פרונטלי' : 'אונליין'}
                            </span>
                        </div>
                        </div>
                    );
                  })
                }
              </div>
           </div>

           <div className="flex gap-3">
              <button onClick={() => setIsPaymentModalOpen(true)} className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 px-4 py-3.5 rounded-2xl flex-1 flex items-center justify-center gap-2 font-bold transition-transform active:scale-95 shadow-sm">
                <CreditCard size={18} /> קבלת תשלום
              </button>
              <button onClick={() => { setEditingLesson(null); setIsReportingLesson(true); }} className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 px-4 py-3.5 rounded-2xl flex-1 flex items-center justify-center gap-2 font-bold transition-transform active:scale-95 shadow-sm">
                <CalendarPlus size={18} /> קבע שיעור
              </button>
           </div>
           
           <div>
             <div className="flex justify-between items-center mb-3">
               <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">רשימת תלמידים</h3>
               <button onClick={() => setIsAddingStudent(!isAddingStudent)} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg">
                 {isAddingStudent ? 'ביטול' : '+ חדש'}
               </button>
             </div>
             {isAddingStudent && (
               <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900 mb-4 animate-in fade-in">
                 <Input label="שם מלא" value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
                 <div className="mt-3">
                   <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">רמה</label>
                   <select value={newLevel} onChange={e => setNewLevel(e.target.value)} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all">
                     {Object.entries(LEVEL_LABELS).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
                   </select>
                 </div>
                 <div className="flex gap-2 mt-4"><Button onClick={() => setIsAddingStudent(false)} variant="secondary">ביטול</Button><Button onClick={handleAddStudent}>שמור</Button></div>
               </div>
             )}
             <div className="space-y-3">
               {students.map((student) => (
                 <div key={student.id} onClick={() => setSelectedStudent(student)} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 group relative cursor-pointer active:scale-[0.98] transition-all hover:border-indigo-200 dark:hover:border-indigo-800">
                   <div className="flex justify-between items-center">
                     <div className="flex items-center gap-3">
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm
                         ${student.level === 'academic' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 
                           student.level === 'high' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'}`}>
                         {student.name[0]}
                       </div>
                       <div>
                         <h3 className="font-bold text-slate-800 dark:text-slate-100">{student.name}</h3>
                         <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-md">{LEVEL_LABELS[student.level]}</span>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className={`font-mono font-bold text-lg ${student.balance < 0 ? 'text-rose-500' : 'text-emerald-500'}`} dir="ltr">
                         {student.balance}₪
                       </p>
                     </div>
                   </div>
                   <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); setEditingStudent(student); }} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 hover:text-indigo-600"><Pencil size={14}/></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteStudent(student.id); }} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:bg-rose-100 dark:hover:bg-rose-900 hover:text-rose-600"><Trash2 size={14}/></button>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        </div>
      )}

      {view === 'calendar' && (
        <div className="animate-in fade-in">
            <CalendarView 
                schedule={schedule} 
                onUpdate={() => {}} 
                onEdit={handleViewLesson} 
                onAddBlock={handleOpenBlock}
            />
        </div>
      )}
      
      {view === 'gradings' && (
        <div className="animate-in fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-slate-700 dark:text-slate-300">היסטוריית בדיקות</h2>
            <button onClick={() => setIsGradingModalOpen(true)} className="text-sm font-bold bg-violet-600 text-white px-4 py-2 rounded-xl shadow-lg shadow-violet-200 dark:shadow-none hover:bg-violet-700 transition-colors">+ דיווח</button>
          </div>
          <GradingsList gradings={gradings} onEdit={handleEditGrading} onDelete={handleDeleteGrading} />
        </div>
      )}

      {selectedStudent && (
        <StudentDetails 
            student={selectedStudent} 
            onClose={() => setSelectedStudent(null)} 
            onEditLesson={handleEditFromHistoryOrCalendar} 
        />
      )}
      
      {}
      {viewLesson && (
        <LessonDetails 
          lesson={viewLesson} 
          onClose={() => setViewLesson(null)} 
          onEdit={() => { setViewLesson(null); handleEditLesson(viewLesson); }} 
          onDelete={handleDeleteLesson} 
        />
      )}

      {isReportingLesson && (
        <LessonForm 
            students={students} 
            onClose={() => { setIsReportingLesson(false); setEditingLesson(null); }} 
            onSave={handleSaveLesson} 
            initialData={editingLesson} 
            existingEvents={schedule} 
        />
      )}

      {isPaymentModalOpen && <PaymentForm students={students} onClose={() => setIsPaymentModalOpen(false)} onSave={handlePayment} />}
      
      {(isGradingModalOpen || editingGrading) && (
        <GradingForm 
          onClose={() => { setIsGradingModalOpen(false); setEditingGrading(null); }} 
          onSave={handleSaveGrading}
          initialData={editingGrading}
        />
      )}
      
      {isPricingOpen && (
        <PricingManager 
          onClose={() => setIsPricingOpen(false)} 
          onUpdate={() => {}} 
        />
      )}
      
      {editingStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-xl mb-4 text-slate-800 dark:text-white">עריכת תלמיד</h3>
            <Input label="שם מלא" value={editingStudent.name} onChange={e => setEditingStudent({...editingStudent, name: e.target.value})} />
            <div className="mt-4 mb-6">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">רמה</label>
              <select value={editingStudent.level} onChange={e => setEditingStudent({...editingStudent, level: e.target.value})} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all">
                {Object.entries(LEVEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setEditingStudent(null)} variant="secondary">ביטול</Button>
              <Button onClick={handleUpdateStudent}>שמור</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}