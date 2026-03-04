import { Zap, Cog, Building2, Sprout, Landmark, Atom, FlaskConical, Plane } from "lucide-react";

export interface Department {
  id: string;
  name: string;
  icon: any;
  description: string;
  color: string;
}

export interface ElectronicPart {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface Resource {
  id: string;
  title: string;
  type: string;
  subject: string;
  url?: string;
}

export const departments: Department[] = [
  { id: "electrical", name: "الهندسة الكهربائية", icon: Zap, description: "دوائر، إلكترونيات، قوى كهربائية", color: "from-cyan-500 to-blue-600" },
  { id: "mechanical", name: "الهندسة الميكانيكية", icon: Cog, description: "آلات، ديناميكا، تصميم ميكانيكي", color: "from-orange-500 to-red-600" },
  { id: "civil", name: "الهندسة المدنية", icon: Building2, description: "إنشاءات، خرسانة، مساحة", color: "from-emerald-500 to-green-600" },
  { id: "agricultural", name: "الهندسة الزراعية", icon: Sprout, description: "ري، تربة، ميكنة زراعية", color: "from-lime-500 to-emerald-600" },
  { id: "architecture", name: "الهندسة المعمارية", icon: Landmark, description: "تصميم معماري، تخطيط مدن", color: "from-violet-500 to-purple-600" },
  { id: "materials", name: "هندسة المواد", icon: Atom, description: "معادن، بوليمرات، سيراميك", color: "from-pink-500 to-rose-600" },
  { id: "chemical", name: "الهندسة الكيميائية", icon: FlaskConical, description: "عمليات كيميائية، بتروكيماويات", color: "from-yellow-500 to-orange-600" },
  { id: "aerospace", name: "هندسة الطيران", icon: Plane, description: "ديناميكا هوائية، محركات نفاثة", color: "from-sky-500 to-indigo-600" },
];

export const sampleParts: ElectronicPart[] = [
  { id: "1", name: "مقاومة كهربائية", description: "تستخدم للتحكم في التيار الكهربائي في الدوائر. تأتي بقيم مختلفة تقاس بالأوم.", imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=200&fit=crop" },
  { id: "2", name: "مكثف كهربائي", description: "يخزن الطاقة الكهربائية في مجال كهربائي. يستخدم في دوائر الترشيح والتنعيم.", imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=200&fit=crop" },
  { id: "3", name: "ترانزستور", description: "عنصر فعال يستخدم كمفتاح إلكتروني أو مكبر للإشارات الكهربائية.", imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=200&fit=crop" },
  { id: "4", name: "دايود (صمام ثنائي)", description: "يسمح بمرور التيار في اتجاه واحد فقط. يستخدم في دوائر التقويم.", imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=200&fit=crop" },
];

export const sampleResources: Resource[] = [
  { id: "1", title: "ملزمة الدوائر الكهربائية", type: "ملزمة", subject: "الدوائر الكهربائية" },
  { id: "2", title: "مرجع الإلكترونيات التماثلية", type: "مرجع", subject: "الإلكترونيات" },
  { id: "3", title: "ملزمة الآلات الكهربائية", type: "ملزمة", subject: "آلات كهربائية" },
  { id: "4", title: "كتاب القوى الكهربائية", type: "كتاب", subject: "قوى كهربائية" },
  { id: "5", title: "ملزمة الاتصالات الرقمية", type: "ملزمة", subject: "اتصالات" },
];
