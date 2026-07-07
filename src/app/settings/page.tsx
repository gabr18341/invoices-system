"use client";

import { useStore } from "@/store/useStore";
import { useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function SettingsPage() {
  const { settings, updateSettings, addService, removeService } = useStore();
  
  // Local state for the form to avoid continuous re-renders on every keystroke
  const [formData, setFormData] = useState(settings);
  const [newService, setNewService] = useState({ name: "", description: "", unitPrice: 0 });

  const handleSave = () => {
    updateSettings(formData);
    alert("تم حفظ الإعدادات بنجاح");
  };

  const handleAddService = () => {
    if (!newService.name || newService.unitPrice <= 0) return;
    addService({
      id: uuidv4(),
      name: newService.name,
      description: newService.description,
      unitPrice: Number(newService.unitPrice)
    });
    setNewService({ name: "", description: "", unitPrice: 0 });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">إعدادات النظام</h1>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Save className="w-5 h-5" />
          حفظ التغييرات
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">بيانات الشركة</h2>
          <p className="text-sm text-gray-500 mt-1">هذه البيانات ستظهر في ترويسة الفاتورة</p>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">اسم الشركة</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-left" dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">رقم الجوال</label>
            <input 
              type="text" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-left" dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">العنوان</label>
            <input 
              type="text" 
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">شعار الشركة</label>
            <div className="flex items-center gap-4">
              {formData.logo && (
                <img src={formData.logo} alt="شعار الشركة" className="h-16 object-contain border border-gray-200 rounded p-1 bg-white" />
              )}
              <input 
                type="file" 
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">إعدادات الفواتير</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">بادئة رقم الفاتورة</label>
            <input 
              type="text" 
              value={formData.invoicePrefix}
              onChange={(e) => setFormData({...formData, invoicePrefix: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-left" dir="ltr"
              placeholder="مثال: INV-2026-"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">العملة الافتراضية</label>
            <select 
              value={formData.defaultCurrency}
              onChange={(e) => setFormData({...formData, defaultCurrency: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-left" dir="ltr"
            >
              <option value="SAR">ريال سعودي (SAR)</option>
              <option value="USD">دولار أمريكي (USD)</option>
              <option value="AED">درهم إماراتي (AED)</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">الشروط والأحكام الافتراضية</label>
            <textarea 
              value={formData.defaultTerms || ''}
              onChange={(e) => setFormData({...formData, defaultTerms: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-32"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">معلومات الدفع الافتراضية (الحساب البنكي)</label>
            <textarea 
              value={formData.paymentInfo || ''}
              onChange={(e) => setFormData({...formData, paymentInfo: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-32 text-right"
              placeholder="اسم البنك:&#10;اسم الحساب:&#10;رقم الحساب:&#10;الآيبان:"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">الخدمات الجاهزة</h2>
            <p className="text-sm text-gray-500 mt-1">تسهل عليك اختيار الخدمات عند إنشاء فاتورة جديدة</p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex gap-4 items-end mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex-1 space-y-2">
              <label className="block text-xs font-medium text-gray-700">اسم الخدمة</label>
              <input 
                type="text" 
                value={newService.name}
                onChange={(e) => setNewService({...newService, name: e.target.value})}
                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex-2 space-y-2 w-1/3">
              <label className="block text-xs font-medium text-gray-700">الوصف</label>
              <input 
                type="text" 
                value={newService.description}
                onChange={(e) => setNewService({...newService, description: e.target.value})}
                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="w-24 space-y-2">
              <label className="block text-xs font-medium text-gray-700">السعر</label>
              <input 
                type="number" 
                value={newService.unitPrice || ''}
                onChange={(e) => setNewService({...newService, unitPrice: Number(e.target.value)})}
                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-left" dir="ltr"
              />
            </div>
            <button 
              onClick={handleAddService}
              className="bg-gray-800 hover:bg-gray-900 text-white p-2 rounded flex items-center gap-1 text-sm h-[38px] transition-colors"
            >
              <Plus className="w-4 h-4" />
              إضافة
            </button>
          </div>

          <div className="space-y-3">
            {settings.services.map((service) => (
              <div key={service.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="font-semibold text-gray-800">{service.name}</h3>
                  <p className="text-sm text-gray-500">{service.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-900" dir="ltr">{service.unitPrice} {settings.defaultCurrency}</span>
                  <button 
                    onClick={() => removeService(service.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {settings.services.length === 0 && (
              <p className="text-center text-gray-500 py-4">لا توجد خدمات مضافة حالياً.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
