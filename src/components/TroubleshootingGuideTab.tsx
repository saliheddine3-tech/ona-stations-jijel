import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Wrench, 
  Zap, 
  Droplets, 
  ShieldAlert, 
  HelpCircle,
  X,
  Save,
  Clock,
  UserCheck
} from 'lucide-react';
import { TroubleshootingCard, UserSession } from '../types';
import { storageService } from '../services/storageService';
import { ADMIN_USER } from '../data/initialData';

interface TroubleshootingGuideTabProps {
  cards: TroubleshootingCard[];
  currentUser: UserSession;
}

export const TroubleshootingGuideTab: React.FC<TroubleshootingGuideTabProps> = ({
  cards = [],
  currentUser
}) => {
  const isSupervisor = currentUser.role === 'مشرف' || currentUser.role === 'مدير_عام';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<TroubleshootingCard | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<TroubleshootingCard['category']>('كهرباء_وتحكم');
  const [formSymptoms, setFormSymptoms] = useState('');
  const [formQuickCheck, setFormQuickCheck] = useState('');
  const [formAction, setFormAction] = useState('');
  const [formUrgency, setFormUrgency] = useState<TroubleshootingCard['urgency']>('فوري');

  const categories = [
    { id: 'all', label: 'جميع الأعطال' },
    { id: 'كهرباء_وتحكم', label: '⚡ كهرباء ولوحات تحكم' },
    { id: 'مضخات_وهيدروليك', label: '💧 مضخات وهيدروليك' },
    { id: 'مولدات_وطاقة', label: '🔌 مولدات وطاقة' },
    { id: 'أحواض_وعوامات', label: '🌊 أحواض وعوامات' },
    { id: 'أخرى', label: '⚠️ أخرى' }
  ];

  const filteredCards = cards.filter(card => {
    if (selectedCategory !== 'all' && card.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = card.title.toLowerCase().includes(q);
      const matchSymptoms = card.symptoms.toLowerCase().includes(q);
      const matchAction = card.recommendedAction.toLowerCase().includes(q);
      if (!matchTitle && !matchSymptoms && !matchAction) return false;
    }
    return true;
  });

  const handleOpenAddModal = () => {
    setEditingCard(null);
    setFormTitle('');
    setFormCategory('كهرباء_وتحكم');
    setFormSymptoms('');
    setFormQuickCheck('تأكد من التغذية الكهربائية\nافحص مستوى الزيت أو المياه\nتأكد من عدم وجود شوائب عالقة');
    setFormAction('');
    setFormUrgency('فوري');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (card: TroubleshootingCard) => {
    setEditingCard(card);
    setFormTitle(card.title);
    setFormCategory(card.category);
    setFormSymptoms(card.symptoms);
    setFormQuickCheck(card.quickCheck.join('\n'));
    setFormAction(card.recommendedAction);
    setFormUrgency(card.urgency);
    setIsModalOpen(true);
  };

  const handleDeleteCard = (cardId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه البطاقة من دليل الأعطال؟')) return;
    storageService.deleteTroubleshootingCard(cardId);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAction.trim()) return;

    const quickCheckArray = formQuickCheck
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    if (editingCard) {
      // Update
      const updated: TroubleshootingCard = {
        ...editingCard,
        title: formTitle.trim(),
        category: formCategory,
        symptoms: formSymptoms.trim(),
        quickCheck: quickCheckArray,
        recommendedAction: formAction.trim(),
        urgency: formUrgency,
        addedBy: `${ADMIN_USER.fullName} (المشرف)`
      };
      storageService.updateTroubleshootingCard(updated);
    } else {
      // Create
      const newCard: TroubleshootingCard = {
        id: `trb-${Date.now()}`,
        title: formTitle.trim(),
        category: formCategory,
        symptoms: formSymptoms.trim(),
        quickCheck: quickCheckArray,
        recommendedAction: formAction.trim(),
        urgency: formUrgency,
        addedBy: `${ADMIN_USER.fullName} (المشرف)`,
        createdAt: new Date().toISOString().split('T')[0]
      };
      storageService.addTroubleshootingCard(newCard);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 text-right font-['Cairo',sans-serif]">
      
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-800">
                الدليل الفني الميداني
              </span>
              <span className="text-[11px] text-slate-400">محفوظ محلياً في LocalStorage</span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">
              دليل الأعطال السريع والحلول الميدانية (Troubleshooting Guide)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              بطاقات إرشادية عملية تساعد مراقبي المحطات وعمال المناوبة في معالجة الأعطال الطارئة فورياً وبأمان
            </p>
          </div>
        </div>

        {/* Supervisor Action Button */}
        {isSupervisor ? (
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-5 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-cyan-900/40 flex items-center gap-2 shrink-0 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ إضافة عطل جديد للدليل</span>
          </button>
        ) : (
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span>صلاحية إضافة وتعديل الأعطال محصورة للمشرف خباش صلاح الدين</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث عن عطل، عرض، مضخة، مرحل حراري..."
            className="w-full pr-9 pl-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.length === 0 ? (
          <div className="col-span-full p-12 bg-slate-900/60 rounded-3xl border border-slate-800 text-center text-slate-400 text-xs">
            لا توجد بطاقات أعطال تطابق بحثك حالياً.
          </div>
        ) : (
          filteredCards.map(card => {
            const urgencyBadge =
              card.urgency === 'فوري'
                ? { bg: 'bg-rose-950/80 text-rose-300 border-rose-800', label: 'تدخل فوري' }
                : card.urgency === 'متوسط'
                ? { bg: 'bg-amber-950/80 text-amber-300 border-amber-800', label: 'أولوية متوسطة' }
                : { bg: 'bg-blue-950/80 text-blue-300 border-blue-800', label: 'إجراء وقائي' };

            return (
              <div
                key={card.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between transition-all"
              >
                <div className="space-y-3">
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3 gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${urgencyBadge.bg}`}>
                          {urgencyBadge.label}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-400">
                          {card.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-sm leading-snug">{card.title}</h3>
                    </div>

                    {/* Admin Actions */}
                    {isSupervisor && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(card)}
                          className="p-1.5 bg-slate-800 hover:bg-cyan-950 text-cyan-400 rounded-lg border border-slate-700"
                          title="تعديل البطاقة"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded-lg border border-slate-700"
                          title="حذف البطاقة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Symptoms */}
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-850 space-y-1">
                    <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>الأعراض الميدانية والمؤشرات:</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{card.symptoms}</p>
                  </div>

                  {/* Quick Check Steps */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>خطوات الفحص السريع:</span>
                    </div>
                    <ul className="space-y-1 pr-2">
                      {card.quickCheck.map((step, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5 leading-snug">
                          <span className="w-4 h-4 rounded-full bg-slate-800 text-cyan-400 text-[10px] flex items-center justify-center font-mono shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Action */}
                  <div className="p-3 bg-cyan-950/30 border border-cyan-800/60 rounded-2xl space-y-1">
                    <div className="text-[10px] text-cyan-300 font-bold flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>الإجراء الموصى به والحل:</span>
                    </div>
                    <p className="text-xs text-white font-medium leading-relaxed">{card.recommendedAction}</p>
                  </div>

                </div>

                {/* Footer metadata */}
                <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>المشرف: {card.addedBy}</span>
                  <span>{card.createdAt}</span>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Modal for Add / Edit (Supervisor Only) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md text-right font-['Cairo',sans-serif]">
          <div className="relative w-full max-w-xl bg-slate-900 border-2 border-cyan-600 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <span>{editingCard ? 'تعديل بطاقة عطل في الدليل' : 'إضافة بطاقة عطل ميداني جديد للدليل'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
              
              <div>
                <label className="block text-slate-300 font-bold mb-1">عنوان العطل أو المشكلة:</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="مثال: توقف المضخة 1 بسبب إنذار المرحل الحراري"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">فئة العطل:</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="كهرباء_وتحكم">⚡ كهرباء ولوحات تحكم</option>
                    <option value="مضخات_وهيدروليك">💧 مضخات وهيدروليك</option>
                    <option value="مولدات_وطاقة">🔌 مولدات وطاقة</option>
                    <option value="أحواض_وعوامات">🌊 أحواض وعوامات</option>
                    <option value="أخرى">⚠️ أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">درجة الاستعجال:</label>
                  <select
                    value={formUrgency}
                    onChange={e => setFormUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="فوري">🔴 تدخل فوري</option>
                    <option value="متوسط">🟡 أولوية متوسطة</option>
                    <option value="وقائي">🔵 إجراء وقائي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">الأعراض والمؤشرات الظاهرة للعامل:</label>
                <textarea
                  rows={2}
                  required
                  value={formSymptoms}
                  onChange={e => setFormSymptoms(e.target.value)}
                  placeholder="مثال: إضاءة لمبة Défaut حمراء، صدور صوت صفير، عدم نزول الماء..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">خطوات الفحص السريع (سطر لكل خطوة):</label>
                <textarea
                  rows={3}
                  value={formQuickCheck}
                  onChange={e => setFormQuickCheck(e.target.value)}
                  placeholder="افحص جهد سونلغاز&#10;تأكد من عدم وجود شوائب&#10;تأكد من وضع القاطع"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">الإجراء الموصى به والحل الفوري:</label>
                <textarea
                  rows={3}
                  required
                  value={formAction}
                  onChange={e => setFormAction(e.target.value)}
                  placeholder="مثال: اقطع القاطع العام وانتظر 5 دقائق، اضغط زر Reset الأزرق..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ البطاقة في الدليل السريع</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
