import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Zap, Plus, Trash2, Briefcase, ShoppingBag, Loader2, Edit, Building2 } from "lucide-react";
import { toast } from "sonner";

const CompanyDashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"jobs" | "products">("jobs");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"job" | "product">("job");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (!authLoading && (!user || profile?.user_type !== "company")) {
      navigate("/dashboard");
    }
  }, [user, profile, authLoading]);

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("departments").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: myJobs } = useQuery({
    queryKey: ["my-jobs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*, departments(name)").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user && activeTab === "jobs",
  });

  const { data: myProducts } = useQuery({
    queryKey: ["my-products", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("shop_items").select("*, departments(name)").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user && activeTab === "products",
  });

  const { data: companyProfile } = useQuery({
    queryKey: ["my-company", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("company_profiles").select("*").eq("user_id", user!.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const isApproved = companyProfile?.status === "approved";

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  if (!isApproved) {
    return (
      <div className="min-h-screen grid-pattern flex items-center justify-center">
        <div className="bg-card/80 border border-border rounded-xl p-8 text-center max-w-md">
          <Building2 className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">حسابك قيد المراجعة</h2>
          <p className="text-muted-foreground mb-4">يتم مراجعة سند تسجيل شركتك من قبل الإدارة. ستتمكن من إضافة الوظائف والمنتجات بعد الموافقة.</p>
          <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-amber-500/20 text-amber-400">
            {companyProfile?.status === "rejected" ? "مرفوض - تواصل مع الإدارة" : "قيد المراجعة"}
          </span>
          <Button variant="ghost" className="mt-4 w-full" onClick={() => navigate("/dashboard")}>
            <ArrowRight className="w-4 h-4" /> العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  const openAdd = (type: "job" | "product") => {
    setDialogType(type);
    setEditingId(null);
    setFormData({});
    setDialogOpen(true);
  };

  const openEdit = (type: "job" | "product", item: any) => {
    setDialogType(type);
    setEditingId(item.id);
    setFormData(item);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (dialogType === "job") {
        const payload = {
          department_id: formData.department_id,
          company_name: companyProfile?.company_name || "",
          description: formData.description || "",
          contact_info: formData.contact_info || "",
          sort_order: formData.sort_order || 0,
          user_id: user!.id,
        };
        if (!payload.department_id) { toast.error("اختر القسم"); return; }
        if (editingId) {
          const { error } = await supabase.from("jobs").update(payload).eq("id", editingId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("jobs").insert(payload);
          if (error) throw error;
        }
        queryClient.invalidateQueries({ queryKey: ["my-jobs"] });
      } else {
        const payload = {
          department_id: formData.department_id,
          name: formData.name || "",
          description: formData.description || "",
          image_url: formData.image_url || "",
          price: formData.price || 0,
          in_stock: formData.in_stock !== false,
          sort_order: formData.sort_order || 0,
          user_id: user!.id,
        };
        if (!payload.department_id || !payload.name) { toast.error("املأ الحقول المطلوبة"); return; }
        if (editingId) {
          const { error } = await supabase.from("shop_items").update(payload).eq("id", editingId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("shop_items").insert(payload);
          if (error) throw error;
        }
        queryClient.invalidateQueries({ queryKey: ["my-products"] });
      }
      toast.success(editingId ? "تم التحديث" : "تمت الإضافة");
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ");
    }
  };

  const handleDelete = async (type: "job" | "product", id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    const table = type === "job" ? "jobs" : "shop_items";
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    queryClient.invalidateQueries({ queryKey: type === "job" ? ["my-jobs"] : ["my-products"] });
    toast.success("تم الحذف");
  };

  return (
    <div className="min-h-screen grid-pattern">
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowRight className="w-4 h-4" /> رجوع
            </Button>
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-amber-500" />
            </div>
            <h1 className="text-lg font-bold font-orbitron text-foreground">{companyProfile?.company_name || "شركتي"}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-3 mb-8">
          {[
            { key: "jobs" as const, label: "الوظائف", icon: Briefcase },
            { key: "products" as const, label: "المنتجات", icon: ShoppingBag },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === t.key
                  ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(195_100%_50%/0.3)]"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Jobs */}
        {activeTab === "jobs" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">وظائفي المعروضة</h2>
              <Button variant="glow" onClick={() => openAdd("job")}><Plus className="w-4 h-4" /> إضافة وظيفة</Button>
            </div>
            <div className="grid gap-4">
              {myJobs?.map(job => (
                <div key={job.id} className="bg-card/80 border border-border rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-foreground">{job.company_name}</h3>
                    <p className="text-sm text-muted-foreground">{job.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{(job as any).departments?.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit("job", job)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete("job", job.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
              {(!myJobs || myJobs.length === 0) && <p className="text-muted-foreground text-center py-10">لم تضف أي وظائف بعد</p>}
            </div>
          </div>
        )}

        {/* Products */}
        {activeTab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">منتجاتي المعروضة</h2>
              <Button variant="glow" onClick={() => openAdd("product")}><Plus className="w-4 h-4" /> إضافة منتج</Button>
            </div>
            <div className="grid gap-4">
              {myProducts?.map(item => (
                <div key={item.id} className="bg-card/80 border border-border rounded-xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {item.image_url && <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />}
                    <div>
                      <h3 className="font-bold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{Number(item.price).toLocaleString()} د.ع • {(item as any).departments?.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit("product", item)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete("product", item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
              {(!myProducts || myProducts.length === 0) && <p className="text-muted-foreground text-center py-10">لم تضف أي منتجات بعد</p>}
            </div>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingId ? "تعديل" : "إضافة"} {dialogType === "job" ? "وظيفة" : "منتج"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>القسم الهندسي</Label>
              <Select value={formData.department_id || ""} onValueChange={v => setFormData({ ...formData, department_id: v })}>
                <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="اختر القسم" /></SelectTrigger>
                <SelectContent>
                  {departments?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {dialogType === "job" ? (
              <>
                <div className="space-y-2">
                  <Label>وصف الوظيفة</Label>
                  <Textarea value={formData.description || ""} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="وصف المتطلبات والمهام" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>معلومات التواصل</Label>
                  <Input value={formData.contact_info || ""} onChange={e => setFormData({ ...formData, contact_info: e.target.value })} placeholder="رقم الهاتف أو البريد" className="bg-secondary/50" />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>اسم المنتج</Label>
                  <Input value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>الوصف</Label>
                  <Textarea value={formData.description || ""} onChange={e => setFormData({ ...formData, description: e.target.value })} className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>رابط الصورة</Label>
                  <Input value={formData.image_url || ""} onChange={e => setFormData({ ...formData, image_url: e.target.value })} className="bg-secondary/50" dir="ltr" placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>السعر (دينار عراقي)</Label>
                  <Input type="number" value={formData.price || 0} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} className="bg-secondary/50" dir="ltr" />
                </div>
              </>
            )}

            <Button variant="glow" className="w-full" size="lg" onClick={handleSave}>
              {editingId ? "حفظ التعديلات" : "إضافة"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyDashboard;
