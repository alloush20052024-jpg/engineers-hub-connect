import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { Zap, GraduationCap, HardHat } from "lucide-react";
import { toast } from "sonner";

const Signup = () => {
  const [step, setStep] = useState<"choose" | "form">("choose");
  const [role, setRole] = useState<"student" | "engineer">("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, { name, phone, user_type: role });
    setLoading(false);
    if (error) {
      toast.error(error.message || "حدث خطأ أثناء التسجيل");
    } else {
      toast.success("تم إنشاء الحساب بنجاح!");
      navigate("/dashboard");
    }
  };

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
          <div className="space-y-4">
            <button onClick={() => { setRole("student"); setStep("form"); }}
              className="w-full bg-card/80 backdrop-blur border border-border rounded-2xl p-6 flex items-center gap-4 card-hover border-glow text-right">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <GraduationCap className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">طالب هندسة</h3>
                <p className="text-sm text-muted-foreground">الوصول للملازم والمصادر الدراسية</p>
              </div>
            </button>
            <button onClick={() => { setRole("engineer"); setStep("form"); }}
              className="w-full bg-card/80 backdrop-blur border border-border rounded-2xl p-6 flex items-center gap-4 card-hover border-glow text-right">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <HardHat className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">مهندس</h3>
                <p className="text-sm text-muted-foreground">تقديم استشارات وإدارة المحتوى</p>
              </div>
            </button>
            <p className="text-center text-sm text-muted-foreground mt-4">
              لديك حساب؟{" "}
              <button onClick={() => navigate("/login")} className="text-primary hover:underline font-semibold">سجل دخول</button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="bg-card/80 backdrop-blur border border-border rounded-2xl p-8 space-y-5 border-glow">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 mb-2">
              {role === "student" ? <GraduationCap className="w-4 h-4 text-primary" /> : <HardHat className="w-4 h-4 text-accent" />}
              <span className="text-sm font-medium text-foreground">
                {role === "student" ? "تسجيل كطالب هندسة" : "تسجيل كمهندس"}
              </span>
            </div>
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
              <Label>رمز الحساب (كلمة المرور)</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="bg-secondary/50 border-border" dir="ltr" />
            </div>
            <div className="flex gap-3">
              <Button type="submit" variant="glow" className="flex-1" size="lg" disabled={loading}>
                {loading ? "جاري التسجيل..." : "إنشاء حساب"}
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
