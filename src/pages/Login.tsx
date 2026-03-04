import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { Zap, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error("البريد أو كلمة المرور غير صحيحة");
    } else {
      toast.success("تم تسجيل الدخول بنجاح!");
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
          <h1 className="text-2xl font-bold font-orbitron text-glow text-primary mb-2">تسجيل الدخول</h1>
          <p className="text-muted-foreground">أدخل بياناتك للمتابعة</p>
        </div>
        <form onSubmit={handleLogin} className="bg-card/80 backdrop-blur border border-border rounded-2xl p-8 space-y-5 border-glow">
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" required className="bg-secondary/50 border-border" dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label>كلمة المرور</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="bg-secondary/50 border-border" dir="ltr" />
          </div>
          <Button type="submit" variant="glow" className="w-full" size="lg" disabled={loading}>
            {loading ? "جاري الدخول..." : "دخول"} <ArrowRight className="w-4 h-4 mr-2" />
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            ليس لديك حساب؟{" "}
            <button type="button" onClick={() => navigate("/signup")} className="text-primary hover:underline font-semibold">سجل الآن</button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
