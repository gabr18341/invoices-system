"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Invoice, InvoiceItem, InvoiceStatus } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Props {
  initialData?: Invoice;
}

export default function InvoiceForm({ initialData }: Props) {
  const router = useRouter();
  const { settings, clients, addInvoice, updateInvoice, invoices } = useStore();
  
  // Calculate next invoice number
  const getNextInvoiceNumber = () => {
    const prefix = settings.invoicePrefix;
    const existingWithPrefix = invoices.filter(i => i.invoiceNumber.startsWith(prefix));
    return `${prefix}${(existingWithPrefix.length + 1).toString().padStart(4, '0')}`;
  };

  const [formData, setFormData] = useState<Partial<Invoice>>(initialData || {
    invoiceNumber: getNextInvoiceNumber(),
    clientId: "",
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 15 days default
    status: "draft",
    currency: settings.defaultCurrency,
    terms: settings.defaultTerms,
    paymentInfo: settings.paymentInfo || '',
    items: [],
    subtotal: 0,
    discountTotal: 0,
    taxTotal: 0,
    finalTotal: 0,
    amountPaid: 0,
    amountDue: 0,
  });

  const [discountType, setDiscountType] = useState<"fixed" | "percent">("fixed");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(15); // 15% VAT default

  // Recalculate totals whenever items, discount, or tax change
  useEffect(() => {
    const items = formData.items || [];
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    
    let discountTotal = 0;
    if (discountType === "fixed") {
      discountTotal = discountValue;
    } else {
      discountTotal = subtotal * (discountValue / 100);
    }

    const afterDiscount = subtotal - discountTotal;
    const taxTotal = afterDiscount * (taxPercent / 100);
    const finalTotal = afterDiscount + taxTotal;
    const amountDue = finalTotal - (formData.amountPaid || 0);

    setFormData(prev => ({
      ...prev,
      subtotal,
      discountTotal,
      taxTotal,
      finalTotal,
      amountDue
    }));
  }, [formData.items, discountValue, discountType, taxPercent, formData.amountPaid]);

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), {
        id: uuidv4(),
        serviceName: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0
      }]
    }));
  };

  const handleAddPredefinedService = (serviceId: string) => {
    const service = settings.services.find(s => s.id === serviceId);
    if (service) {
      setFormData(prev => ({
        ...prev,
        items: [...(prev.items || []), {
          id: uuidv4(),
          serviceName: service.name,
          description: service.description,
          quantity: 1,
          unitPrice: service.unitPrice,
          total: service.unitPrice
        }]
      }));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...(formData.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    // Recalculate item total
    newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const removeItem = (index: number) => {
    const newItems = [...(formData.items || [])];
    newItems.splice(index, 1);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSave = () => {
    if (!formData.clientId) {
      alert("الرجاء اختيار العميل");
      return;
    }
    if (!formData.items || formData.items.length === 0) {
      alert("الرجاء إضافة بند واحد على الأقل");
      return;
    }

    const now = new Date().toISOString();
    
    if (initialData) {
      updateInvoice(initialData.id, {
        ...formData,
        updatedAt: now
      });
    } else {
      addInvoice({
        ...(formData as Invoice),
        id: uuidv4(),
        createdAt: now,
        updatedAt: now
      });
    }
    
    router.push("/invoices");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/invoices" className="text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowRight className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {initialData ? "تعديل الفاتورة" : "إنشاء فاتورة جديدة"}
          </h1>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors shadow-sm font-semibold"
        >
          <Save className="w-5 h-5" />
          حفظ الفاتورة
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">رقم الفاتورة</label>
                <input 
                  type="text" 
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-left" dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">العميل</label>
                <select 
                  value={formData.clientId}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">اختر عميلاً...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">تاريخ الإصدار</label>
                <input 
                  type="date" 
                  value={formData.issueDate}
                  onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-left" dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">تاريخ الاستحقاق</label>
                <input 
                  type="date" 
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-left" dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">بنود الفاتورة</h2>
              {settings.services.length > 0 && (
                <select 
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddPredefinedService(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                >
                  <option value="">+ إضافة خدمة جاهزة</option>
                  {settings.services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - {s.unitPrice}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-4">
              {formData.items?.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-start p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="col-span-12 md:col-span-5 space-y-2">
                    <input 
                      type="text" 
                      placeholder="اسم الخدمة"
                      value={item.serviceName}
                      onChange={(e) => updateItem(index, 'serviceName', e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded outline-none"
                    />
                    <input 
                      type="text" 
                      placeholder="وصف إضافي للخدمة (اختياري)"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="w-full p-2 text-xs border border-gray-300 rounded outline-none text-gray-600"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2 space-y-1">
                    <label className="text-xs text-gray-500">الكمية</label>
                    <input 
                      type="number" 
                      min="1"
                      value={item.quantity || ''}
                      onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      className="w-full p-2 text-sm border border-gray-300 rounded outline-none text-center"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2 space-y-1">
                    <label className="text-xs text-gray-500">سعر الوحدة</label>
                    <input 
                      type="number" 
                      value={item.unitPrice || ''}
                      onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                      className="w-full p-2 text-sm border border-gray-300 rounded outline-none text-left" dir="ltr"
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2 space-y-1">
                    <label className="text-xs text-gray-500">المجموع</label>
                    <div className="p-2 text-sm font-bold text-gray-800 text-left bg-gray-100 rounded" dir="ltr">
                      {(item.quantity * item.unitPrice).toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-1 flex justify-end pt-6">
                    <button 
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleAddItem}
              className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> إضافة بند جديد
            </button>
          </div>

          {/* Terms & Payment Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">معلومات الدفع</label>
              <textarea 
                value={formData.paymentInfo || ''}
                onChange={(e) => setFormData({...formData, paymentInfo: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 text-sm text-gray-700"
                placeholder="اسم البنك:&#10;اسم الحساب:&#10;رقم الحساب:&#10;الآيبان:"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">الشروط والأحكام</label>
              <textarea 
                value={formData.terms || ''}
                onChange={(e) => setFormData({...formData, terms: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 text-sm text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Summary Area */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-100 pb-4">الملخص المالي</h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>المجموع الفرعي:</span>
                <span className="font-semibold" dir="ltr">{formData.subtotal?.toFixed(2)} {formData.currency}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-gray-600">
                  <span>الخصم:</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={discountValue || ''}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="w-16 p-1 text-sm border border-gray-300 rounded text-center outline-none"
                    />
                    <select 
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="p-1 text-sm border border-gray-300 rounded outline-none"
                    >
                      <option value="fixed">قيمة</option>
                      <option value="percent">%</option>
                    </select>
                  </div>
                </div>
                {formData.discountTotal! > 0 && (
                  <div className="flex justify-end text-red-500 text-xs font-medium" dir="ltr">
                    - {formData.discountTotal?.toFixed(2)} {formData.currency}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-gray-600 border-b border-gray-100 pb-4">
                <span>الضريبة (VAT):</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={taxPercent || ''}
                    onChange={(e) => setTaxPercent(Number(e.target.value))}
                    className="w-16 p-1 text-sm border border-gray-300 rounded text-center outline-none"
                  />
                  <span>%</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-2">
                <span>الإجمالي النهائي:</span>
                <span dir="ltr">{formData.finalTotal?.toFixed(2)} {formData.currency}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-800">تفاصيل الدفع</h2>
            
            <div className="space-y-4 text-sm">
              <div className="space-y-2">
                <label className="block text-gray-600">المبلغ المدفوع:</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={formData.amountPaid || ''}
                    onChange={(e) => setFormData({...formData, amountPaid: Number(e.target.value)})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-left" dir="ltr"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{formData.currency}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center font-bold text-red-600 pt-2 border-t border-gray-100">
                <span>المبلغ المتبقي:</span>
                <span dir="ltr">{formData.amountDue?.toFixed(2)} {formData.currency}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-800">حالة الفاتورة</h2>
            <select 
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as InvoiceStatus})}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
            >
              <option value="draft">مسودة</option>
              <option value="sent">مرسلة</option>
              <option value="paid">مدفوعة</option>
              <option value="cancelled">ملغاة</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
