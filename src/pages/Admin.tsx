import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getIcon, iconMap } from "@/lib/icons";
import { ArrowRight, Zap, Plus, Trash2, Settings, BookOpen, Wrench, ShoppingBag, Loader2, X, Edit, ShieldCheck, Check, XCircle, Building2, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<"departments" | "resources" | "parts" | "shop" | "consultants" | "companies">("departments");

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"department" | "resource" | "part" | "shop">("department");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");

  const { data: departments, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("departments").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: resources } = useQuery({
    queryKey: ["admin-resources", selectedDeptId],
    queryFn: async () => {
      let q = supabase.from("resources").select("*, departments(name)").order("sort_order");
      if (selectedDeptId) q = q.eq("department_id", selectedDeptId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!user && activeSection === "resources",
  });

  const { data: parts } = useQuery({
    queryKey: ["admin-parts", selectedDeptId],
    queryFn: async () => {
      let q = supabase.from("parts").select("*, departments(name)").order("sort_order");
      if (selectedDeptId) q = q.eq("department_id", selectedDeptId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!user && activeSection === "parts",
  });

  const { data: shopItems } = useQuery({
    queryKey: ["admin-shop", selectedDeptId],
    queryFn: async () => {
      let q = supabase.from("shop_items").select("*, departments(name)").order("sort_order");
      if (selectedDeptId) q = q.eq("department_id", selectedDeptId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!user && activeSection === "shop",
  });

  const { data: consultantApps } = useQuery({
    queryKey: ["admin-consultants"],
    queryFn: async () => {
      const { data, error } = await supabase.from("consultant_applications").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user && activeSection === "consultants",
  });

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  if (!user || !isAdmin) {
    navigate("/dashboard");
    return null;
  }

  const openAdd = (type: typeof dialogType) => {
    setDialogType(type);
    setEditingId(null);
    setFormData({});
    setDialogOpen(true);
  };

  const openEdit = (type: typeof dialogType, item: any) => {
    setDialogType(type);
    setEditingId(item.id);
    setFormData(item);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (dialogType === "department") {
        const payload = {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || "",
          icon: formData.icon || "Zap",
          color: formData.color || "from-cyan-500 to-blue-600",
          sort_order: formData.sort_order || 0,
        };
        if (editingId) {
          const { error } = await supabase.from("departments").update(payload).eq("id", editingId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("departments").insert(payload);
          if (error) throw error;
        }
        queryClient.invalidateQueries({ queryKey: ["departments"] });
      } else if (dialogType === "resource") {
        const payload = {
          department_id: formData.department_id,
          title: formData.title,
          type: formData.type || "ملزمة",
          subject: formData.subject || "",
          file_url: formData.file_url || "",
          sort_order: formData.sort_order || 0,
        };
        if (editingId) {
          const { error } = await supabase.from("resources").update(payload).eq("id", editingId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("resources").insert(payload);
          if (error) throw error;
        }
        queryClient.invalidateQueries({ queryKey: ["admin-resources"] });
      } else if (dialogType === "part") {
        const payload = {
          department_id: formData.department_id,
          name: formData.name,
          description: formData.description || "",
          image_url: formData.image_url || "",
          sort_order: formData.sort_order || 0,
        };
        if (editingId) {
          const { error } = await supabase.from("parts").update(payload).eq("id", editingId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("parts").insert(payload);
          if (error) throw error;
        }
        queryClient.invalidateQueries({ queryKey: ["admin-parts"] });
      } else if (dialogType === "shop") {
        const payload = {
          department_id: formData.department_id,
          name: formData.name,
          description: formData.description || "",
          image_url: formData.image_url || "",
          price: formData.price || 0,
          in_stock: formData.in_stock !== false,
          sort_order: formData.sort_order || 0,
        };
        if (editingId) {
          const { error } = await supabase.from("shop_items").update(payload).eq("id", editingId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("shop_items").insert(payload);
          if (error) throw error;
        }
        queryClient.invalidateQueries({ queryKey: ["admin-shop"] });
      }
      toast.success(editingId ? "تم التحديث بنجاح" : "تمت الإضافة بنجاح");
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ");
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      const table = type === "department" ? "departments" : type === "resource" ? "resources" : type === "part" ? "parts" : "shop_items";
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      queryClient.invalidateQueries();
      toast.success("تم الحذف بنجاح");
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ");
    }
  };

  const handleConsultantAction = async (id: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase.from("consultant_applications").update({ status }).eq("id", id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["admin-consultants"] });
      toast.success(status === "approved" ? "تم قبول الطلب" : "تم رفض الطلب");
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ");
    }
  };

  const sections = [
    { key: "departments" as const, label: "الأقسام", icon: Settings },
    { key: "resources" as const, label: "المصادر النظرية", icon: BookOpen },
    { key: "parts" as const, label: "القطع العملية", icon: Wrench },
    { key: "shop" as const, label: "المتجر", icon: ShoppingBag },
    { key: "consultants" as const, label: "طلبات الاستشاريين", icon: ShieldCheck },
  ];

  const renderDeptSelect = () => (
    <div className="space-y-2">
      <Label>القسم</Label>
      <Select value={formData.department_id || ""} onValueChange={v => setFormData({ ...formData, department_id: v })}>
        <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="اختر القسم" /></SelectTrigger>
        <SelectContent>
          {departments?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  const renderFilterSelect = () => (
    <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
      <SelectTrigger className="w-48 bg-secondary/50"><SelectValue placeholder="كل الأقسام" /></SelectTrigger>
      <SelectContent>
        <SelectItem value=" ">كل الأقسام</SelectItem>
        {departments?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
      </SelectContent>
    </Select>
  );

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
        <div className="flex flex-wrap gap-3 mb-8">
          {sections.map(s => (
            <button key={s.key} onClick={() => setActiveSection(s.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeSection === s.key
                  ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(195_100%_50%/0.3)]"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}>
              <s.icon className="w-4 h-4" />
              {s.label}
            </button>
          ))}
        </div>

        {/* Departments */}
        {activeSection === "departments" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">إدارة الأقسام</h2>
              <Button variant="glow" onClick={() => openAdd("department")}><Plus className="w-4 h-4" /> إضافة قسم</Button>
            </div>
            <div className="grid gap-4">
              {departments?.map(dept => {
                const Icon = getIcon(dept.icon);
                return (
                  <div key={dept.id} className="bg-card/80 border border-border rounded-xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${dept.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-foreground" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">{dept.name}</h3>
                        <p className="text-sm text-muted-foreground">{dept.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit("department", dept)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete("department", dept.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Resources */}
        {activeSection === "resources" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">إدارة المصادر النظرية</h2>
              <div className="flex gap-3">
                {renderFilterSelect()}
                <Button variant="glow" onClick={() => openAdd("resource")}><Plus className="w-4 h-4" /> إضافة مصدر</Button>
              </div>
            </div>
            <div className="grid gap-4">
              {resources?.map(res => (
                <div key={res.id} className="bg-card/80 border border-border rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-foreground">{res.title}</h3>
                    <p className="text-sm text-muted-foreground">{res.type} • {res.subject} • {(res as any).departments?.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit("resource", res)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete("resource", res.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {(!resources || resources.length === 0) && <p className="text-muted-foreground text-center py-10">لا توجد مصادر بعد</p>}
            </div>
          </div>
        )}

        {/* Parts */}
        {activeSection === "parts" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">إدارة القطع العملية</h2>
              <div className="flex gap-3">
                {renderFilterSelect()}
                <Button variant="glow" onClick={() => openAdd("part")}><Plus className="w-4 h-4" /> إضافة قطعة</Button>
              </div>
            </div>
            <div className="grid gap-4">
              {parts?.map(part => (
                <div key={part.id} className="bg-card/80 border border-border rounded-xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {part.image_url && <img src={part.image_url} alt={part.name} className="w-16 h-16 rounded-lg object-cover" />}
                    <div>
                      <h3 className="font-bold text-foreground">{part.name}</h3>
                      <p className="text-sm text-muted-foreground">{(part as any).departments?.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit("part", part)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete("part", part.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {(!parts || parts.length === 0) && <p className="text-muted-foreground text-center py-10">لا توجد قطع بعد</p>}
            </div>
          </div>
        )}

        {/* Shop */}
        {activeSection === "shop" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">إدارة المتجر</h2>
              <div className="flex gap-3">
                {renderFilterSelect()}
                <Button variant="glow" onClick={() => openAdd("shop")}><Plus className="w-4 h-4" /> إضافة منتج</Button>
              </div>
            </div>
            <div className="grid gap-4">
              {shopItems?.map(item => (
                <div key={item.id} className="bg-card/80 border border-border rounded-xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {item.image_url && <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />}
                    <div>
                      <h3 className="font-bold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{Number(item.price).toLocaleString()} د.ع • {(item as any).departments?.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit("shop", item)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete("shop", item.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {(!shopItems || shopItems.length === 0) && <p className="text-muted-foreground text-center py-10">لا توجد منتجات بعد</p>}
            </div>
          </div>
        )}
        {/* Consultant Applications */}
        {activeSection === "consultants" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">طلبات المهندسين الاستشاريين</h2>
            <div className="grid gap-4">
              {consultantApps?.map(app => (
                <div key={app.id} className="bg-card/80 border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-foreground">{app.email}</p>
                      <p className="text-sm text-muted-foreground">{app.phone} • {new Date(app.created_at).toLocaleDateString("ar-IQ")}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      app.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                      app.status === "approved" ? "bg-green-500/20 text-green-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {app.status === "pending" ? "قيد المراجعة" : app.status === "approved" ? "مقبول" : "مرفوض"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: "هوية النقابة", url: app.union_id_url },
                      { label: "البطاقة الموحدة", url: app.unified_card_url },
                      { label: "بطاقة السكن", url: app.residence_card_url },
                      { label: "صورة الوجه", url: app.face_photo_url },
                    ].map((doc, i) => (
                      <a key={i} href={doc.url || "#"} target="_blank" rel="noopener noreferrer"
                        className="block bg-secondary/50 rounded-lg p-2 text-center hover:bg-secondary/80 transition">
                        {doc.url ? (
                          <img src={doc.url} alt={doc.label} className="w-full h-20 object-cover rounded mb-1" />
                        ) : (
                          <div className="w-full h-20 bg-muted rounded mb-1 flex items-center justify-center text-muted-foreground text-xs">لا يوجد</div>
                        )}
                        <p className="text-xs text-muted-foreground">{doc.label}</p>
                      </a>
                    ))}
                  </div>
                  {app.status === "pending" && (
                    <div className="flex gap-2">
                      <Button variant="default" size="sm" onClick={() => handleConsultantAction(app.id, "approved")} className="bg-green-600 hover:bg-green-700">
                        <Check className="w-4 h-4" /> قبول
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleConsultantAction(app.id, "rejected")}>
                        <XCircle className="w-4 h-4" /> رفض
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {(!consultantApps || consultantApps.length === 0) && <p className="text-muted-foreground text-center py-10">لا توجد طلبات بعد</p>}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingId ? "تعديل" : "إضافة"}{" "}
              {dialogType === "department" ? "قسم" : dialogType === "resource" ? "مصدر" : dialogType === "part" ? "قطعة" : "منتج"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {dialogType === "department" && (
              <>
                <div className="space-y-2">
                  <Label>اسم القسم</Label>
                  <Input value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>المعرف (slug)</Label>
                  <Input value={formData.slug || ""} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="bg-secondary/50" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>الوصف</Label>
                  <Textarea value={formData.description || ""} onChange={e => setFormData({ ...formData, description: e.target.value })} className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>الأيقونة</Label>
                  <Select value={formData.icon || "Zap"} onValueChange={v => setFormData({ ...formData, icon: v })}>
                    <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(iconMap).map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>اللون (Gradient)</Label>
                  <Select value={formData.color || "from-cyan-500 to-blue-600"} onValueChange={v => setFormData({ ...formData, color: v })}>
                    <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["from-cyan-500 to-blue-600", "from-orange-500 to-red-600", "from-emerald-500 to-green-600", "from-lime-500 to-emerald-600", "from-violet-500 to-purple-600", "from-pink-500 to-rose-600", "from-yellow-500 to-orange-600", "from-sky-500 to-indigo-600"].map(c => (
                        <SelectItem key={c} value={c}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded bg-gradient-to-r ${c}`} />
                            <span>{c}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الترتيب</Label>
                  <Input type="number" value={formData.sort_order || 0} onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) })} className="bg-secondary/50" dir="ltr" />
                </div>
              </>
            )}

            {dialogType === "resource" && (
              <>
                {renderDeptSelect()}
                <div className="space-y-2">
                  <Label>العنوان</Label>
                  <Input value={formData.title || ""} onChange={e => setFormData({ ...formData, title: e.target.value })} className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>النوع</Label>
                  <Select value={formData.type || "ملزمة"} onValueChange={v => setFormData({ ...formData, type: v })}>
                    <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ملزمة">ملزمة</SelectItem>
                      <SelectItem value="مرجع">مرجع</SelectItem>
                      <SelectItem value="كتاب">كتاب</SelectItem>
                      <SelectItem value="محاضرة">محاضرة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>المادة</Label>
                  <Input value={formData.subject || ""} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>رابط الملف</Label>
                  <Input value={formData.file_url || ""} onChange={e => setFormData({ ...formData, file_url: e.target.value })} className="bg-secondary/50" dir="ltr" placeholder="https://..." />
                </div>
              </>
            )}

            {dialogType === "part" && (
              <>
                {renderDeptSelect()}
                <div className="space-y-2">
                  <Label>اسم القطعة</Label>
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
              </>
            )}

            {dialogType === "shop" && (
              <>
                {renderDeptSelect()}
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

export default Admin;
