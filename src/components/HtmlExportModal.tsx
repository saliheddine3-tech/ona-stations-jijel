import React, { useState, useEffect } from 'react';
import { Download, Copy, Check, X, FileCode, Sparkles, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';

interface HtmlExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HtmlExportModal: React.FC<HtmlExportModalProps> = ({ isOpen, onClose }) => {
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/markaz_al_mahattat.html')
      .then(res => {
        if (!res.ok) throw new Error('تعذر تحميل الملف');
        return res.text();
      })
      .then(text => {
        setHtmlCode(text);
        setLoading(false);
      })
      .catch(err => {
        setError('حدث خطأ أثناء جلب كود الملف: ' + err.message);
        setLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(htmlCode);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = htmlCode;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      alert('تعذر النسخ التلقائي، يمكنك تحديد النص من الصندوق ونسخه يدوياً (Ctrl+A ثم Ctrl+C).');
    }
  };

  const handleDirectDownload = () => {
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markaz_al_mahattat_ona_jijel.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const linesCount = htmlCode ? htmlCode.split('\n').length : 0;
  const sizeKb = htmlCode ? (new Blob([htmlCode]).size / 1024).toFixed(1) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                كود التطبيق المستقل (Single-File HTML)
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  جاهز للنسخ والتحميل
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                ملف HTML واحد شامل لكل ميزات مركز المحطات (16 محطة + الصلاحيات + الـ 6 ميزات الجديدة) يعمل بدون إنترنت
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
            <span className="bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
              📏 <strong className="text-cyan-400">{linesCount}</strong> سطر
            </span>
            <span className="bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
              💾 <strong className="text-emerald-400">{sizeKb}</strong> KB
            </span>
            <span className="bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
              ⚡ أوفلاين 100%
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              disabled={loading || !htmlCode}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>تم نسخ الكود كاملاً إلى الحافظة!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ الكود كاملاً (Copy All)</span>
                </>
              )}
            </button>

            {/* Direct Download Button */}
            <button
              onClick={handleDirectDownload}
              disabled={loading || !htmlCode}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>تحميل ملف .html مباشرة</span>
            </button>

            {/* Direct Link Open */}
            <a
              href="/markaz_al_mahattat.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>معاينة في تبويب جديد</span>
            </a>
          </div>
        </div>

        {/* Code Content View */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col bg-slate-950">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">جاري استخراج وتحميل الكود...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-rose-400 gap-2">
              <AlertCircle className="w-8 h-8" />
              <p className="text-xs">{error}</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col relative">
              <div className="text-[11px] text-slate-400 mb-2 flex items-center justify-between">
                <span>يمكنك النقر داخل الصندوق والضغط على <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300 font-mono">Ctrl + A</kbd> ثم <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300 font-mono">Ctrl + C</kbd> للنسخ اليدوي:</span>
                <span className="text-slate-500 font-mono text-[10px]">markaz_al_mahattat_ona_jijel.html</span>
              </div>
              <textarea
                readOnly
                value={htmlCode}
                onClick={e => (e.target as HTMLTextAreaElement).select()}
                className="w-full flex-1 bg-slate-900 text-slate-300 font-mono text-xs p-4 rounded-xl border border-slate-800 resize-none focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 leading-relaxed selection:bg-cyan-500 selection:text-white"
                dir="ltr"
              />
            </div>
          )}
        </div>

        {/* Footer Features Summary */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 px-6 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>يتضمن حصر الصلاحيات للمشرف + الـ 6 ميزات الجديدة: زر طوارئ SOS، مراسلة، سجل المناوبات السريع، الصيانة الوقائية (16 محطة)، تشغيل المولد الأسبوعي، التغطية الذكية، دليل الأعطال.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
