import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Download, 
  Share2, 
  Trophy, 
  Star, 
  Award,
  Calendar,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CertificateProps {
  userName: string;
  userEmail?: string;
  roleName: string;
  completionDate: Date;
  skillsCompleted: number;
  totalHours?: number;
  readinessScore?: number;
  onDownload?: () => void;
  onShare?: () => void;
  className?: string;
}

export const Certificate: React.FC<CertificateProps> = ({
  userName,
  userEmail,
  roleName,
  completionDate,
  skillsCompleted,
  totalHours = 0,
  readinessScore = 100,
  onDownload,
  onShare,
  className = ""
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    try {
      if (onDownload) {
        onDownload();
      } else {
        // Default download implementation with debug info
        console.log('Starting PDF download process...');
        console.log('Certificate ref:', certificateRef.current);
        await downloadAsPDF();
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error(`Failed to download certificate: ${error.message}`);
    }
  };

  const handleShare = async () => {
    try {
      if (onShare) {
        onShare();
      } else {
        // Default share implementation
        await shareCertificate();
      }
    } catch (error) {
      console.error('Error sharing certificate:', error);
      toast.error('Failed to share certificate');
    }
  };

  const downloadAsPDF = async () => {
    if (!certificateRef.current) {
      toast.error('Certificate not ready for download');
      return;
    }

    try {
      toast.info('Generating PDF certificate...', { duration: 2000 });
      
      // Wait a bit for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create canvas from the certificate element with better options
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false, // Disable logging
        width: certificateRef.current.scrollWidth,
        height: certificateRef.current.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      // Check if canvas was created successfully
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Failed to create canvas from certificate');
      }

      // Create PDF with proper dimensions
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Calculate dimensions to fit A4 landscape
      const pdfWidth = 297; // A4 landscape width in mm
      const pdfHeight = 210; // A4 landscape height in mm
      const imgAspectRatio = canvas.width / canvas.height;
      const pdfAspectRatio = pdfWidth / pdfHeight;
      
      let finalWidth, finalHeight, xOffset, yOffset;
      
      if (imgAspectRatio > pdfAspectRatio) {
        // Image is wider than PDF
        finalWidth = pdfWidth;
        finalHeight = pdfWidth / imgAspectRatio;
        xOffset = 0;
        yOffset = (pdfHeight - finalHeight) / 2;
      } else {
        // Image is taller than PDF
        finalHeight = pdfHeight;
        finalWidth = pdfHeight * imgAspectRatio;
        xOffset = (pdfWidth - finalWidth) / 2;
        yOffset = 0;
      }

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
      
      // Generate filename
      const fileName = `skillbridge-certificate-${roleName.toLowerCase().replace(/\s+/g, '-')}-${completionDate.toISOString().split('T')[0]}.pdf`;
      
      // Save the PDF
      pdf.save(fileName);
      
      toast.success('PDF certificate downloaded successfully!', { duration: 3000 });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('PDF generation failed. Trying HTML download...');
      // Fallback to HTML download
      await downloadAsHTML();
    }
  };

  const downloadSimplePDF = async () => {
    try {
      toast.info('Generating simple PDF certificate...');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Add content directly to PDF without html2canvas
      pdf.setFontSize(24);
      pdf.text('SkillBridge Certificate of Completion', 148.5, 40, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.text(`This certifies that`, 148.5, 60, { align: 'center' });
      
      pdf.setFontSize(28);
      pdf.text(userName, 148.5, 80, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.text(`has successfully completed the comprehensive learning roadmap for`, 148.5, 100, { align: 'center' });
      
      pdf.setFontSize(20);
      pdf.text(roleName, 148.5, 120, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.text(`Skills Completed: ${skillsCompleted}`, 50, 150);
      pdf.text(`Total Hours: ${totalHours}h`, 50, 165);
      pdf.text(`Readiness Score: ${readinessScore}%`, 50, 180);
      pdf.text(`Completion Date: ${formatDate(completionDate)}`, 200, 150);
      
      pdf.setFontSize(12);
      pdf.text('Verified by SkillBridge Learning Platform', 148.5, 200, { align: 'center' });
      
      const fileName = `skillbridge-certificate-${roleName.toLowerCase().replace(/\s+/g, '-')}-${completionDate.toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success('Simple PDF certificate downloaded successfully!');
    } catch (error) {
      console.error('Error generating simple PDF:', error);
      toast.error('Simple PDF generation failed');
    }
  };

  const downloadAsHTML = async () => {
    const certificateHTML = generateCertificateHTML();
    const blob = new Blob([certificateHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skillbridge-certificate-${roleName.toLowerCase().replace(/\s+/g, '-')}-${completionDate.toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('HTML certificate downloaded successfully!');
  };

  const shareCertificate = async () => {
    const shareText = `🎉 I just completed my ${roleName} learning roadmap on SkillBridge! 
    
✅ ${skillsCompleted} skills mastered
📈 ${readinessScore}% job-ready
⏱️ ${totalHours} hours invested
🏆 Certificate earned: ${completionDate.toLocaleDateString()}

Ready to take on new challenges! #SkillBridge #LearningJourney #CareerGrowth`;

    if (navigator.share) {
      await navigator.share({
        title: `${userName} - ${roleName} Certificate`,
        text: shareText,
        url: window.location.origin
      });
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success('Certificate details copied to clipboard!');
    }
  };

  const generateCertificateHTML = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SkillBridge Certificate - ${userName}</title>
    <style>
        body {
            font-family: 'Georgia', serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .certificate {
            background: white;
            padding: 60px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 800px;
            width: 100%;
            text-align: center;
            border: 8px solid #f8f9fa;
            position: relative;
        }
        .certificate::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 2px solid #667eea;
            border-radius: 12px;
        }
        .header {
            margin-bottom: 40px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        .certificate-title {
            font-size: 48px;
            color: #2d3748;
            margin: 20px 0;
            font-weight: bold;
        }
        .subtitle {
            font-size: 18px;
            color: #718096;
            margin-bottom: 40px;
        }
        .recipient {
            font-size: 36px;
            color: #2d3748;
            margin: 30px 0;
            font-weight: bold;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            display: inline-block;
        }
        .achievement {
            font-size: 20px;
            color: #4a5568;
            margin: 30px 0;
            line-height: 1.6;
        }
        .stats {
            display: flex;
            justify-content: space-around;
            margin: 40px 0;
            flex-wrap: wrap;
        }
        .stat {
            text-align: center;
            margin: 10px;
        }
        .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            font-size: 14px;
            color: #718096;
            margin-top: 5px;
        }
        .footer {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 1px solid #e2e8f0;
        }
        .date {
            font-size: 16px;
            color: #718096;
        }
        .signature {
            margin-top: 30px;
            font-style: italic;
            color: #4a5568;
        }
        @media print {
            body { background: white; padding: 0; }
            .certificate { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="header">
            <div class="logo">🚀 SkillBridge</div>
            <div class="certificate-title">Certificate of Completion</div>
            <div class="subtitle">This certifies that</div>
        </div>
        
        <div class="recipient">${userName}</div>
        
        <div class="achievement">
            has successfully completed the comprehensive learning roadmap for
            <strong>${roleName}</strong> and demonstrated mastery of all required skills
            through dedicated study and practical application.
        </div>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-value">${skillsCompleted}</div>
                <div class="stat-label">Skills Mastered</div>
            </div>
            <div class="stat">
                <div class="stat-value">${totalHours}h</div>
                <div class="stat-label">Hours Invested</div>
            </div>
            <div class="stat">
                <div class="stat-value">${readinessScore}%</div>
                <div class="stat-label">Job Readiness</div>
            </div>
        </div>
        
        <div class="footer">
            <div class="date">
                Completed on ${completionDate.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
            </div>
            <div class="signature">
                Verified by SkillBridge Learning Platform
            </div>
        </div>
    </div>
</body>
</html>`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div 
          ref={certificateRef}
          className="relative bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 p-8"
        >
          {/* Decorative Elements */}
          <div className="absolute top-4 left-4 text-primary/20">
            <Sparkles className="h-8 w-8" />
          </div>
          <div className="absolute top-4 right-4 text-accent/20">
            <Star className="h-8 w-8" />
          </div>
          <div className="absolute bottom-4 left-4 text-primary/20">
            <Award className="h-8 w-8" />
          </div>
          <div className="absolute bottom-4 right-4 text-accent/20">
            <Trophy className="h-8 w-8" />
          </div>

          {/* Certificate Content */}
          <div className="text-center space-y-6 relative z-10">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Trophy className="h-8 w-8" />
                <span className="text-2xl font-bold">SkillBridge</span>
              </div>
              <h1 className="text-4xl font-bold text-foreground">
                Certificate of Completion
              </h1>
              <p className="text-muted-foreground">This certifies that</p>
            </div>

            {/* Recipient */}
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary border-b-2 border-primary/30 pb-2 inline-block">
                {userName}
              </div>
              {userEmail && (
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              )}
            </div>

            {/* Achievement */}
            <div className="space-y-4 max-w-2xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed">
                has successfully completed the comprehensive learning roadmap for
              </p>
              <div className="text-2xl font-bold text-accent">
                {roleName}
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                and demonstrated mastery of all required skills through dedicated study and practical application.
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-6 py-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{skillsCompleted}</div>
                <div className="text-sm text-muted-foreground">Skills Mastered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">{totalHours}h</div>
                <div className="text-sm text-muted-foreground">Hours Invested</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{readinessScore}%</div>
                <div className="text-sm text-muted-foreground">Job Readiness</div>
              </div>
            </div>

            {/* Footer */}
            <div className="space-y-4 pt-6 border-t border-border">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Completed on {formatDate(completionDate)}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                <span>Verified by SkillBridge Learning Platform</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-background border-t">
          <div className="flex gap-3 justify-center flex-wrap">
            {/* <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button> */}
            <Button 
              variant="outline" 
              onClick={downloadSimplePDF} 
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Download PDF
            </Button>
            {/* <Button 
              variant="outline" 
              onClick={downloadAsHTML} 
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Download HTML
            </Button> */}
            <Button 
              variant="outline" 
              onClick={async () => {
                if (!certificateRef.current) return;
                try {
                  const canvas = await html2canvas(certificateRef.current, { scale: 2 });
                  const link = document.createElement('a');
                  link.download = `skillbridge-certificate-${roleName.toLowerCase().replace(/\s+/g, '-')}.png`;
                  link.href = canvas.toDataURL();
                  link.click();
                  toast.success('Image downloaded successfully!');
                } catch (error) {
                  toast.error('Failed to download image');
                }
              }} 
              className="gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              Download Image
            </Button>
            <Button variant="outline" onClick={handleShare} className="gap-2">
              <Share2 className="h-4 w-4" />
              Share Achievement
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                toast.info("LinkedIn integration coming soon!");
              }}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Add to LinkedIn
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Multiple download formats available • Share your achievement with employers and your professional network
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Certificate;