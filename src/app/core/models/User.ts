export interface User {
  _id?: string;
  fullName: string;
  username: string;
  email: string;
  password?: string;
  phone?: string;
  role: string; // Role ID
  companyId: any // Company ID
  accessStatus: 'Active' | 'Suspended' | 'Revoked' | 'Trial' | 'Expired';
  accessStatusReason?: string;
  lastLogin?: string;
  createdBy?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
