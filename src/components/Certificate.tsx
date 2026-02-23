import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Award, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CertificateProps {
  userName: string;
  courseTitle: string;
  onClose: () => void;
}

export default function Certificate({ userName, courseTitle, onClose }: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Certificado-${userName.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Erro ao gerar certificado. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative max-w-5xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <Award className="text-primary-600" />
            Seu Certificado
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={downloadCertificate}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-colors"
            >
              <Download size={18} />
              Baixar PDF
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8 bg-slate-200 flex justify-center">
          {/* Certificate Content */}
          <div 
            ref={certificateRef}
            className="w-[1123px] h-[794px] bg-white p-16 relative flex flex-col items-center justify-between text-slate-900 shadow-xl shrink-0"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {/* Border */}
            <div className="absolute inset-8 border-[12px] border-primary-600/10 pointer-events-none" />
            <div className="absolute inset-10 border-2 border-primary-600/20 pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col items-center gap-6 z-10">
              <img 
                src="https://adveasy.com.br/wp-content/uploads/2023/01/result-3.svg" 
                alt="Adveasy Logo" 
                className="h-16"
                crossOrigin="anonymous"
              />
              <div className="h-1 w-24 bg-primary-600 rounded-full" />
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-center text-center gap-8 z-10">
              <h1 className="text-6xl font-black uppercase tracking-tighter text-slate-900">
                Certificado de Conclusão
              </h1>
              <p className="text-xl text-slate-500 font-medium max-w-2xl">
                Certificamos para os devidos fins que
              </p>
              <h2 className="text-5xl font-serif italic text-primary-600 font-bold">
                {userName}
              </h2>
              <p className="text-xl text-slate-500 font-medium max-w-2xl">
                concluiu com êxito o treinamento intensivo
              </p>
              <h3 className="text-3xl font-bold text-slate-800">
                {courseTitle}
              </h3>
              <p className="text-lg text-slate-400">
                com carga horária total de 10 horas de conteúdo especializado.
              </p>
            </div>

            {/* Footer */}
            <div className="w-full flex justify-between items-end px-12 z-10">
              <div className="flex flex-col gap-1">
                <p className="text-sm text-slate-400 uppercase tracking-widest font-bold">Data de Emissão</p>
                <p className="text-lg font-bold text-slate-700">{new Date().toLocaleDateString('pt-BR')}</p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-64 h-px bg-slate-300" />
                <div className="flex flex-col items-center">
                  <p className="font-serif italic text-2xl text-slate-800">Adveasy Academy</p>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Assinatura Autorizada</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <p className="text-sm text-slate-400 uppercase tracking-widest font-bold">Código de Autenticidade</p>
                <p className="text-xs font-mono text-slate-500">{Math.random().toString(36).substring(2, 15).toUpperCase()}</p>
              </div>
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-600/5 rounded-full -ml-32 -mb-32 blur-3xl" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
