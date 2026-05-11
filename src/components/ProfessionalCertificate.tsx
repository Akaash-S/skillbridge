import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Share2, 
  FileText, 
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ProfessionalCertificateProps {
  userName: string;
  roleName: string;
  completionDate: string;
  certificateId: string;
  className?: string;
  onDownloadComplete?: () => void;
}

export const ProfessionalCertificate: React.FC<ProfessionalCertificateProps> = ({
  userName,
  roleName,
  completionDate,
  certificateId,
  className = "",
  onDownloadComplete
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scale, setScale] = useState(1);

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

  // Format date for display
  const displayDate = new Date(completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    
    try {
      setIsGenerating(true);
      toast.info("Generating high-quality PDF...");

      // Small delay to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(certificateRef.current, {
        scale: 3, // Very high quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`SkillBridge-Certificate-${certificateId}.pdf`);
      
      toast.success("Certificate downloaded as PDF!");
      onDownloadComplete?.();
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!certificateRef.current) return;
    
    try {
      setIsGenerating(true);
      toast.info("Generating high-quality image...");

      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `SkillBridge-Certificate-${certificateId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success("Certificate downloaded as Image!");
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
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        toast.success("Certificate link copied to clipboard!");
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success("Certificate link copied to clipboard!");
    }
  };

  // Dynamic font sizing for long names
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
      {/* Responsive Wrapper */}
      <div 
        ref={containerRef}
        className="w-full flex justify-center overflow-hidden"
        style={{ height: `${566 * scale}px` }} // Maintain height based on aspect ratio
      >
        {/* Certificate Container - Fixed dimensions, scaled down via CSS for responsiveness */}
        <div 
          ref={certificateRef}
          className="relative w-[800px] h-[566px] bg-white shadow-2xl rounded-sm overflow-hidden select-none origin-top"
          style={{
            backgroundImage: "url('/skillbridge-certificate.png')",
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transform: `scale(${scale})`,
          }}
          onLoad={() => setIsLoaded(true)}
        >
          {/* Placeholder Overlays using Absolute Positioning */}
          
          {/* %%USER_NAME%% */}
          <div 
            className="absolute w-full text-center px-12"
            style={{ 
              top: '47%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              fontFamily: "'Playfair Display', 'Georgia', serif",
              color: '#1a1a1a',
              fontWeight: 700,
              fontSize: getNameFontSize(userName),
              letterSpacing: '0.02em',
              textShadow: '0 1px 1px rgba(0,0,0,0.05)'
            }}
          >
            {userName}
          </div>

          {/* %%ROLE_NAME%% */}
          <div 
            className="absolute w-[60%] text-center"
            style={{ 
              top: '63%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              fontFamily: "'Inter', sans-serif",
              color: '#444',
              fontWeight: 600,
              fontSize: getRoleFontSize(roleName),
              lineHeight: 1.2
            }}
          >
            {roleName}
          </div>

          {/* %%COMPLETION_DATE%% */}
          <div 
            className="absolute"
            style={{ 
              top: '80%', 
              left: '26%', 
              transform: 'translateX(-50%)',
              fontFamily: "'Inter', sans-serif",
              color: '#666',
              fontWeight: 500,
              fontSize: '0.9rem'
            }}
          >
            {displayDate}
          </div>

          {/* %%CERTIFICATE_ID%% */}
          <div 
            className="absolute"
            style={{ 
              top: '80%', 
              left: '74%', 
              transform: 'translateX(-50%)',
              fontFamily: "'JetBrains Mono', monospace",
              color: '#888',
              fontWeight: 400,
              fontSize: '0.75rem'
            }}
          >
            {certificateId}
          </div>

          {/* Optional Verification QR / Badge Area (Bottom Right) */}
          <div className="absolute bottom-4 right-4 opacity-50 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-primary" />
            <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground">Verified by SkillBridge</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
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

      <p className="text-xs text-muted-foreground italic text-center max-w-[400px]">
        This certificate is a verified recognition of your mastery in {roleName}. 
        You can verify its authenticity at any time using the unique ID.
      </p>
    </div>
  );
};
