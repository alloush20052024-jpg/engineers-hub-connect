import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Languages, FileText, Upload, Download, X, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { extractTextFromFile } from "@/lib/file-extractor";
import { generatePDF } from "@/lib/pdf-generator";

const CHUNK_SIZE = 3000; // characters per chunk for AI processing

function splitIntoChunks(text: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

const AITools = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState<"translate" | "summarize" | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);

  const handleModeSelect = (m: "translate" | "summarize") => {
    setMode(m);
    setMenuOpen(false);
    fileInputRef.current?.click();
  };

  const processFile = useCallback(async (file: File) => {
    if (!mode) return;

    setProcessing(true);
    setProgress(0);
    setProgressText("جاري استخراج النص من الملف...");
    abortRef.current = false;

    try {
      const text = await extractTextFromFile(file);

      if (!text || text.trim().length < 10) {
        toast.error("لم يتم العثور على نص كافٍ في الملف");
        setProcessing(false);
        return;
      }

      if (mode === "summarize") {
        // For summarization, send larger chunks or the whole text (up to limit)
        const summaryText = text.slice(0, 30000); // limit for summarization
        setProgressText("جاري تلخيص المستند بالذكاء الاصطناعي...");
        setProgress(30);

        const { data, error } = await supabase.functions.invoke("ai-tools", {
          body: { action: "summarize", text: summaryText },
        });

        if (error) throw new Error(error.message);
        if (data?.error) throw new Error(data.error);

        setProgress(100);
        setResult(data.result);
        setResultDialogOpen(true);
        toast.success("تم تلخيص المستند بنجاح!");
      } else {
        // Translation: split into chunks and process sequentially
        const chunks = splitIntoChunks(text, CHUNK_SIZE);
        const translatedChunks: string[] = [];

        for (let i = 0; i < chunks.length; i++) {
          if (abortRef.current) {
            toast.info("تم إلغاء العملية");
            setProcessing(false);
            return;
          }

          const chunkNum = i + 1;
          setProgressText(
            `جاري ترجمة الجزء ${chunkNum} من ${chunks.length}`
          );
          setProgress(Math.round((chunkNum / chunks.length) * 100));

          const { data, error } = await supabase.functions.invoke("ai-tools", {
            body: {
              action: "translate",
              text: chunks[i],
              chunkIndex: i,
              totalChunks: chunks.length,
            },
          });

          if (error) throw new Error(error.message);
          if (data?.error) throw new Error(data.error);

          translatedChunks.push(data.result);
        }

        const merged = translatedChunks.join("\n\n");
        setProgress(100);
        setResult(merged);
        setResultDialogOpen(true);
        toast.success("تمت الترجمة بنجاح!");
      }
    } catch (err: any) {
      console.error("AI processing error:", err);
      toast.error(err.message || "حدث خطأ أثناء المعالجة");
    } finally {
      setProcessing(false);
    }
  }, [mode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("الصيغ المدعومة: PDF, DOCX, TXT");
      return;
    }

    processFile(file);
    // Reset input
    e.target.value = "";
  };

  const downloadAsTxt = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "translate" ? "translated_document.txt" : "summary.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsPdf = () => {
    if (!result) return;
    const filename = mode === "translate" ? "translated_document.pdf" : "summary.pdf";
    generatePDF(result, filename);
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Floating AI Button */}
      <div className="fixed bottom-6 left-6 z-50">
        {/* Menu */}
        {menuOpen && (
          <div className="absolute bottom-16 left-0 bg-card border border-border rounded-xl shadow-[0_0_30px_hsl(195_100%_50%/0.2)] p-2 space-y-1 animate-fade-in min-w-[200px]">
            <button
              onClick={() => handleModeSelect("translate")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 transition-colors text-right"
            >
              <Languages className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-foreground text-sm">ترجمة ملف</p>
                <p className="text-xs text-muted-foreground">ترجمة مستند هندسي للعربية</p>
              </div>
            </button>
            <button
              onClick={() => handleModeSelect("summarize")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 transition-colors text-right"
            >
              <FileText className="w-5 h-5 text-accent shrink-0" />
              <div>
                <p className="font-semibold text-foreground text-sm">تلخيص ملف</p>
                <p className="text-xs text-muted-foreground">إنشاء ملخص ذكي للمستند</p>
              </div>
            </button>
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_25px_hsl(195_100%_50%/0.4)] ${
            menuOpen
              ? "bg-muted text-muted-foreground rotate-45"
              : "bg-primary text-primary-foreground hover:shadow-[0_0_40px_hsl(195_100%_50%/0.6)] hover:scale-110"
          }`}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        </button>
      </div>

      {/* Processing Overlay */}
      {processing && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full mx-4 space-y-6 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                {mode === "translate" ? "جاري الترجمة..." : "جاري التلخيص..."}
              </h3>
              <p className="text-sm text-muted-foreground">{progressText}</p>
            </div>
            <div className="space-y-2">
              <Progress value={progress} className="h-3" />
              <p className="text-xs text-muted-foreground text-center">{progress}%</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => { abortRef.current = true; }}
            >
              إلغاء
            </Button>
          </div>
        </div>
      )}

      {/* Result Dialog */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              {mode === "translate" ? (
                <>
                  <Languages className="w-5 h-5 text-primary" />
                  تمت الترجمة بنجاح
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 text-accent" />
                  ملخص المستند
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto bg-secondary/30 rounded-lg p-4 text-foreground text-sm leading-relaxed whitespace-pre-wrap" dir="rtl">
            {result}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="glow" onClick={downloadAsPdf} className="flex-1">
              <Download className="w-4 h-4" /> تحميل PDF
            </Button>
            <Button variant="outline" onClick={downloadAsTxt} className="flex-1">
              <Download className="w-4 h-4" /> تحميل TXT
            </Button>
            <Button variant="ghost" onClick={() => setResultDialogOpen(false)}>
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AITools;
