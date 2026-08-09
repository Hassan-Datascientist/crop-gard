import React, { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Loader2, Send } from "lucide-react";

export default function Contact() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    // Simulated submission (no external mail provider configured)
    await new Promise((r) => setTimeout(r, 700));
    setSending(false);
    toast({ title: t("toast.contact_sent_title"), description: t("toast.contact_sent_desc") });
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3 py-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto dark:bg-emerald-900/40">
          <Mail className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">{t("contact.title")}</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{t("contact.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t("contact.name")}</Label>
          <Input id="name" required value={form.name} onChange={handleChange("name")} placeholder={t("contact.name_placeholder")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t("contact.email")}</Label>
          <Input id="email" type="email" required value={form.email} onChange={handleChange("email")} placeholder={t("contact.email_placeholder")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">{t("contact.subject")}</Label>
          <Input id="subject" required value={form.subject} onChange={handleChange("subject")} placeholder={t("contact.subject_placeholder")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">{t("contact.message")}</Label>
          <Textarea id="message" required rows={5} value={form.message} onChange={handleChange("message")} placeholder={t("contact.message_placeholder")} />
        </div>
        <Button type="submit" disabled={sending} className="w-full gap-2">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {t("contact.send")}
        </Button>
      </form>
    </div>
  );
}