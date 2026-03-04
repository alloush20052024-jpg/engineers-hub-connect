import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { departments } from "@/lib/data";
import { ArrowRight, Zap, Plus, Trash2, Settings, BookOpen, Wrench, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<"departments" | "resources" | "parts" | "shop">("departments");

  if (!user || !isAdmin) {
    navigate("/");
    return null;
  }

  const sections = [
    { key: "departments" as const, label: "الأقسام", icon: Settings },
    { key: "resources" as const, label: "المصادر النظرية", icon: BookOpen },
    { key: "parts" as const, label: "القطع العملية", icon: Wrench },
    { key: "shop" as const, label: "المتجر", icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen grid-pattern">
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowRight className="w-4 h-4" /> رجوع
            </Button>
            <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold font-orbitron text-primary">لوحة التحكم</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Section Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {sections.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeSection === s.key
                  ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(195_100%_50%/0.3)]"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <s.icon className="w-4 h-4" />
              {s.label}
            </button>
          ))}
        </div>

        {/* Departments Management */}
        {activeSection === "departments" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">إدارة الأقسام</h2>
              <Button variant="glow" onClick={() => toast.info("سيتم تفعيل هذه الميزة مع Lovable Cloud")}>
                <Plus className="w-4 h-4" /> إضافة قسم
              </Button>
            </div>
            <div className="grid gap-4">
              {departments.map(dept => (
                <div key={dept.id} className="bg-card/80 border border-border rounded-xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${dept.color} flex items-center justify-center`}>
                      <dept.icon className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{dept.name}</h3>
                      <p className="text-sm text-muted-foreground">{dept.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => toast.info("تحرير القسم - يتطلب Lovable Cloud")}>تعديل</Button>
                    <Button variant="ghost" size="sm" onClick={() => toast.info("حذف القسم - يتطلب Lovable Cloud")}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "resources" && (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">إدارة المصادر النظرية</h2>
            <p className="text-muted-foreground mb-6">أضف وعدّل الملازم والمراجع لكل قسم</p>
            <Button variant="glow" onClick={() => toast.info("يتطلب تفعيل Lovable Cloud للتخزين")}>
              <Plus className="w-4 h-4" /> إضافة مصدر
            </Button>
          </div>
        )}

        {activeSection === "parts" && (
          <div className="text-center py-20">
            <Wrench className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">إدارة القطع العملية</h2>
            <p className="text-muted-foreground mb-6">أضف صور وشروحات القطع الإلكترونية</p>
            <Button variant="glow" onClick={() => toast.info("يتطلب تفعيل Lovable Cloud للتخزين")}>
              <Plus className="w-4 h-4" /> إضافة قطعة
            </Button>
          </div>
        )}

        {activeSection === "shop" && (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">إدارة المتجر</h2>
            <p className="text-muted-foreground mb-6">أضف وأدر المنتجات المتوفرة في المتجر</p>
            <Button variant="glow" onClick={() => toast.info("يتطلب تفعيل Lovable Cloud للتخزين")}>
              <Plus className="w-4 h-4" /> إضافة منتج
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
