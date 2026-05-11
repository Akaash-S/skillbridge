import { apiClient } from './apiClient';

export interface Certificate {
  certificateId: string;
  uid: string;
  userName: string;
  roleId: string;
  roleName: string;
  completionDate: string;
  issuedAt: string;
  totalSkills: number;
  roadmapId: string;
  status: 'verified';
}

class CertificateService {
  private static instance: CertificateService;

  private constructor() {}

  public static getInstance(): CertificateService {
    if (!CertificateService.instance) {
      CertificateService.instance = new CertificateService();
    }
    return CertificateService.instance;
  }

  /**
   * Verify roadmap completion and issue a certificate
   */
  public async verifyAndIssue(roleId: string): Promise<Certificate> {
    return apiClient.post<Certificate>('/certificate/verify', { roleId });
  }

  /**
   * Get all certificates for the current user
   */
  public async getUserCertificates(): Promise<Certificate[]> {
    return apiClient.get<Certificate[]>('/certificate/user');
  }

  /**
   * Verify a certificate by ID (public)
   */
  public async verifyCertificate(certId: string): Promise<Certificate> {
    return apiClient.request<Certificate>(`/certificate/${certId}`, { requireAuth: false });
  }
}

export const certificateService = CertificateService.getInstance();
export default certificateService;
