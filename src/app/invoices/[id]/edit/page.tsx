"use client";

import InvoiceForm from "@/components/InvoiceForm";
import { useStore } from "@/store/useStore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Invoice } from "@/types";

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { invoices } = useStore();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      const found = invoices.find(inv => inv.id === params.id);
      if (found) {
        setInvoice(found);
      } else {
        router.push("/invoices");
      }
      setLoading(false);
    }
  }, [params.id, invoices, router]);

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;
  if (!invoice) return null;

  return <InvoiceForm initialData={invoice} />;
}
