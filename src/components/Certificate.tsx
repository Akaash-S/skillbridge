import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Share2, 
  Image as ImageIcon,
  Loader2,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CertificateProps {
  userName: string;
  roleName: string;
  completionDate: string | Date;
  certificateId?: string;
  className?: string;
  onDownloadComplete?: () => void;
  // Compatibility props
  userEmail?: string;
  skillsCompleted?: number;
  totalHours?: number;
  readinessScore?: number;
  onDownload?: () => void;
  onShare?: () => void;
}

export const Certificate: React.FC<CertificateProps> = ({
  userName,
  roleName,
  completionDate,
  certificateId = "SB-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
  className = "",
  onDownloadComplete
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scale, setScale] = useState(1);

  const dateObj = typeof completionDate === 'string' ? new Date(completionDate) : completionDate;
  const displayDate = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const baseWidth = 800;
        if (containerWidth < baseWidth) {
          setScale(containerWidth / baseWidth);
        } else {
          setScale(1);
        }
      }
    };

    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    updateScale();
    return () => observer.disconnect();
  }, []);

  const captureCertificate = async () => {
    if (!exportRef.current) return null;
    
    // Ensure high fidelity capture from the hidden unscaled container
    return await html2canvas(exportRef.current, {
      scale: 3,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      width: 800,
      height: 566,
      onclone: (clonedDoc) => {
        // Fix for potential font loading issues in the clone
        const exportContainer = clonedDoc.getElementById('certificate-export-portal');
        if (exportContainer) {
          exportContainer.style.position = 'static';
          exportContainer.style.left = '0';
          exportContainer.style.top = '0';
        }
      }
    });
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      toast.info("Generating high-resolution certificate...");
      await new Promise(resolve => setTimeout(resolve, 800));

      const canvas = await captureCertificate();
      if (!canvas) throw new Error("Capture failed");

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [800, 566]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 800, 566);
      pdf.save(`SkillBridge-Certificate-${certificateId}.pdf`);
      toast.success("Certificate saved as PDF!");
      onDownloadComplete?.();
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = async () => {
    try {
      setIsGenerating(true);
      toast.info("Generating professional image...");
      await new Promise(resolve => setTimeout(resolve, 800));

      const canvas = await captureCertificate();
      if (!canvas) throw new Error("Capture failed");

      const link = document.createElement('a');
      link.download = `SkillBridge-Certificate-${certificateId}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      toast.success("Certificate saved as image!");
      onDownloadComplete?.();
    } catch (error) {
      console.error("Image generation failed:", error);
      toast.error("Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/verify-certificate/${certificateId}`;
    const shareText = `🎓 I just earned my Professional Certificate in ${roleName} from SkillBridge! \n\nVerify my achievement here: ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SkillBridge Professional Certificate',
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        await navigator.clipboard.writeText(shareText);
        toast.success("Link copied to clipboard!");
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success("Link copied to clipboard!");
    }
  };

  const getNameFontSize = (name: string) => {
    if (name.length > 25) return '28px';
    if (name.length > 20) return '34px';
    return '42px';
  };

  const getRoleFontSize = (role: string) => {
    if (role.length > 30) return '18px';
    if (role.length > 20) return '22px';
    return '26px';
  };

  const CertificateContent = ({ id }: { id?: string }) => (
    <div 
      id={id}
      className="relative w-[800px] h-[566px] bg-white rounded-sm overflow-hidden select-none"
      style={{ fontFamily: "'EB Garamond', serif" }}
    >
      <img 
        src="/skillbridge-certificate.png" 
        alt="Certificate Background"
        className="absolute inset-0 w-full h-full object-contain"
        crossOrigin="anonymous"
      />

      {/* User Name */}
      <div 
        className="absolute w-full top-[39.5%] left-0 text-center px-20 font-bold"
        style={{ 
          color: '#1a1a1a',
          fontSize: getNameFontSize(userName),
          letterSpacing: '0.01em',
          lineHeight: 1.1,
        }}
      >
        {userName}
      </div>

      {/* Role Name */}
      <div 
        className="absolute w-full top-[53.5%] left-0 text-center px-20 font-bold"
        style={{ 
          color: '#1a1a1a',
          fontSize: getRoleFontSize(roleName),
          lineHeight: 1.1,
        }}
      >
        {roleName}
      </div>

      {/* Completion Date */}
      <div 
        className="absolute top-[67.8%] left-[44.4%] font-semibold"
        style={{ 
          color: '#444',
          fontSize: '15px',
          lineHeight: 1,
        }}
      >
        {displayDate}
      </div>

      {/* Certificate ID */}
      <div 
        className="absolute top-[73.6%] left-[46.4%] font-semibold"
        style={{ 
          color: '#555',
          fontSize: '14px',
          lineHeight: 1,
        }}
      >
        {certificateId}
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col items-center gap-6 w-full ${className}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700;800&display=swap');
      `}} />
      
      {/* 1. PREVIEW CONTAINER (SCALED FOR VIEWPORT) */}
      <div 
        ref={containerRef}
        className="w-full flex justify-center overflow-hidden"
        style={{ height: `${566 * scale}px` }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top', width: '800px', height: '566px' }}>
          <CertificateContent />
        </div>
      </div>

      {/* 2. HIDDEN EXPORT PORTAL (ALWAYS 1:1 RATIO FOR CAPTURE) */}
      <div 
        className="fixed opacity-0 pointer-events-none" 
        style={{ left: '-2000px', top: '0' }}
      >
        <div ref={exportRef}>
          <CertificateContent id="certificate-export-portal" />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button 
          onClick={handleDownloadPDF} 
          disabled={isGenerating}
          className="gap-2 bg-primary hover:bg-primary/90 min-w-[140px]"
        >
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download PDF
        </Button>
        <Button 
          variant="outline" 
          onClick={handleDownloadImage} 
          disabled={isGenerating}
          className="gap-2 min-w-[140px]"
        >
          <ImageIcon className="h-4 w-4" />
          Download PNG
        </Button>
        <Button variant="secondary" onClick={handleShare} className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => window.open(`${window.location.origin}/verify-certificate/${certificateId}`, '_blank')}
          title="Verify Link"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Certificate;