import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Mail } from "lucide-react";

export default function Help() {
  const { t, tList } = useTranslation();
  const faq = tList("help.faq");

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3 py-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto dark:bg-emerald-900/40">
          <HelpCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">{t("help.title")}</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{t("help.subtitle")}</p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-base font-semibold text-foreground mb-3">{t("help.faq_title")}</h3>
        <Accordion type="single" collapsible className="w-full">
          {faq.map((item, i) => (
            <AccordionItem key={i} value={`q-${i}`} className="border-b border-border last:border-0">
              <AccordionTrigger className="text-sm font-medium text-foreground text-start py-4">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center">
        <p className="text-sm text-muted-foreground mb-4">{t("help.contact_desc")}</p>
        <Button asChild className="gap-2">
          <Link to="/contact">
            <Mail className="h-4 w-4" />
            {t("help.contact_btn")}
          </Link>
        </Button>
      </section>
    </div>
  );
}