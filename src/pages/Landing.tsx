import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { Zap, BookOpen, GraduationCap, Wrench } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { useEffect } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [user, loading]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>
      <div className="absolute inset-0 grid-pattern" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center animate-pulse-glow">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold font-orbitron text-glow text-primary">مكتبتي الهندسية</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/login")}>تسجيل دخول</Button>
            <Button variant="glow" onClick={() => navigate("/signup")}>تسجيل جديد</Button>
          </div>
        </nav>

        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm text-primary">منصة هندسية متكاملة</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black font-orbitron leading-tight mb-6 text-glow text-foreground">
              مكتبتي<br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">الهندسية</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              مصادر علمية، قطع إلكترونية، استشارات هندسية، ومتجر متكامل — كل ما يحتاجه المهندس والطالب في مكان واحد
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <Button variant="hero" size="xl" onClick={() => navigate("/signup")}>ابدأ الآن مجاناً</Button>
              <Button variant="outline" size="xl" onClick={() => navigate("/login")}>تسجيل الدخول</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { icon: BookOpen, title: "مصادر نظرية", desc: "ملازم ومراجع معتمدة لكل تخصص" },
                { icon: Wrench, title: "عملي تطبيقي", desc: "شرح القطع الإلكترونية والمكونات" },
                { icon: GraduationCap, title: "استشارات", desc: "تواصل مع مهندسين متخصصين" },
              ].map((f, i) => (
                <div key={i} className="bg-card/80 backdrop-blur border border-border rounded-xl p-6 card-hover border-glow">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Landing;
