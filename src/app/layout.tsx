import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "نظام إدارة الفواتير",
  description: "نظام احترافي لإدارة وتوليد الفواتير التقنية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-cairo bg-gray-50 text-gray-900 print:bg-white">
        <div className="flex h-screen overflow-hidden print:h-auto print:overflow-visible print:block">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-l border-gray-200 flex flex-col print:hidden">
            <div className="p-6 text-2xl font-bold text-blue-900 border-b border-gray-200">
              نظام الفواتير
            </div>
            <nav className="flex-1 p-4 space-y-2">
              <a href="/" className="block p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-900 transition-colors">لوحة التحكم</a>
              <a href="/invoices" className="block p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-900 transition-colors">الفواتير</a>
              <a href="/clients" className="block p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-900 transition-colors">العملاء</a>
              <a href="/settings" className="block p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-900 transition-colors">الإعدادات</a>
            </nav>
          </aside>
          
          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
