import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { getIcon } from "@/lib/icons";
import { LogOut, Settings, Zap, Loader2, Building2 } from "lucide-react";
import { useEffect } from "react";

const Dashboard = () => {
  const { user, profile, isAdmin, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
  }, [user, authLoading]);

  const { data: departments, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("departments").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen grid-pattern">
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold font-orbitron text-primary">مكتبتي الهندسية</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">مرحباً، {profile?.name || "مستخدم"}</span>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                <Settings className="w-4 h-4" /> لوحة التحكم
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold font-orbitron text-foreground mb-3">الأقسام الهندسية</h2>
          <p className="text-muted-foreground">اختر القسم الهندسي للوصول إلى المصادر والمحتوى</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {departments?.map((dept) => {
            const Icon = getIcon(dept.icon);
            return (
              <button key={dept.id} onClick={() => navigate(`/department/${dept.slug}`)}
                className="group bg-card/80 backdrop-blur border border-border rounded-2xl p-6 text-right card-hover border-glow">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${dept.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-foreground" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">{dept.name}</h3>
                <p className="text-sm text-muted-foreground">{dept.description}</p>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
