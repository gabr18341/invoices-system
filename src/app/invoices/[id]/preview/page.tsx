"use client";

import { useStore } from "@/store/useStore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Invoice } from "@/types";
import { ArrowRight, Printer, Download } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";

export default function InvoicePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { invoices, clients, settings } = useStore();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.id) {
      const found = invoices.find(inv => inv.id === params.id);
      if (found) {
        setInvoice(found);
      } else {
        router.push("/invoices");
      }
    }
  }, [params.id, invoices, router]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice_${invoice?.invoiceNumber}`,
  });

  if (!invoice) return <div className="p-8 text-center">جاري التحميل...</div>;

  const client = clients.find(c => c.id === invoice.clientId);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 sm:pb-20 print:max-w-none print:m-0 print:p-0 print:space-y-0">
      {/* Actions Toolbar - Hidden on Print */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 print:hidden bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <Link href="/invoices" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
          <ArrowRight className="w-5 h-5" />
          العودة للفواتير
        </Link>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => handlePrint()}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            طباعة
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            حفظ PDF
          </button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden print:shadow-none print:rounded-none">
        <div 
          ref={printRef} 
          className="p-5 sm:p-8 md:p-12 print:p-0 bg-white min-h-[1056px] print:min-h-0 text-gray-900 mx-auto print:max-w-full"
          style={{ maxWidth: '800px' }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 border-b-2 border-gray-200 pb-6 sm:pb-8 mb-6 sm:mb-8">
            <div className="space-y-2 max-w-full sm:max-w-xs">
              {settings.logo ? (
                <img src={settings.logo} alt={settings.name} className="max-h-20 object-contain mb-4" />
              ) : (
                <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-2 sm:mb-4">{settings.name}</h1>
              )}
              <p className="text-gray-600 text-sm">{settings.address}</p>
              <p className="text-gray-600 text-sm" >{settings.phone}</p>
              <p className="text-gray-600 text-sm">{settings.email}</p>
            </div>
            <div className="text-left sm:self-start">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-200 uppercase tracking-widest mb-3 sm:mb-4">INVOICE</h2>
              <div className="space-y-1">
                <div className="flex justify-end gap-4 text-sm">
                  <span className="font-semibold text-gray-800">رقم الفاتورة:</span>
                  <span className="text-gray-600 w-24 text-left" dir="ltr">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-end gap-4 text-sm">
                  <span className="font-semibold text-gray-800">تاريخ الإصدار:</span>
                  <span className="text-gray-600 w-24 text-left" dir="ltr">{format(new Date(invoice.issueDate), 'yyyy-MM-dd')}</span>
                </div>
                <div className="flex justify-end gap-4 text-sm">
                  <span className="font-semibold text-gray-800">تاريخ الاستحقاق:</span>
                  <span className="text-gray-600 w-24 text-left" dir="ltr">{format(new Date(invoice.dueDate), 'yyyy-MM-dd')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="mb-8 sm:mb-10">
            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-3">فاتورة إلى:</h3>
            <div className="bg-gray-50 rounded-lg p-4 w-full sm:inline-block sm:min-w-[300px]">
              <h4 className="text-xl font-bold text-gray-900 mb-1">{client?.name}</h4>
              <p className="text-gray-600 text-sm">{client?.address}</p>
              <p className="text-gray-600 text-sm mt-2" >{client?.phone}</p>
              <p className="text-gray-600 text-sm">{client?.email}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <div className="overflow-x-auto -mx-5 sm:mx-0">
              <table className="w-full min-w-[680px] sm:min-w-0 text-right border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-900 text-gray-900">
                  <th className="py-3 px-2 font-bold w-1/2">الخدمة / الوصف</th>
                  <th className="py-3 px-2 font-bold text-center">الكمية</th>
                  <th className="py-3 px-2 font-bold">السعر ({invoice.currency})</th>
                  <th className="py-3 px-2 font-bold">المجموع ({invoice.currency})</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-4 px-2">
                      <div className="font-semibold text-gray-900">{item.serviceName}</div>
                      {item.description && <div className="text-sm text-gray-500 mt-1">{item.description}</div>}
                    </td>
                    <td className="py-4 px-2 text-center text-gray-700">{item.quantity}</td>
                    <td className="py-4 px-2 text-gray-700" dir="ltr">{item.unitPrice.toFixed(2)}</td>
                    <td className="py-4 px-2 text-gray-900 font-semibold" dir="ltr">{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* Totals & Terms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              {invoice.paymentInfo && (
                <div>
                  <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">معلومات الدفع:</h3>
                  <div className="text-gray-600 text-sm whitespace-pre-line leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                    {invoice.paymentInfo}
                  </div>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">الشروط والأحكام:</h3>
                  <div className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">
                    {invoice.terms}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>المجموع الفرعي:</span>
                  <span dir="ltr">{invoice.subtotal.toFixed(2)} {invoice.currency}</span>
                </div>
                {invoice.discountTotal > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>الخصم:</span>
                    <span dir="ltr">- {invoice.discountTotal.toFixed(2)} {invoice.currency}</span>
                  </div>
                )}
                {invoice.taxTotal > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>الضريبة (VAT):</span>
                    <span dir="ltr">{invoice.taxTotal.toFixed(2)} {invoice.currency}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xl font-bold text-gray-900 pt-4 border-t border-gray-200">
                  <span>الإجمالي:</span>
                  <span dir="ltr">{invoice.finalTotal.toFixed(2)} {invoice.currency}</span>
                </div>
                
                {(invoice.amountPaid > 0 || invoice.amountDue > 0) && (
                  <div className="pt-4 mt-4 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>المدفوع:</span>
                      <span dir="ltr">{invoice.amountPaid.toFixed(2)} {invoice.currency}</span>
                    </div>
                    <div className="flex justify-between text-red-600 font-bold">
                      <span>المتبقي:</span>
                      <span dir="ltr">{invoice.amountDue.toFixed(2)} {invoice.currency}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-8 border-t border-gray-200 text-gray-500 text-sm">
            <p>شكراً لتعاملكم معنا!</p>
            <p className="mt-1">تم إصدار هذه الفاتورة بواسطة {settings.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
