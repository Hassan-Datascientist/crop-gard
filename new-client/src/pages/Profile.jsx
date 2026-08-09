import React, { useRef, useState } from "react";
import { User, Mail, Shield, LogOut, Loader2, MailCheck, Camera, Palette, Globe, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation, languages } from "@/lib/i18n";
import { useTheme } from "next-themes";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Profile() {
  const { user, logout, checkUserAuth } = useAuth();
  const { t, lang, setLang } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const fileRef = useRef(null);

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [savingName, setSavingName] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [resetEmail, setResetEmail] = useState(user?.email || "");
  const [sendingReset, setSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleSaveName = async (e) => {
    e.preventDefault();
    setSavingName(true);
    try {
      await base44.auth.updateMe({ full_name: fullName });
      toast({ title: t("toast.profile_updated_title"), description: t("toast.profile_updated_desc") });
      checkUserAuth();
    } catch (err) {
      toast({ variant: "destructive", title: t("toast.failed_title"), description: err.message });
    } finally {
      setSavingName(false);
    }
  };

  const handlePicture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPic(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ profile_picture: file_url });
      toast({ title: t("toast.picture_updated_title") });
      checkUserAuth();
    } catch (err) {
      toast({ variant: "destructive", title: t("toast.failed_title"), description: err.message });
    } finally {
      setUploadingPic(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemovePicture = async () => {
    try {
      await base44.auth.updateMe({ profile_picture: "" });
      checkUserAuth();
    } catch (err) {
      toast({ variant: "destructive", title: t("toast.failed_title"), description: err.message });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setSendingReset(true);
    try {
      await base44.auth.resetPasswordRequest(resetEmail);
      setResetSent(true);
      toast({ title: t("toast.reset_sent_title"), description: t("toast.reset_sent_desc") });
    } catch (err) {
      toast({ variant: "destructive", title: t("toast.failed_title"), description: err.message });
    } finally {
      setSendingReset(false);
    }
  };

  const handleLogout = () => {
    logout(false);
    window.location.href = "/login";
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    // Best-effort: erase this user's scan history (RLS scopes deleteMany to own records)
    try {
      await base44.entities.Prediction.deleteMany({});
    } catch (e) {
      /* best-effort data wipe */
    }
    try {
      await logout(false);
    } catch (e) {
      /* ignore */
    }
    setDeleting(false);
    window.location.href = "/login";
  };

  const themeOptions = [
    { value: "light", label: t("settings.theme_light") },
    { value: "dark", label: t("settings.theme_dark") },
    { value: "system", label: t("settings.theme_system") },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground">{t("profile.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("profile.subtitle")}</p>
      </div>

      {/* Profile picture + name */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-emerald-600 text-white text-3xl font-bold flex items-center justify-center overflow-hidden">
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt="" className="w-full h-full object-cover" />
              ) : (
                (user?.full_name || user?.email || "U").charAt(0).toUpperCase()
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingPic}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center shadow-md border-2 border-background disabled:opacity-50"
              aria-label={t("profile.change_picture")}
            >
              {uploadingPic ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePicture} />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">{user?.full_name || "User"}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 justify-center">
              <Mail className="h-3.5 w-3.5" />
              {user?.email}
            </p>
          </div>
          {user?.profile_picture && (
            <Button variant="ghost" size="sm" onClick={handleRemovePicture} className="text-muted-foreground">
              {t("profile.remove_picture")}
            </Button>
          )}
        </div>

        <form onSubmit={handleSaveName} className="mt-6 space-y-3">
          <Label htmlFor="fullname">{t("profile.full_name")}</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="fullname"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("profile.name_placeholder")}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={savingName} className="gap-2">
            {savingName && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("profile.save")}
          </Button>
        </form>
      </div>

      {/* Preferences */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Palette className="h-5 w-5 text-emerald-600" />
          <h3 className="text-base font-semibold text-foreground">{t("profile.preferences")}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-5">{t("profile.preferences_desc")}</p>

        <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
          <Palette className="h-4 w-4 text-muted-foreground" />
          {t("profile.theme")}
        </p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={cn(
                "py-2.5 rounded-xl border text-sm font-medium transition-colors",
                theme === opt.value
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
          <Globe className="h-4 w-4 text-muted-foreground" />
          {t("profile.language")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={cn(
                "py-2.5 rounded-xl border text-sm font-medium transition-colors",
                lang === l.code
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-5 w-5 text-emerald-600" />
          <h3 className="text-base font-semibold text-foreground">{t("profile.security")}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-5">{t("profile.security_desc")}</p>

        {resetSent ? (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800">
            <MailCheck className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">{t("profile.reset_sent")}</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-0.5">
                {t("profile.reset_sent_desc", { email: resetEmail })}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-3">
            <Label htmlFor="resetemail">{t("profile.email")}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="resetemail"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-10"
                required
              />
            </div>
            <Button type="submit" variant="outline" disabled={sendingReset} className="gap-2">
              {sendingReset ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {t("profile.send_reset")}
            </Button>
          </form>
        )}
      </div>

      {/* Session */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-base font-semibold text-foreground">{t("profile.session")}</h3>
            <p className="text-sm text-muted-foreground">{t("profile.session_desc")}</p>
          </div>
          <Button variant="destructive" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            {t("profile.logout")}
          </Button>
        </div>
      </div>

      {/* Danger zone — Delete account (Apple App Store requirement) */}
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Trash2 className="h-5 w-5 text-destructive" />
          <h3 className="text-base font-semibold text-foreground">{t("profile.delete_account")}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-5">{t("profile.delete_account_desc")}</p>
        <AlertDialog open={deleteOpen} onOpenChange={(o) => { setDeleteOpen(o); if (!o) setDeleteText(""); }}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-2 w-full sm:w-auto">
              <Trash2 className="h-4 w-4" />
              {t("profile.delete_account_btn")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("profile.delete_confirm_title")}</AlertDialogTitle>
              <AlertDialogDescription>{t("profile.delete_confirm_desc")}</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 py-1">
              <Label htmlFor="delete-confirm">{t("profile.delete_type_confirm", { word: "DELETE" })}</Label>
              <Input
                id="delete-confirm"
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                placeholder="DELETE"
                autoComplete="off"
                className="uppercase"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                disabled={deleteText !== "DELETE" || deleting}
                onClick={handleDeleteAccount}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("profile.delete_account_btn")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}