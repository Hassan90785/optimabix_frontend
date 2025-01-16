export interface Role {
  id?: string;
  roleName: string;
  description?: string;
  companyAccessControl: {
    companyId: string; // Company ID reference
    permissions: {
      moduleId: string; // Module ID reference
      operationsAllowed: ('list' | 'add' | 'view' | 'update' | 'delete')[];
    }[];
    accessStatus: 'Active' | 'Suspended' | 'Revoked' | 'Trial' | 'Expired';
    validUntil?: string;
  };
  userAccessControl: {
    userId: string; // User ID reference
    permissions: {
      moduleId: string; // Module ID reference
      operationsAllowed: ('list' | 'add' | 'view' | 'update' | 'delete')[];
    }[];
    accessStatus: 'Active' | 'Suspended' | 'Revoked' | 'Trial' | 'Expired';
    validUntil?: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}
