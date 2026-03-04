import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { departments, sampleParts, sampleResources } from "@/lib/data";
import { ArrowRight, BookOpen, Wrench, ShoppingBag, MessageCircle, Zap, ExternalLink, Phone } from "lucide-react";

type Tab = "theory" | "practical" | "shop" | "consult";

const Department = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("theory");

  if (!user) { navigate("/"); return null; }

  const dept = departments.find(d => d.id === id);
  if (!dept) { navigate("/dashboard"); return null; }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "theory", label: "هندسة نظري", icon: BookOpen },
    { key: "practical", label: "هندسة عملي", icon: Wrench },
    { key: "shop", label: "تسوق", icon: ShoppingBag },
    { key: "consult", label: "استشارة هندسية", icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen grid-pattern">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowRight className="w-4 h-4" /> رجوع
            </Button>
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${dept.color} flex items-center justify-center`}>
              <dept.icon className="w-5 h-5 text-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground">{dept.name}</h1>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-wrap gap-3 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(195_100%_50%/0.3)]"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Theory Tab */}
        {activeTab === "theory" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-6">الملازم والمصادر المعتمدة</h2>
            <div className="grid gap-4">
              {sampleResources.map(res => (
                <div key={res.id} className="bg-card/80 backdrop-blur border border-border rounded-xl p-5 flex items-center justify-between card-hover border-glow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{res.title}</h3>
                      <p className="text-sm text-muted-foreground">{res.type} • {res.subject}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4" /> فتح
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Practical Tab */}
        {activeTab === "practical" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-6">القطع الإلكترونية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sampleParts.map(part => (
                <div key={part.id} className="bg-card/80 backdrop-blur border border-border rounded-xl overflow-hidden card-hover border-glow">
                  <img src={part.imageUrl} alt={part.name} className="w-full h-48 object-cover opacity-80" />
                  <div className="p-5">
                    <h3 className="font-bold text-foreground text-lg mb-2">{part.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{part.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shop Tab */}
        {activeTab === "shop" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-6">المتجر - القطع المتوفرة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleParts.map(part => (
                <div key={part.id} className="bg-card/80 backdrop-blur border border-border rounded-xl overflow-hidden card-hover border-glow">
                  <img src={part.imageUrl} alt={part.name} className="w-full h-40 object-cover opacity-80" />
                  <div className="p-5">
                    <h3 className="font-bold text-foreground mb-1">{part.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{part.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-accent">15,000 د.ع</span>
                      <Button variant="glow" size="sm">
                        <ShoppingBag className="w-4 h-4" /> شراء
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Consult Tab */}
        {activeTab === "consult" && (
          <div className="max-w-lg mx-auto text-center py-10">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">استشارة هندسية متخصصة</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              تواصل مع مهندس مقيم متخصص في {dept.name}. يتم الدفع عبر زين كاش أو آسياسيل كاش.
            </p>
            <div className="bg-card/80 backdrop-blur border border-border rounded-2xl p-6 mb-6 border-glow">
              <div className="text-3xl font-bold text-accent mb-2">25,000 د.ع</div>
              <p className="text-sm text-muted-foreground">رسوم الاستشارة الواحدة</p>
            </div>
            <div className="space-y-3">
              <Button variant="hero" size="lg" className="w-full">
                <Phone className="w-5 h-5" /> الدفع عبر زين كاش
              </Button>
              <Button variant="glow" size="lg" className="w-full">
                <Phone className="w-5 h-5" /> الدفع عبر آسياسيل كاش
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Department;
