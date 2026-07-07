export interface CompanySettings {
  name: string;
  logo: string;
  email: string;
  phone: string;
  address: string;
  defaultCurrency: string;
  invoicePrefix: string;
  defaultTerms: string;
  paymentInfo: string;
  services: PredefinedService[];
}

export interface PredefinedService {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  serviceName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  currency: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  finalTotal: number;
  amountPaid: number;
  amountDue: number;
  terms: string;
  paymentInfo: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}
