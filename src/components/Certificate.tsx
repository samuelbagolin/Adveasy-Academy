import React, { useRef, useState } from 'react';
import { domToPng } from 'modern-screenshot';
import { jsPDF } from 'jspdf';
import { Award, Download, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CertificateProps {
  userName: string;
  courseTitle: string;
  onClose: () => void;
}

export default function Certificate({ userName, courseTitle, onClose }: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadCertificate = async () => {
    if (!certificateRef.current || isGenerating) return;

    setIsGenerating(true);
    try {
      const element = certificateRef.current;
      
      // modern-screenshot is much better at handling modern CSS like oklch
      const dataUrl = await domToPng(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        width: 1123,
        height: 794,
        style: {
          transform: 'none',
          scale: '1',
          margin: '0',
          padding: '80px',
          display: 'flex',
          visibility: 'visible',
        }
      });
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1123, 794]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, 1123, 794);
      pdf.save(`Certificado-${userName.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Erro ao gerar certificado. Por favor, tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative max-w-6xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="p-6 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/10 rounded-lg">
              <Award className="text-primary-500" size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-none">Certificado de Conclusão</h3>
              <p className="text-slate-500 text-sm mt-1">Parabéns pela sua conquista!</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-800 rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-12 bg-slate-950 flex flex-col items-center gap-8 custom-scrollbar">
          <div className="relative group">
            {/* Shadow effect behind certificate */}
            <div className="absolute -inset-4 bg-primary-500/10 blur-2xl rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Certificate Content - COMPLETELY VANILLA CSS TO AVOID OKLCH ERRORS */}
            <div 
              ref={certificateRef}
              id="certificate-to-print"
              style={{ 
                width: '1123px',
                height: '794px',
                backgroundColor: '#ffffff',
                padding: '80px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
                transformOrigin: 'top',
                fontFamily: "'Inter', sans-serif",
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                color: '#0f172a'
              }}
              className="scale-[0.4] sm:scale-[0.6] md:scale-[0.7] lg:scale-[0.8] xl:scale-100"
            >
              {/* Elegant Border */}
              <div style={{ position: 'absolute', inset: '32px', border: '16px solid rgba(217, 119, 6, 0.05)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', inset: '48px', border: '2px solid rgba(217, 119, 6, 0.1)', pointerEvents: 'none' }} />
              
              {/* Corner Accents */}
              <div style={{ position: 'absolute', top: '32px', left: '32px', width: '128px', height: '128px', borderTop: '4px solid rgba(217, 119, 6, 0.3)', borderLeft: '4px solid rgba(217, 119, 6, 0.3)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '32px', right: '32px', width: '128px', height: '128px', borderTop: '4px solid rgba(217, 119, 6, 0.3)', borderRight: '4px solid rgba(217, 119, 6, 0.3)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '32px', left: '32px', width: '128px', height: '128px', borderBottom: '4px solid rgba(217, 119, 6, 0.3)', borderLeft: '4px solid rgba(217, 119, 6, 0.3)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '32px', right: '32px', width: '128px', height: '128px', borderBottom: '4px solid rgba(217, 119, 6, 0.3)', borderRight: '4px solid rgba(217, 119, 6, 0.3)', pointerEvents: 'none' }} />

              {/* Header */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', zIndex: 10 }}>
                <div style={{ height: '6px', width: '128px', borderRadius: '9999px', background: 'linear-gradient(to right, transparent, #d97706, transparent)' }} />
              </div>

              {/* Main Content */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '40px', zIndex: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ color: '#d97706', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '14px', margin: 0 }}>Certificado de Excelência</p>
                  <h1 style={{ fontSize: '72px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.05em', color: '#0f172a', lineHeight: 1, margin: 0 }}>
                    Conclusão de Curso
                  </h1>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontSize: '20px', fontWeight: 500, fontStyle: 'italic', color: '#94a3b8', margin: 0 }}>
                    Este documento certifica solenemente que
                  </p>
                  <h2 style={{ fontSize: '60px', fontFamily: 'serif', fontStyle: 'italic', color: '#0f172a', fontWeight: 'bold', borderBottom: '4px solid rgba(217, 119, 6, 0.2)', paddingBottom: '8px', paddingLeft: '32px', paddingRight: '32px', margin: 0 }}>
                    {userName}
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontSize: '20px', fontWeight: 500, fontStyle: 'italic', color: '#94a3b8', margin: 0 }}>
                    concluiu com distinção o treinamento especializado em
                  </p>
                  <h3 style={{ fontSize: '36px', fontWeight: 900, color: '#d97706', letterSpacing: '-0.02em', margin: 0 }}>
                    {courseTitle}
                  </h3>
                  <p style={{ fontSize: '18px', color: '#94a3b8', fontWeight: 500, maxWidth: '672px', margin: '0 auto' }}>
                    Demonstrando domínio técnico e comprometimento com a excelência profissional, 
                    com carga horária total de 10 horas de conteúdo avançado.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingLeft: '64px', paddingRight: '64px', zIndex: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, margin: 0 }}>Data de Emissão</p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#334155', margin: 0 }}>{new Date().toLocaleDateString('pt-BR')}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <p style={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: '30px', color: '#0f172a', fontWeight: 'bold', margin: 0 }}>Adveasy Academy</p>
                    <div style={{ width: '192px', height: '1px', background: 'linear-gradient(to right, transparent, #cbd5e1, transparent)', marginTop: '8px', marginBottom: '8px' }} />
                    <p style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 900, margin: 0 }}>Assinatura Autorizada</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <p style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, margin: 0 }}>Código de Verificação</p>
                  <p style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: 'bold', color: '#475569', backgroundColor: '#f8fafc', padding: '4px 12px', borderRadius: '4px', border: '1px solid #f1f5f9', margin: 0 }}>
                    {Math.random().toString(36).substring(2, 15).toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Background Decorative Elements */}
              <div style={{ position: 'absolute', top: 0, right: 0, width: '500px', height: '500px', backgroundColor: 'rgba(217, 119, 6, 0.05)', borderRadius: '50%', marginRight: '-256px', marginTop: '-256px', filter: 'blur(100px)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '500px', height: '500px', backgroundColor: 'rgba(217, 119, 6, 0.05)', borderRadius: '50%', marginLeft: '-256px', marginBottom: '-256px', filter: 'blur(100px)', pointerEvents: 'none' }} />
              
              {/* Seal */}
              <div style={{ position: 'absolute', bottom: '96px', right: '96px', width: '128px', height: '128px', opacity: 0.1, pointerEvents: 'none' }}>
                <Award size={128} style={{ color: '#d97706' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-8 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={downloadCertificate}
            disabled={isGenerating}
            className="group relative flex items-center justify-center gap-3 px-12 py-5 bg-primary-600 text-white rounded-2xl font-black text-xl hover:bg-primary-500 transition-all shadow-[0_20px_40px_-15px_rgba(242,125,38,0.5)] active:scale-95 disabled:opacity-70 disabled:active:scale-100 w-full sm:w-auto overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            {isGenerating ? (
              <>
                <Loader2 size={28} className="animate-spin" />
                <span>Gerando PDF...</span>
              </>
            ) : (
              <>
                <Download size={28} />
                <span>Baixar Certificado Agora</span>
              </>
            )}
          </button>
          <p className="text-slate-500 text-sm font-medium">Documento em alta resolução (PDF)</p>
        </div>
      </motion.div>
    </div>
  );
}
