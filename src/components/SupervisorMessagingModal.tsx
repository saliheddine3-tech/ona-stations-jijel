import React, { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle2, User, Clock, Check, Reply, MessageCircle } from 'lucide-react';
import { UserSession, Station, SupervisorMessage } from '../types';
import { storageService } from '../services/storageService';
import { ADMIN_USER } from '../data/initialData';

interface SupervisorMessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  currentStation?: Station;
  messages: SupervisorMessage[];
}

export const SupervisorMessagingModal: React.FC<SupervisorMessagingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentStation,
  messages = []
}) => {
  const isSupervisor = currentUser.role === 'مشرف' || currentUser.role === 'مدير_عام';
  const [activeSubTab, setActiveSubTab] = useState<'send' | 'inbox'>(isSupervisor ? 'inbox' : 'send');
  const [category, setCategory] = useState<SupervisorMessage['category']>('طلب_وقود');
  const [content, setContent] = useState('');
  const [replyText, setReplyText] = useState<{ [id: string]: string }>({});
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const quickTemplates = [
    { cat: 'طلب_وقود' as const, label: '⛽ طلب تزويد بالوقود', text: 'يرجى برمجة شاحنة وقود المازوت لتزويد خزان المولد الاحتياطي للمحطة.' },
    { cat: 'استفسار_مناوبة' as const, label: '📅 استفسار حول المناوبة', text: 'أرجو التنسيق بخصوص جدول مناوبة الفوج القادم وتأكيد البديل.' },
    { cat: 'ملاحظة_ميدانية' as const, label: '🔍 ملاحظة ميدانية عاجلة', text: 'لوحظ ارتفاع طفيف في منسوب مياه السحب والمضخات بحاجة لمتابعة.' },
    { cat: 'طلب_عتاد' as const, label: '🧰 طلب عتاد أو كواشف إنارة', text: 'نحتاج مصابيح إنارة بديلة وعتاد سلامة للمناوبة الليلية بالمحطة.' },
    { cat: 'رسالة_عامة' as const, label: '✉️ رسالة عامة للمشرف', text: '' }
  ];

  const handleApplyTemplate = (tpl: typeof quickTemplates[0]) => {
    setCategory(tpl.cat);
    setContent(tpl.text);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newMsg: SupervisorMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.workerId,
      senderName: currentUser.fullName,
      senderPhone: currentUser.phone,
      stationId: currentStation?.id || currentUser.stationId,
      stationName: currentStation?.name,
      category,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      isRead: false
    };

    storageService.addSupervisorMessage(newMsg);
    setContent('');
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      if (!isSupervisor) onClose();
    }, 1800);
  };

  const handleSendReply = (msgId: string) => {
    const rep = replyText[msgId]?.trim();
    if (!rep) return;
    storageService.replySupervisorMessage(msgId, rep);
    setReplyText(prev => ({ ...prev, [msgId]: '' }));
  };

  // Filter messages: Supervisor sees all; regular worker sees his own messages
  const userMessages = isSupervisor
    ? messages
    : messages.filter(m => m.senderId === currentUser.workerId || m.senderPhone === currentUser.phone);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md text-right font-['Cairo',sans-serif]">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-emerald-600/80 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(5,150,105,0.3)] space-y-5 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-600 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>مراسلة مباشرة للمشرف (Admin)</span>
                <span className="text-[11px] px-2.5 py-0.5 bg-emerald-700 text-white rounded-full font-bold">
                  {ADMIN_USER.fullName} (0669436843)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                قناة تواصل ميدانية سريعة وموثقة بين عمال المحطات وإدارة المركز
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs for switching between New Message and History */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('send')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'send'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950'
            }`}
          >
            ✏️ كتابة رسالة جديدة
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('inbox')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'inbox'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{isSupervisor ? 'صندوق رسائل العمال الواردة' : 'رسائلي السابقة وردود المشرف'}</span>
            {userMessages.length > 0 && (
              <span className="px-1.5 py-0.2 bg-emerald-900 text-emerald-200 rounded-full text-[10px]">
                {userMessages.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeSubTab === 'send' && (
            sentSuccess ? (
              <div className="p-8 bg-emerald-950/60 border border-emerald-600 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h3 className="text-base font-black text-white">تم إرسال الرسالة إلى المشرف بنجاح!</h3>
                <p className="text-xs text-slate-300">
                  ستصل رسالتك للمشرف خباش صلاح الدين في صندوق المراسلات الميدانية وسيصلك رده فوراً.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4">
                {/* Quick Templates */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-300">نماذج رسائل سريعة بنقرة واحدة:</div>
                  <div className="flex flex-wrap gap-2">
                    {quickTemplates.map((t, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyTemplate(t)}
                        className="px-3 py-1.5 bg-slate-950 hover:bg-emerald-950/80 border border-slate-800 hover:border-emerald-600 rounded-xl text-xs text-slate-300 transition-all font-semibold"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Category */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">التصنيف:</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="طلب_وقود">⛽ طلب تزويد بالوقود والمازوت</option>
                    <option value="استفسار_مناوبة">📅 استفسار حول جدول المناوبة والتبديل</option>
                    <option value="ملاحظة_ميدانية">🔍 ملاحظة ميدانية أو تشغيلية</option>
                    <option value="طلب_عتاد">🧰 طلب عتاد وقطع غيار أو إنارة</option>
                    <option value="رسالة_عامة">✉️ رسالة أو اقتراح عام</option>
                  </select>
                </div>

                {/* Message Content */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">نص الرسالة:</label>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    required
                    placeholder="اكتب رسالتك للمشرف هنا بدقة..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-slate-400">
                    المرسل: <strong className="text-white">{currentUser.fullName}</strong> ({currentStation?.name || 'محطتك'})
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>إرسال الرسالة للمشرف الآن</span>
                  </button>
                </div>
              </form>
            )
          )}

          {activeSubTab === 'inbox' && (
            <div className="space-y-3">
              {userMessages.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  لا توجد رسائل مسجلة حالياً في الصندوق.
                </div>
              ) : (
                userMessages.map(msg => (
                  <div
                    key={msg.id}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-400">{msg.senderName}</span>
                        {msg.stationName && (
                          <span className="text-[10px] px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-md text-slate-400">
                            {msg.stationName}
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-950 border border-emerald-800 rounded-md text-emerald-300 font-semibold">
                          {msg.category.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(msg.timestamp).toLocaleString('ar-DZ')}</span>
                      </div>
                    </div>

                    <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                    {/* Reply section */}
                    {msg.reply ? (
                      <div className="bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded-xl text-xs space-y-1">
                        <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>رد المشرف خباش صلاح الدين:</span>
                          {msg.repliedAt && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({new Date(msg.repliedAt).toLocaleTimeString('ar-DZ')})
                            </span>
                          )}
                        </div>
                        <p className="text-white font-medium">{msg.reply}</p>
                      </div>
                    ) : isSupervisor ? (
                      <div className="pt-2 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="اكتب ردك الميداني للعامل..."
                          value={replyText[msg.id] || ''}
                          onChange={e => setReplyText({ ...replyText, [msg.id]: e.target.value })}
                          className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendReply(msg.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                        >
                          <Reply className="w-3.5 h-3.5" />
                          <span>رد</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-[10px] text-amber-400/80 italic">
                        بانتظار قراءة ورد المشرف...
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
