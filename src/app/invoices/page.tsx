"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Plus, Search, Eye, Edit2, Copy, Trash2, CheckCircle, Send, XCircle } from "lucide-react";
import Link from "next/link";
import { InvoiceStatus } from "@/types";
import { format } from "date-fns";

export default function InvoicesPage() {
  const { invoices, clients, removeInvoice, updateInvoice } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");

  const filteredInvoices = invoices.filter(inv => {
    const client = clients.find(c => c.id === inv.clientId);
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) {
      removeInvoice(id);
    }
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch(status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "sent": return "bg-blue-100 text-blue-800";
      case "paid": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: InvoiceStatus) => {
    switch(status) {
      case "draft": return "مسودة";
      case "sent": return "مرسلة";
      case "paid": return "مدفوعة";
      case "cancelled": return "ملغاة";
      default: return "غير معروف";
    }
  };

  const changeStatus = (id: string, newStatus: InvoiceStatus) => {
    updateInvoice(id, { status: newStatus });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">الفواتير</h1>
        <Link 
          href="/invoices/create"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          فاتورة جديدة
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="البحث برقم الفاتورة أو اسم العميل..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white min-w-[150px]"
          >
            <option value="all">جميع الحالات</option>
            <option value="draft">مسودة</option>
            <option value="sent">مرسلة</option>
            <option value="paid">مدفوعة</option>
            <option value="cancelled">ملغاة</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                <th className="p-4 font-semibold">رقم الفاتورة</th>
                <th className="p-4 font-semibold">العميل</th>
                <th className="p-4 font-semibold">التاريخ</th>
                <th className="p-4 font-semibold">الإجمالي</th>
                <th className="p-4 font-semibold">الحالة</th>
                <th className="p-4 font-semibold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.length > 0 ? filteredInvoices.map((invoice) => {
                const client = clients.find(c => c.id === invoice.clientId);
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-blue-600" dir="ltr">{invoice.invoiceNumber}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{client?.name || 'عميل محذوف'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600">إصدار: <span dir="ltr">{format(new Date(invoice.issueDate), 'yyyy-MM-dd')}</span></div>
                      <div className="text-xs text-gray-500 mt-1">استحقاق: <span dir="ltr">{format(new Date(invoice.dueDate), 'yyyy-MM-dd')}</span></div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900" dir="ltr">{invoice.finalTotal.toFixed(2)} {invoice.currency}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {getStatusLabel(invoice.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/invoices/${invoice.id}/preview`} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="عرض الفاتورة">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {invoice.status === "draft" && (
                          <Link href={`/invoices/${invoice.id}/edit`} className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="تعديل">
                            <Edit2 className="w-4 h-4" />
                          </Link>
                        )}
                        {/* Duplicate feature could be added here */}
                        <div className="relative group inline-block">
                          <button className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors" title="تغيير الحالة">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <div className="absolute left-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-100 z-10 hidden group-hover:block">
                            <div className="py-1">
                              <button onClick={() => changeStatus(invoice.id, 'sent')} className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">تحديد كمرسلة</button>
                              <button onClick={() => changeStatus(invoice.id, 'paid')} className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700">تحديد كمدفوعة</button>
                              <button onClick={() => changeStatus(invoice.id, 'cancelled')} className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700">تحديد كملغاة</button>
                              <button onClick={() => changeStatus(invoice.id, 'draft')} className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">إرجاع كمسودة</button>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => handleDelete(invoice.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="حذف">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    لا توجد فواتير.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
