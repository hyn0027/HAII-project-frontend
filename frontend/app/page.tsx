"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { KeywordHighlight } from "@/components/ui/keyword-highlight";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  BookOpen,
  Sparkles,
  AlertCircle,
  Loader2,
  Lightbulb,
  X,
} from "lucide-react";
import { API_ENDPOINT, TIP_STORAGE_KEY, type Keywords } from "@/lib/constants";

export default function Home() {
  const [passage, setPassage] = useState("");
  const [keywords, setKeywords] = useState<Keywords>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTip, setShowTip] = useState(true);

  // Load tip visibility from localStorage
  useEffect(() => {
    const tipDismissed = localStorage.getItem(TIP_STORAGE_KEY);
    setShowTip(tipDismissed !== "true");
  }, []);

  const handleDismissTip = () => {
    setShowTip(false);
    localStorage.setItem(TIP_STORAGE_KEY, "true");
  };

  const handleShowTip = () => {
    setShowTip(true);
    localStorage.removeItem(TIP_STORAGE_KEY);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passage.trim()) return;

    setLoading(true);
    setError("");
    setKeywords([]);

    try {
      const res = await axios.post(API_ENDPOINT, { passage });
      setKeywords(res.data.keywords_with_explanations);
    } catch (err) {
      setError(
        "Failed to fetch keyword explanations. Please check if the backend server is running.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                Technical Article Reading Helper
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-powered keyword explanations
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Enter Your Article
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={passage}
                onChange={(e) => setPassage(e.target.value)}
                placeholder="Paste your technical article here. We will help you identify and explain complex terms and concepts..."
                className="min-h-[200px] text-justify"
              />
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{passage.length} characters</Badge>
                <Button type="submit" disabled={loading || !passage.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Get Explanations
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Section */}
        {keywords.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Keyword Explanations
                </CardTitle>
                {!showTip && (
                  <Button variant="ghost" size="sm" onClick={handleShowTip}>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Show tip
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showTip && (
                <Alert className="transition-all duration-200">
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription className="flex justify-between items-center">
                    <span>
                      Hover over highlighted terms to see their explanations.
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDismissTip}
                      className="h-auto p-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              <Separator />
              <div className="space-y-4">
                {keywords.map((paragraph, pIdx) => (
                  <Card key={pIdx} className="p-4">
                    <div className="leading-relaxed whitespace-pre-wrap break-words text-justify">
                      {paragraph.map((wordObj, wIdx) => {
                        const currentWord = wordObj.word;
                        const nextWord =
                          wIdx < paragraph.length - 1
                            ? paragraph[wIdx + 1].word
                            : "";
                        const shouldAddSpace =
                          wIdx < paragraph.length - 1 &&
                          !/[(\[{]$/.test(currentWord) &&
                          !/^[.,;:!?)\]}]/.test(nextWord);

                        return (
                          <span key={wIdx}>
                            <KeywordHighlight wordObj={wordObj} />
                            {shouldAddSpace && " "}
                          </span>
                        );
                      })}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!keywords.length && !loading && !error && (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  Ready to Help You Read
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Paste a technical article above and we will identify complex
                  terms and provide explanations.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12" />
    </div>
  );
}
