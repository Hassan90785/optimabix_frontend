export interface Module {
  id?: string;
  moduleName: string;
  description?: string;
  icon?: string; // Icon class or URL for UI representation
  operations: {
    name: 'list' | 'add' | 'view' | 'update' | 'delete';
    isEnabled: boolean;
    routePath?: string;
  }[];
  accessStatus: 'Active' | 'InActive';
  createdAt?: string;
  updatedAt?: string;
}
