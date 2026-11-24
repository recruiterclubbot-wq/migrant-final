export type PageRoute =
  | '/'
  | '/vacancies'
  | '/business'
  | '/about'
  | '/contacts'
  | '/cabinet'
  | '/admin';

export type CountryCode = 'DE' | 'PL' | 'CZ' | 'UA' | 'NL' | 'LT' | 'EU';

export type IconType =
  | 'plumbing'
  | 'painting'
  | 'warehouse'
  | 'manufacturing'
  | 'logistics'
  | 'support'
  | 'construction';

export type UserRole = 'candidate' | 'employer' | 'admin';
export type AccountType = 'candidate' | 'employer';
export type UserStatus = 'active' | 'blocked';
export type ApplicationStatus = 'new' | 'in_progress' | 'approved' | 'rejected';
export type LeadType = 'job_application' | 'b2b_request' | 'consultation';

export interface Vacancy {
  id: string;
  title: string;
  country: string;
  countryCode: CountryCode;
  profession: string;
  salaryText: string;
  salaryMonthlyText: string;
  schedule: string;
  housing: string;
  contractType: string;
  description: string;
  iconType: IconType;
  active: boolean;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface VacancyInput {
  title: string;
  country: string;
  countryCode: CountryCode;
  profession: string;
  salaryText: string;
  salaryMonthlyText: string;
  schedule: string;
  housing: string;
  contractType: string;
  description: string;
  iconType: IconType;
  active: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  phone?: string;
  companyName?: string;
  accountType: AccountType;
  desiredCountry?: string;
  bio?: string;
  role: UserRole;
  status: UserStatus;
  savedVacancyIds?: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface LeadOrApplication {
  id: string;
  sourceCollection: 'applications' | 'leads';
  userId?: string;
  type: LeadType;
  vacancyId?: string;
  vacancyTitle?: string;
  fullName: string;
  phone: string;
  email?: string;
  country?: string;
  companyName?: string;
  staffCount?: string;
  comment?: string;
  status: ApplicationStatus;
  adminNote?: string;
  createdAtMs: number;
}

export interface LeadFormInput {
  type: LeadType;
  fullName: string;
  phone: string;
  email?: string;
  country?: string;
  companyName?: string;
  staffCount?: string;
  comment?: string;
  vacancyId?: string;
  vacancyTitle?: string;
}

export interface NotificationSettingsSummary {
  telegramConfigured: boolean;
  telegramChatId: string;
  emailConfigured: boolean;
  adminNotificationEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  publicAppUrl: string;
  recentLogs: NotificationDeliveryLog[];
}

export interface NotificationDeliveryLog {
  id: string;
  createdAt: string;
  leadName: string;
  leadType: LeadType;
  telegramStatus: 'sent' | 'skipped' | 'error';
  emailStatus: 'sent' | 'skipped' | 'error';
  detail: string;
}

export interface DashboardAnalytics {
  totalVacancies: number;
  activeVacancies: number;
  totalLeads: number;
  newLeads: number;
  inProgressLeads: number;
  approvedLeads: number;
  rejectedLeads: number;
  totalUsers: number;
  blockedUsers: number;
  vacanciesByCountry: Array<{ country: string; count: number }>;
  leadsByType: Array<{ type: LeadType; label: string; count: number }>;
}
