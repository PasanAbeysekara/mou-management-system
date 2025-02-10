export type UserRole = 'USER' | 'LEGAL_ADMIN' | 'FACULTY_ADMIN' | 'SENATE_ADMIN' | 'UGC_ADMIN' | 'SUPER_ADMIN';

export type DomainKey = 'legal' | 'faculty' | 'senate' | 'ugc';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

export interface ApprovalObject {
  approved: boolean;
  date?: string | null;
}
export interface ApprovalStatus {
  approved: boolean;
  date?: Date;
  approvedBy?: string;
  comments?: string;
}

export interface MOUStatus {
  legal: ApprovalStatus;
  faculty: ApprovalStatus;
  senate: ApprovalStatus;
  ugc: ApprovalStatus;
}

export interface MOUDocuments {
  justification: string;
  additionalDocs?: string[];
}

export interface ApprovalHistory {
  stage: 'legal' | 'faculty' | 'senate' | 'ugc';
  action: 'approved' | 'rejected';
  date: Date;
  by: string;
  comments?: string;
}

export interface MOUSubmission {
  id: string;
  title: string;
  partnerOrganization: string;
  purpose: string;
  description: string;
  dateSubmitted: Date;
  datesSigned?: Date | null;
  validUntil: Date;
  submittedBy: string;
  status: MOUStatus;
  documents: MOUDocuments;
  renewalOf?: string | null;
  history: ApprovalHistory[];
}

export interface DashboardAnalytics {
  totalSubmissions: number;
  activeSubmissions: number;
  pendingSubmissions: number;
  expiringMOUs: number;
  approvalRate: number;
}

// Prisma JSON type declarations
declare global {
  namespace PrismaJson {
    type Status = MOUStatus
    type Documents = MOUDocuments
    type History = ApprovalHistory[]
  }
}