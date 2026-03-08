import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { getIcon } from "@/lib/icons";
import { ArrowRight, BookOpen, Wrench, ShoppingBag, MessageCircle, ExternalLink, Phone, Loader2, Briefcase } from "lucide-react";
import AITools from "@/components/AITools";

type Tab = "theory" | "practical" | "shop" | "consult" | "jobs" | "eng_shop" | "eng_consult";

const Department = () => {
  const { id: slug } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab | null>(null);

  const isEngineer = profile?.user_type === "engineer";

  const { data: dept, isLoading: deptLoading } = useQuery({
    queryKey: ["department", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("departments").select("*").eq("slug", slug!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug && !!user,
  });

  const { data: resources } = useQuery({
    queryKey: ["resources", dept?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("resources").select("*").eq("department_id", dept!.id).order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!dept?.id && !isEngineer,
  });

  const { data: parts } = useQuery({
    queryKey: ["parts", dept?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("parts").select("*").eq("department_id", dept!.id).order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!dept?.id && !isEngineer,
  });

  const { data: shopItems } = useQuery({
    queryKey: ["shop_items", dept?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("shop_items").select("*").eq("department_id", dept!.id).order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!dept?.id,
  });

  const { data: consultSettings } = useQuery({
    queryKey: ["consultation", dept?.id],
    queryFn: async () => {
      const { data } = await supabase.from("consultation_settings").select("*").eq("department_id", dept!.id).single();
      return data;
    },
    enabled: !!dept?.id,
  });

  const { data: jobs } = useQuery({
    queryKey: ["jobs", dept?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("department_id", dept!.id).order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!dept?.id && isEngineer,
  });

  // Set default tab based on user type
  if (activeTab === null && profile) {
    if (isEngineer) {
      setActiveTab("jobs");
    } else {
      setActiveTab("theory");
    }
  }

  if (deptLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  if (!dept) { navigate("/dashboard"); return null; }

  const Icon = getIcon(dept.icon);

  const studentTabs: { key: Tab; label: string; icon: any }[] = [
    { key: "theory", label: "هندسة نظري", icon: BookOpen },
    { key: "practical", label: "هندسة عملي", icon: Wrench },
    { key: "shop", label: "تسوق", icon: ShoppingBag },
    { key: "consult", label: "استشارة هندسية", icon: MessageCircle },
  ];

  const engineerTabs: { key: Tab; label: string; icon: any }[] = [
    { key: "jobs", label: "وظائف", icon: Briefcase },
    { key: "eng_shop", label: "سوق هندسي", icon: ShoppingBag },
    { key: "eng_consult", label: "استشاري", icon: MessageCircle },
  ];

  const tabs = isEngineer ? engineerTabs : studentTabs;

  return (
    <div className="min-h-screen grid-pattern">
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowRight className="w-4 h-4" /> رجوع
            </Button>
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${dept.color} flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground">{dept.name}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-wrap gap-3 mb-8">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(195_100%_50%/0.3)]"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Student Tabs */}
        {activeTab === "theory" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">الملازم والمصادر المعتمدة</h2>
            {(!resources || resources.length === 0) ? (
              <p className="text-muted-foreground text-center py-10">لا توجد مصادر بعد لهذا القسم</p>
            ) : (
              <div className="grid gap-4">
                {resources.map(res => (
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
                    {res.file_url && (
                      <a href={res.file_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm"><ExternalLink className="w-4 h-4" /> فتح</Button>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "practical" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">القطع الإلكترونية</h2>
            {(!parts || parts.length === 0) ? (
              <p className="text-muted-foreground text-center py-10">لا توجد قطع بعد لهذا القسم</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {parts.map(part => (
                  <div key={part.id} className="bg-card/80 backdrop-blur border border-border rounded-xl overflow-hidden card-hover border-glow">
                    {part.image_url && <img src={part.image_url} alt={part.name} className="w-full h-48 object-cover opacity-80" />}
                    <div className="p-5">
                      <h3 className="font-bold text-foreground text-lg mb-2">{part.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{part.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "shop" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">المتجر - القطع المتوفرة</h2>
            {(!shopItems || shopItems.length === 0) ? (
              <p className="text-muted-foreground text-center py-10">لا توجد منتجات بعد لهذا القسم</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {shopItems.map(item => (
                  <div key={item.id} className="bg-card/80 backdrop-blur border border-border rounded-xl overflow-hidden card-hover border-glow">
                    {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-40 object-cover opacity-80" />}
                    <div className="p-5">
                      <h3 className="font-bold text-foreground mb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-accent">{Number(item.price).toLocaleString()} د.ع</span>
                        <Button variant="glow" size="sm"><ShoppingBag className="w-4 h-4" /> شراء</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "consult" && (
          <div className="max-w-lg mx-auto text-center py-10">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">استشارة هندسية متخصصة</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {consultSettings?.description || `تواصل مع مهندس مقيم متخصص في ${dept.name}. يتم الدفع عبر زين كاش أو آسياسيل كاش.`}
            </p>
            <div className="bg-card/80 backdrop-blur border border-border rounded-2xl p-6 mb-6 border-glow">
              <div className="text-3xl font-bold text-accent mb-2">{Number(consultSettings?.price || 25000).toLocaleString()} د.ع</div>
              <p className="text-sm text-muted-foreground">رسوم الاستشارة الواحدة</p>
            </div>
            <div className="space-y-3">
              <Button variant="hero" size="lg" className="w-full"><Phone className="w-5 h-5" /> الدفع عبر زين كاش</Button>
              <Button variant="glow" size="lg" className="w-full"><Phone className="w-5 h-5" /> الدفع عبر آسياسيل كاش</Button>
            </div>
          </div>
        )}

        {/* Engineer Tabs */}
        {activeTab === "jobs" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">وظائف هندسية - شركات تحتاج مهندسين</h2>
            {(!jobs || jobs.length === 0) ? (
              <p className="text-muted-foreground text-center py-10">لا توجد وظائف متاحة حالياً لهذا القسم</p>
            ) : (
              <div className="grid gap-4">
                {jobs.map(job => (
                  <div key={job.id} className="bg-card/80 backdrop-blur border border-border rounded-xl p-5 card-hover border-glow">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-lg">{job.company_name}</h3>
                        {job.description && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{job.description}</p>}
                        {job.contact_info && (
                          <p className="text-sm text-primary mt-2">📞 {job.contact_info}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "eng_shop" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">السوق الهندسي</h2>
            {(!shopItems || shopItems.length === 0) ? (
              <p className="text-muted-foreground text-center py-10">لا توجد منتجات بعد لهذا القسم</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {shopItems.map(item => (
                  <div key={item.id} className="bg-card/80 backdrop-blur border border-border rounded-xl overflow-hidden card-hover border-glow">
                    {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-40 object-cover opacity-80" />}
                    <div className="p-5">
                      <h3 className="font-bold text-foreground mb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-accent">{Number(item.price).toLocaleString()} د.ع</span>
                        <Button variant="glow" size="sm"><ShoppingBag className="w-4 h-4" /> شراء</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "eng_consult" && (
          <div className="max-w-lg mx-auto text-center py-10">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">استشاري هندسي متخصص</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              احصل على استشارة هندسية احترافية من مهندس موقع متخصص في {dept.name}. يتم الدفع عبر زين كاش أو آسياسيل كاش.
            </p>
            <div className="bg-card/80 backdrop-blur border border-border rounded-2xl p-6 mb-6 border-glow">
              <div className="text-3xl font-bold text-accent mb-2">400,000 د.ع</div>
              <p className="text-sm text-muted-foreground">رسوم الاستشارة الواحدة</p>
            </div>
            <div className="space-y-3">
              <Button variant="hero" size="lg" className="w-full"><Phone className="w-5 h-5" /> الدفع عبر زين كاش</Button>
              <Button variant="glow" size="lg" className="w-full"><Phone className="w-5 h-5" /> الدفع عبر آسياسيل كاش</Button>
            </div>
          </div>
        )}
      </div>

      {/* AI Tools - only for students */}
      {!isEngineer && <AITools />}
    </div>
  );
};

export default Department;
