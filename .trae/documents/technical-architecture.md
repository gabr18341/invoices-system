## 1. تصميم الهيكلية
يعتمد النظام على هيكلية الواجهة الأمامية المتقدمة مع إدارة الحالة محلياً أو باستخدام قواعد بيانات خفيفة/محلية تناسب بيئة المتصفح، لعدم وجود متطلبات لخادم خلفي (Backend) معقد في هذه المرحلة.

```mermaid
graph TD
    A["واجهة المستخدم (Next.js + React)"] --> B["إدارة الحالة (Zustand / Context)"]
    B --> C["المنطق وحساب الإجماليات"]
    B --> D["التخزين المحلي (LocalStorage / IndexedDB)"]
    A --> E["مكتبة تصدير PDF"]
```

## 2. وصف التقنيات
- **الواجهة الأمامية**: Next.js (App Router) + React@18 + TypeScript
- **التصميم والتنسيق**: Tailwind CSS + دعم RTL
- **مكونات الواجهة**: Radix UI أو Shadcn UI (لبناء واجهات سريعة واحترافية)
- **إدارة الحالة والتخزين**: Zustand (لإدارة حالة الإعدادات، الفواتير، العملاء) مع Persist Middleware للحفظ في LocalStorage/IndexedDB.
- **توليد الـ PDF**: مكتبات مثل `html2canvas` + `jspdf` أو `react-to-print` للطباعة المباشرة التي تحول المتصفح لـ PDF بشكل ممتاز وبدعم للغة العربية.
- **إدارة النماذج والتحقق**: React Hook Form + Zod.
- **الخطوط**: next/font (Cairo / Tajawal).

## 3. تعريف المسارات (Routes)
| المسار | الغرض |
|-------|---------|
| `/` | لوحة التحكم وملخص سريع (أو التوجيه لقائمة الفواتير) |
| `/invoices` | قائمة الفواتير (البحث والفلترة) |
| `/invoices/create` | إنشاء فاتورة جديدة |
| `/invoices/[id]/edit` | تعديل فاتورة موجودة |
| `/invoices/[id]/preview` | معاينة وتصدير/طباعة الفاتورة |
| `/clients` | إدارة قائمة العملاء |
| `/settings` | إعدادات النظام (الشركة، الشعار، العملة) |

## 4. نموذج البيانات
سنستخدم واجهات TypeScript (Interfaces) لتمثيل البيانات المخزنة.

### 4.1 تعريف نماذج البيانات
```mermaid
erDiagram
    COMPANY_SETTINGS ||--o{ INVOICE : "يصدر"
    CLIENT ||--o{ INVOICE : "يستلم"
    INVOICE ||--|{ INVOICE_ITEM : "يحتوي"

    COMPANY_SETTINGS {
        string name
        string logo
        string email
        string phone
        string address
        string defaultCurrency
        string invoicePrefix
        string defaultTerms
    }

    CLIENT {
        string id
        string name
        string email
        string phone
        string address
        date createdAt
    }

    INVOICE {
        string id
        string invoiceNumber
        string clientId
        date issueDate
        date dueDate
        string status "draft | sent | paid | cancelled"
        string currency
        float subtotal
        float discountTotal
        float taxTotal
        float finalTotal
        float amountPaid
        float amountDue
        string terms
    }

    INVOICE_ITEM {
        string id
        string invoiceId
        string serviceName
        string description
        number quantity
        float unitPrice
        float total
    }
```

### 4.2 البيانات الأولية (Seed Data)
- سيتم تهيئة النظام ببيانات افتراضية للشركة (مثل العملة SAR والبادئة INV-2026-).
- يمكن وضع مجموعة من "الخدمات الافتراضية" (استضافة، تطوير مواقع، الخ) في الإعدادات لتسهيل الاختيار السريع عند الفوترة.
