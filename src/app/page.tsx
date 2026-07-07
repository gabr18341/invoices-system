"use client";

import { useStore } from "@/store/useStore";
import { FileText, Users, DollarSign, CheckCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import PwaClient from "@/components/PwaClient";

export default function DashboardPage() {
  const { invoices, clients, settings } = useStore();

  const totalInvoices = invoices.length;
  const totalClients = clients.length;
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
  
  const totalRevenue = invoices
    .filter(inv => inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + inv.amountPaid, 0);

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">لوحة التحكم</h1>

      <PwaClient />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">إجمالي الفواتير</p>
            <p className="text-2xl font-bold text-gray-900">{totalInvoices}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">الفواتير المدفوعة</p>
            <p className="text-2xl font-bold text-gray-900">{paidInvoices}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">الإيرادات المحصلة</p>
            <p className="text-2xl font-bold text-gray-900" dir="ltr">{totalRevenue.toFixed(2)} {settings.defaultCurrency}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">العملاء</p>
            <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Invoices */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">أحدث الفواتير</h2>
            <Link href="/invoices" className="text-sm text-blue-600 hover:text-blue-800 font-medium">عرض الكل</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentInvoices.length > 0 ? recentInvoices.map(invoice => {
              const client = clients.find(c => c.id === invoice.clientId);
              return (
                <Link key={invoice.id} href={`/invoices/${invoice.id}/preview`} className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900" dir="ltr">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-gray-500">{client?.name}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900" dir="ltr">{invoice.finalTotal.toFixed(2)} {invoice.currency}</p>
                    <p className="text-xs text-gray-500">{format(new Date(invoice.issueDate), 'yyyy-MM-dd')}</p>
                  </div>
                </Link>
              );
            }) : (
              <div className="p-8 text-center text-gray-500 text-sm">لا توجد فواتير بعد</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">إجراءات سريعة</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <Link href="/invoices/create" className="flex flex-col items-center justify-center gap-3 p-6 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors">
              <FileText className="w-8 h-8" />
              <span className="font-semibold">فاتورة جديدة</span>
            </Link>
            <Link href="/clients" className="flex flex-col items-center justify-center gap-3 p-6 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-colors">
              <Users className="w-8 h-8" />
              <span className="font-semibold">إضافة عميل</span>
            </Link>
            <Link href="/settings" className="flex flex-col items-center justify-center gap-3 p-6 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors col-span-2">
              <span className="font-semibold">تحديث بيانات الشركة وإعدادات الفواتير</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
