import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Info, HelpCircle, Mail, Shield, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export default function MoreMenu({ open, onOpenChange }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const items = [
    { to: "/settings", label: t("menu.settings"), icon: Settings },
    { to: "/about", label: t("menu.about"), icon: Info },
    { to: "/help", label: t("menu.help"), icon: HelpCircle },
    { to: "/contact", label: t("menu.contact"), icon: Mail },
    { to: "/privacy", label: t("menu.privacy"), icon: Shield },
  ];

  const go = (path) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="text-start">
          <SheetTitle className="text-lg">{t("menu.more")}</SheetTitle>
          <SheetDescription className="sr-only">{t("menu.more")}</SheetDescription>
        </SheetHeader>
        <div className="mt-2 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.to}
                onClick={() => go(item.to)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
                )}
              >
                <span className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </span>
                {item.label}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}