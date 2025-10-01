import { useState } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisResult {
  disease: string;
  causes: string;
  summary: string;
}

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setAnalysis(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-skin", {
        body: { image: selectedImage },
      });

      if (error) throw error;

      setAnalysis(data);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            DermaDict AI
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-Powered Skin Disease Detection & Analysis
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Identify Skin Conditions
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Instantly with AI
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload an image and get instant analysis powered by advanced AI technology.
            Learn about causes, symptoms, and recommendations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Upload Section */}
          <Card className="p-8 border-2 border-dashed border-border hover:border-primary/50 transition-colors">
            <div className="space-y-6">
              <div className="text-center">
                <Upload className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Upload Image</h3>
                <p className="text-sm text-muted-foreground">
                  Take or upload a clear photo of the affected area
                </p>
              </div>

              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="border-2 border-border rounded-lg overflow-hidden bg-muted/30 hover:bg-muted/50 transition-colors min-h-[300px] flex items-center justify-center">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <Upload className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Click to upload an image
                      </p>
                    </div>
                  )}
                </div>
              </label>

              <Button
                onClick={analyzeImage}
                disabled={!selectedImage || isAnalyzing}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Image"
                )}
              </Button>
            </div>
          </Card>

          {/* Results Section */}
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
            {analysis ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    {analysis.disease}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    AI-Generated Analysis
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">Possible Causes</h4>
                    <p className="text-sm text-foreground leading-relaxed">
                      {analysis.causes}
                    </p>
                  </div>

                  <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
                    <h4 className="font-semibold text-secondary mb-2">Summary & Recommendations</h4>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                      {analysis.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-900 dark:text-amber-200">
                    <strong>Medical Disclaimer:</strong> This is an AI-powered analysis
                    and should not replace professional medical advice. Please consult
                    a dermatologist for proper diagnosis and treatment.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">No Analysis Yet</h3>
                  <p className="text-muted-foreground">
                    Upload an image and click "Analyze" to get started
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Info Section */}
        <Card className="mt-12 p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <h3 className="text-2xl font-bold mb-4">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-semibold">Upload Image</h4>
              <p className="text-sm text-muted-foreground">
                Take or upload a clear photo of the skin condition
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-semibold">AI Analysis</h4>
              <p className="text-sm text-muted-foreground">
                Advanced AI analyzes the image and identifies patterns
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-semibold">Get Results</h4>
              <p className="text-sm text-muted-foreground">
                Receive detailed information about causes and recommendations
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Index;
