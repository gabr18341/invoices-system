"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Plus, Edit2, Trash2, Search, FileText } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Client } from "@/types";
import Link from "next/link";

export default function ClientsPage() {
  const { clients, addClient, updateClient, removeClient, invoices } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  const filteredClients = clients.filter(c => 
    c.name.includes(searchTerm) || 
    c.email.includes(searchTerm) || 
    c.phone.includes(searchTerm)
  );

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address
      });
    } else {
      setEditingClient(null);
      setFormData({ name: "", email: "", phone: "", address: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleSave = () => {
    if (!formData.name) return;

    if (editingClient) {
      updateClient(editingClient.id, formData);
    } else {
      addClient({
        id: uuidv4(),
        ...formData,
        createdAt: new Date().toISOString()
      });
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
      removeClient(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">إدارة العملاء</h1>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          عميل جديد
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="البحث بالاسم، الإيميل، أو رقم الجوال..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                <th className="p-4 font-semibold">العميل</th>
                <th className="p-4 font-semibold">معلومات التواصل</th>
                <th className="p-4 font-semibold">عدد الفواتير</th>
                <th className="p-4 font-semibold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClients.length > 0 ? filteredClients.map((client) => {
                const clientInvoicesCount = invoices.filter(inv => inv.clientId === client.id).length;
                return (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{client.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{client.address || "بدون عنوان"}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-700" dir="ltr">{client.phone}</div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-800 bg-blue-100 rounded-full">
                        {clientInvoicesCount}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/invoices?client=${client.id}`} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="عرض الفواتير">
                          <FileText className="w-4 h-4" />
                        </Link>
                        <button onClick={() => openModal(client)} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="تعديل">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(client.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="حذف">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    لا يوجد عملاء مطابقين للبحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingClient ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">اسم العميل / الشركة *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-left" dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">رقم الجوال</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-left" dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">العنوان</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={handleSave}
                disabled={!formData.name}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
