import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CompanySettings, Client, Invoice, PredefinedService } from '@/types';

interface StoreState {
  settings: CompanySettings;
  clients: Client[];
  invoices: Invoice[];
  
  // Settings Actions
  updateSettings: (settings: Partial<CompanySettings>) => void;
  addService: (service: PredefinedService) => void;
  removeService: (id: string) => void;
  
  // Clients Actions
  addClient: (client: Client) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  removeClient: (id: string) => void;
  
  // Invoices Actions
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  removeInvoice: (id: string) => void;
}

const defaultSettings: CompanySettings = {
  name: 'شركتي لتقنية المعلومات',
  logo: '',
  email: 'info@mycompany.com',
  phone: '966500000000',
  address: 'الرياض، المملكة العربية السعودية',
  defaultCurrency: 'SAR',
  invoicePrefix: 'INV-2026-',
  defaultTerms: '1. يتم دفع 50% كدفعة مقدمة قبل البدء بالعمل.\n2. يتم دفع 50% المتبقية عند التسليم.\n3. هذه الفاتورة صالحة لمدة 15 يوماً من تاريخ الإصدار.',
  paymentInfo: 'اسم البنك: \nاسم الحساب: \nرقم الحساب: \nالآيبان: ',
  services: [
    { id: '1', name: 'إنشاء موقع إلكتروني', description: 'تصميم وبرمجة موقع تعريفي للشركة', unitPrice: 3000 },
    { id: '2', name: 'استضافة سنوية', description: 'استضافة سحابية مع دعم فني', unitPrice: 500 },
    { id: '3', name: 'حجز دومين', description: 'حجز نطاق .com لمدة سنة', unitPrice: 60 },
  ],
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      clients: [],
      invoices: [],

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      addService: (service) =>
        set((state) => ({
          settings: {
            ...state.settings,
            services: [...state.settings.services, service],
          },
        })),

      removeService: (id) =>
        set((state) => ({
          settings: {
            ...state.settings,
            services: state.settings.services.filter((s: PredefinedService) => s.id !== id),
          },
        })),

      addClient: (client) =>
        set((state) => ({
          clients: [...state.clients, client],
        })),

      updateClient: (id, updatedClient) =>
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, ...updatedClient } : c
          ),
        })),

      removeClient: (id) =>
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
        })),

      addInvoice: (invoice) =>
        set((state) => ({
          invoices: [...state.invoices, invoice],
        })),

      updateInvoice: (id, updatedInvoice) =>
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...updatedInvoice, updatedAt: new Date().toISOString() } : inv
          ),
        })),

      removeInvoice: (id) =>
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.id !== id),
        })),
    }),
    {
      name: 'invoice-generator-storage',
    }
  )
);
