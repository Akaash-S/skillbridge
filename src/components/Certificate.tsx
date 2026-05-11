import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Share2, 
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
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
  // Compatibility props (ignored in new design but kept for types)
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
  const certificateRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scale, setScale] = useState(1);

  // Format date for display
  const dateObj = typeof completionDate === 'string' ? new Date(completionDate) : completionDate;
  const displayDate = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Handle responsiveness via scaling
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const baseWidth = 800; // Original design width
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

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    
    try {
      setIsGenerating(true);
      toast.info("Generating high-resolution PDF...");

      // Ensure fonts and images are fully settled
      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = await html2canvas(certificateRef.current, {
        scale: 5, // Maximum fidelity
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        width: 800,
        height: 566,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [800, 566]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 800, 566);
      pdf.save(`SkillBridge-Certificate-${certificateId}.pdf`);
      
      toast.success("Professional PDF generated!");
      onDownloadComplete?.();
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!certificateRef.current) return;
    
    try {
      setIsGenerating(true);
      toast.info("Generating high-resolution image...");

      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = await html2canvas(certificateRef.current, {
        scale: 5, // Maximum fidelity
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        width: 800,
        height: 566,
      });

      const link = document.createElement('a');
      link.download = `SkillBridge-Certificate-${certificateId}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast.success("High-fidelity image generated!");
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
        toast.success("Certificate link copied to clipboard!");
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success("Certificate link copied to clipboard!");
    }
  };

  const getNameFontSize = (name: string) => {
    if (name.length > 25) return '1.8rem';
    if (name.length > 20) return '2.2rem';
    return '2.8rem';
  };

  const getRoleFontSize = (role: string) => {
    if (role.length > 30) return '1.2rem';
    if (role.length > 20) return '1.5rem';
    return '1.8rem';
  };

  return (
    <div className={`flex flex-col items-center gap-6 w-full ${className}`}>
      {/* Import EB Garamond font */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap');
      `}} />
      
      <div 
        ref={containerRef}
        className="w-full flex justify-center overflow-hidden"
        style={{ height: `${566 * scale}px` }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top' }}>
          <div 
            ref={certificateRef}
            id="certificate-export-container"
            className="relative w-[800px] h-[566px] bg-white shadow-2xl rounded-sm overflow-hidden select-none"
          >
            {/* Background Image as <img> tag for better export clarity */}
            <img 
              src="/skillbridge-certificate.png" 
              alt="Certificate Background"
              className="absolute inset-0 w-full h-full object-contain"
              onLoad={() => setIsLoaded(true)}
              crossOrigin="anonymous"
            />

            {/* User Name - Centered below "This Certificate is Proudly Presented To" */}
            <div 
              className="absolute w-full text-center px-12"
              style={{ 
                top: '43.5%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                fontFamily: "'EB Garamond', serif",
                color: '#1a1a1a',
                fontWeight: 700,
                fontSize: getNameFontSize(userName),
                letterSpacing: '0.01em',
              }}
            >
              {userName}
            </div>

            {/* Role Name - Centered below the description sentence */}
            <div 
              className="absolute w-[80%] text-center"
              style={{ 
                top: '56%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                fontFamily: "'EB Garamond', serif",
                color: '#1a1a1a',
                fontWeight: 700,
                fontSize: getRoleFontSize(roleName),
                lineHeight: 1.2,
              }}
            >
              {roleName}
            </div>

            {/* Completion Date - Inline beside "Issued on" */}
            <div 
              className="absolute"
              style={{ 
                top: '68.5%', 
                left: '44.5%', 
                transform: 'translateY(-50%)',
                fontFamily: "'EB Garamond', serif",
                color: '#444',
                fontWeight: 500,
                fontSize: '1rem',
              }}
            >
              {displayDate}
            </div>

            {/* Certificate ID - Inline beside "Certificate ID:" */}
            <div 
              className="absolute"
              style={{ 
                top: '74.5%', 
                left: '46.5%', 
                transform: 'translateY(-50%)',
                fontFamily: "'EB Garamond', serif",
                color: '#555',
                fontWeight: 500,
                fontSize: '0.9rem',
              }}
            >
              {certificateId}
            </div>
          </div>
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
        <Button 
          variant="secondary" 
          onClick={handleShare}
          className="gap-2"
        >
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