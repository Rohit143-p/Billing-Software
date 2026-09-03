export type TabType = 'dashboard' | 'billing' | 'analytics' | 'expenses' | 'menu';

export type BillingType = 'raw' | 'gst';

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  rate: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  customerName: string;
  phoneNumber: string;
  type: BillingType;
  date: string;
  dueDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  delivery: {
    sms: boolean;
    whatsapp: boolean;
    email: boolean;
  };
  status: 'paid' | 'pending' | 'overdue';
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  vendor?: string;
  note?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  currentQty: number;
  reorderPt: number;
  unitPrice: number;
  category: string;
  status?: 'critical' | 'warning' | 'normal';
}

export interface ProductPerformance {
  id: string;
  name: string;
  metricLabel: string;
  revenue: number;
  iconName: 'api' | 'storage' | 'support';
}

export interface BusinessConfig {
  // Brand & Identity
  businessName: string;
  tagline: string;
  brandShort: string;
  industry: string;
  brandColor: string;

  // Contact & Location
  email: string;
  phone: string;
  website: string;
  address: string;
  cityStateZip: string;

  // Regulatory & Tax
  taxSystem: 'gst' | 'vat' | 'sales_tax' | 'custom' | 'none';
  taxLabel: string;
  taxNumber: string;
  defaultTaxRate: number;

  // Financial & Currency
  currency: string;
  currencyCode: string;

  // Invoicing & Numbering Rules
  invoicePrefix: string;
  rawBillPrefix: string;
  paymentTermsDays: number;
  termsAndConditions: string;
  footerNote: string;

  // Banking & Payment Collection
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingOrIfsc: string;
  upiOrPaypal: string;
  paymentNote: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'alert' | 'info' | 'success';
}

export type UserRole = 'owner' | 'manager' | 'accountant' | 'staff';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  businessName: string;
  phone?: string;
  avatarColor?: string;
  createdAt: string;
}

export interface AuthSession {
  user: UserAccount;
  token: string;
  loginAt: string;
}
