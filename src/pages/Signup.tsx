import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Zap, GraduationCap, HardHat, ShieldCheck, Building2, Camera, Upload, ArrowRight } from "lucide-react";
import { toast } from "sonner";

type UserType = "student" | "engineer" | "consultant" | "company";

const Signup = () => {
  const [step, setStep] = useState<"choose" | "form">("choose");
  const [role, setRole] = useState<UserType>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Consultant fields
  const [unionIdFile, setUnionIdFile] = useState<File | null>(null);
  const [unifiedCardFile, setUnifiedCardFile] = useState<File | null>(null);
  const [residenceCardFile, setResidenceCardFile] = useState<File | null>(null);
  const [facePhoto, setFacePhoto] = useState<File | null>(null);
  const faceInputRef = useRef<HTMLInputElement>(null);

  // Company fields
  const [companyName, setCompanyName] = useState("");
  const [companyDesc, setCompanyDesc] = useState("");
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [companyRegDoc, setCompanyRegDoc] = useState<File | null>(null);

  const uploadFile = async (file: File, folder: string, userId: string) => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("images").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For consultant, validate required files
      if (role === "consultant") {
        if (!unionIdFile || !unifiedCardFile || !residenceCardFile || !facePhoto) {
          toast.error("يرجى رفع جميع الوثائق المطلوبة والتقاط صورة الوجه");
          setLoading(false);
          return;
        }
      }

      if (role === "company" && !companyName.trim()) {
        toast.error("يرجى إدخال اسم الشركة");
        setLoading(false);
        return;
      }

      const { error } = await signUp(email, password, { name, phone, user_type: role });
      if (error) {
        toast.error(error.message || "حدث خطأ أثناء التسجيل");
        setLoading(false);
        return;
      }

      // Wait for session
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (userId && role === "consultant") {
        const [unionUrl, unifiedUrl, residenceUrl, faceUrl] = await Promise.all([
          uploadFile(unionIdFile!, "consultant-docs", userId),
          uploadFile(unifiedCardFile!, "consultant-docs", userId),
          uploadFile(residenceCardFile!, "consultant-docs", userId),
          uploadFile(facePhoto!, "consultant-photos", userId),
        ]);

        await supabase.from("consultant_applications").insert({
          user_id: userId,
          union_id_url: unionUrl,
          unified_card_url: unifiedUrl,
          residence_card_url: residenceUrl,
          face_photo_url: faceUrl,
          phone,
          email,
        });

        toast.success("تم إرسال طلبك! سيتم مراجعته من قبل الإدارة");
        navigate("/dashboard");
      } else if (userId && role === "company") {
        let logoUrl = "";
        if (companyLogo) {
          logoUrl = await uploadFile(companyLogo, "company-logos", userId);
        }

        await supabase.from("company_profiles").insert({
          user_id: userId,
          company_name: companyName,
          description: companyDesc,
          logo_url: logoUrl,
          contact_info: phone,
        });

        toast.success("تم إنشاء حساب الشركة بنجاح!");
        navigate("/dashboard");
      } else {
        toast.success("تم إنشاء الحساب بنجاح!");
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ");
    }

    setLoading(false);
  };

  const roles: { key: UserType; icon: any; title: string; desc: string; color: string }[] = [
    { key: "student", icon: GraduationCap, title: "طالب هندسة", desc: "الوصول للملازم والمصادر الدراسية", color: "bg-primary/10 text-primary" },
    { key: "engineer", icon: HardHat, title: "مهندس", desc: "الوظائف والسوق الهندسي والاستشارات", color: "bg-accent/10 text-accent" },
    { key: "consultant", icon: ShieldCheck, title: "مهندس استشاري", desc: "تقديم استشارات واستلام الطلبات", color: "bg-green-500/10 text-green-500" },
    { key: "company", icon: Building2, title: "شركة", desc: "عرض منتجاتك ووظائفك للمهندسين والطلاب", color: "bg-amber-500/10 text-amber-500" },
  ];

  return (
    <div className="min-h-screen grid-pattern flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-orbitron text-glow text-primary mb-2">تسجيل جديد</h1>
          <p className="text-muted-foreground">اختر نوع حسابك</p>
        </div>

        {step === "choose" ? (
          <div className="space-y-3">
            {roles.map(r => (
              <button key={r.key} onClick={() => { setRole(r.key); setStep("form"); }}
                className="w-full bg-card/80 backdrop-blur border border-border rounded-2xl p-5 flex items-center gap-4 card-hover border-glow text-right">
                <div className={`w-13 h-13 rounded-xl ${r.color} flex items-center justify-center shrink-0 p-3`}>
                  <r.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">{r.title}</h3>
                  <p className="text-xs text-muted-foreground">{r.desc}</p>
                </div>
              </button>
            ))}
            <p className="text-center text-sm text-muted-foreground mt-4">
              لديك حساب؟{" "}
              <button onClick={() => navigate("/login")} className="text-primary hover:underline font-semibold">سجل دخول</button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="bg-card/80 backdrop-blur border border-border rounded-2xl p-8 space-y-4 border-glow">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 mb-2">
              {(() => { const R = roles.find(r => r.key === role); return R ? <R.icon className="w-4 h-4 text-primary" /> : null; })()}
              <span className="text-sm font-medium text-foreground">{roles.find(r => r.key === role)?.title}</span>
            </div>

            {/* Common fields */}
            <div className="space-y-2">
              <Label>الاسم الكامل</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="أدخل اسمك" required className="bg-secondary/50 border-border" />
            </div>
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" required className="bg-secondary/50 border-border" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="07xxxxxxxx" required className="bg-secondary/50 border-border" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>كلمة المرور</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="bg-secondary/50 border-border" dir="ltr" />
            </div>

            {/* Consultant extra fields */}
            {role === "consultant" && (
              <div className="space-y-3 border-t border-border pt-4">
                <p className="text-sm font-semibold text-foreground">الوثائق المطلوبة</p>

                <div className="space-y-2">
                  <Label>هوية النقابة</Label>
                  <Input type="file" accept="image/*,.pdf" onChange={e => setUnionIdFile(e.target.files?.[0] || null)} className="bg-secondary/50 border-border" />
                </div>
                <div className="space-y-2">
                  <Label>البطاقة الموحدة</Label>
                  <Input type="file" accept="image/*,.pdf" onChange={e => setUnifiedCardFile(e.target.files?.[0] || null)} className="bg-secondary/50 border-border" />
                </div>
                <div className="space-y-2">
                  <Label>بطاقة السكن</Label>
                  <Input type="file" accept="image/*,.pdf" onChange={e => setResidenceCardFile(e.target.files?.[0] || null)} className="bg-secondary/50 border-border" />
                </div>
                <div className="space-y-2">
                  <Label>التقاط صورة الوجه</Label>
                  <input ref={faceInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={e => setFacePhoto(e.target.files?.[0] || null)} />
                  <Button type="button" variant="outline" className="w-full" onClick={() => faceInputRef.current?.click()}>
                    <Camera className="w-4 h-4" />
                    {facePhoto ? facePhoto.name : "التقاط صورة"}
                  </Button>
                </div>
              </div>
            )}

            {/* Company extra fields */}
            {role === "company" && (
              <div className="space-y-3 border-t border-border pt-4">
                <div className="space-y-2">
                  <Label>اسم الشركة</Label>
                  <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="اسم شركتك" required className="bg-secondary/50 border-border" />
                </div>
                <div className="space-y-2">
                  <Label>وصف الشركة</Label>
                  <Textarea value={companyDesc} onChange={e => setCompanyDesc(e.target.value)} placeholder="نبذة عن شركتك" className="bg-secondary/50 border-border" />
                </div>
                <div className="space-y-2">
                  <Label>شعار الشركة (اختياري)</Label>
                  <Input type="file" accept="image/*" onChange={e => setCompanyLogo(e.target.files?.[0] || null)} className="bg-secondary/50 border-border" />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="glow" className="flex-1" size="lg" disabled={loading}>
                {loading ? "جاري التسجيل..." : role === "consultant" ? "إرسال الطلب" : "إنشاء حساب"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setStep("choose")}>رجوع</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Signup;
