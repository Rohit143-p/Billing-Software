import { Bill, Expense, InventoryItem, ProductPerformance, NotificationItem } from '../types';

export const INITIAL_BILLS: Bill[] = [
  {
    id: 'b-084',
    billNumber: 'INV-2023-084',
    customerName: 'Acme Corp',
    phoneNumber: '+91 98765 43210',
    type: 'gst',
    date: '2026-09-01',
    dueDate: '2026-09-15',
    items: [
      { id: 'i-1', name: 'Premium Consulting Services', quantity: 2, rate: 1800.85 },
      { id: 'i-2', name: 'Cloud Architecture Review', quantity: 1, rate: 648.30 }
    ],
    subtotal: 4250.00,
    taxRate: 18,
    taxAmount: 765.00,
    total: 4250.00,
    currency: '₹',
    delivery: { sms: false, whatsapp: true, email: true },
    status: 'paid'
  },
  {
    id: 'b-083',
    billNumber: 'INV-2023-083',
    customerName: 'Stark Ind.',
    phoneNumber: '+91 98111 22334',
    type: 'gst',
    date: '2026-08-20',
    dueDate: '2026-08-30',
    items: [
      { id: 'i-3', name: 'Enterprise SaaS Annual License', quantity: 1, rate: 12000.00 }
    ],
    subtotal: 12000.00,
    taxRate: 18,
    taxAmount: 2160.00,
    total: 12000.00,
    currency: '₹',
    delivery: { sms: true, whatsapp: true, email: false },
    status: 'pending'
  },
  {
    id: 'b-042',
    billNumber: 'RAW-2023-042',
    customerName: 'Walk-in',
    phoneNumber: '+91 99000 11223',
    type: 'raw',
    date: '2026-09-02',
    dueDate: '2026-09-02',
    items: [
      { id: 'i-4', name: 'Hardware Diagnostic Check', quantity: 1, rate: 850.00 }
    ],
    subtotal: 850.00,
    taxRate: 0,
    taxAmount: 0,
    total: 850.00,
    currency: '₹',
    delivery: { sms: false, whatsapp: false, email: true },
    status: 'paid'
  }
];

export const INITIAL_PRODUCTS: ProductPerformance[] = [
  {
    id: 'prod-1',
    name: 'API Access (Pro)',
    metricLabel: '124 Subscriptions',
    revenue: 12400,
    iconName: 'api'
  },
  {
    id: 'prod-2',
    name: 'Enterprise Storage',
    metricLabel: '86 Units',
    revenue: 8600,
    iconName: 'storage'
  },
  {
    id: 'prod-3',
    name: 'Premium Support',
    metricLabel: '42 Contracts',
    revenue: 4200,
    iconName: 'support'
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    title: 'Cloud Infrastructure',
    category: 'AWS, GCP',
    amount: 142000,
    date: '2026-08-28',
    vendor: 'Amazon Web Services / Google Cloud'
  },
  {
    id: 'exp-2',
    title: 'Contractors',
    category: 'Engineering',
    amount: 85500,
    date: '2026-08-25',
    vendor: 'Toptal & Upwork'
  },
  {
    id: 'exp-3',
    title: 'Marketing Spend',
    category: 'AdWords, LinkedIn',
    amount: 64200,
    date: '2026-08-22',
    vendor: 'Google Ads & LinkedIn Business'
  },
  {
    id: 'exp-4',
    title: 'Office Lease',
    category: 'HQ San Francisco',
    amount: 45000,
    date: '2026-08-01',
    vendor: 'SOMA Properties LLC'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Server Rack Type A',
    sku: 'SRA-1024',
    currentQty: 4,
    reorderPt: 10,
    unitPrice: 1250,
    category: 'Hardware',
    status: 'critical'
  },
  {
    id: 'inv-2',
    name: 'Switch 48-Port Pro',
    sku: 'SWP-4800',
    currentQty: 12,
    reorderPt: 15,
    unitPrice: 850,
    category: 'Networking',
    status: 'warning'
  },
  {
    id: 'inv-3',
    name: 'Optic Cable 10G (Box)',
    sku: 'CAB-10G-B',
    currentQty: 2,
    reorderPt: 20,
    unitPrice: 140,
    category: 'Cabling',
    status: 'critical'
  },
  {
    id: 'inv-4',
    name: 'Cat6 Ethernet Spool (1000ft)',
    sku: 'ETH-1000-C6',
    currentQty: 32,
    reorderPt: 15,
    unitPrice: 95,
    category: 'Cabling',
    status: 'normal'
  },
  {
    id: 'inv-5',
    name: 'PCI-e NVMe SSD 4TB',
    sku: 'SSD-4TB-PRO',
    currentQty: 18,
    reorderPt: 8,
    unitPrice: 280,
    category: 'Storage',
    status: 'normal'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: '3 Overdue Invoices',
    description: 'INV-2023-083 ($12,000) and 2 others are past payment terms.',
    time: '10m ago',
    read: false,
    type: 'alert'
  },
  {
    id: 'notif-2',
    title: 'Low Stock Alert: SRA-1024',
    description: 'Server Rack Type A has reached 4 units (reorder threshold: 10).',
    time: '1h ago',
    read: false,
    type: 'alert'
  },
  {
    id: 'notif-3',
    title: 'Payment Received: Acme Corp',
    description: '₹4,250.00 settled via Credit Card.',
    time: '2h ago',
    read: true,
    type: 'success'
  }
];
