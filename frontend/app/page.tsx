"use client";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { KeywordHighlight } from "@/components/ui/keyword-highlight";

export default function Home() {
  type Keyword = Record<string, string>;
  type KeywordList = Keyword[];
  type Keywords = KeywordList[];

  const [passage, setPassage] = useState("");
  const [keywords, setKeywords] = useState<Keywords>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setKeywords([]);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/get_keywords/", {
        passage,
      });
      setKeywords(res.data.keywords_with_expanations);
    } catch (err) {
      setError("An error occurred while fetching keyword explanations.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 sm:p-10 w-full max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Technical Article Reading Helper
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Textarea
          value={passage}
          onChange={(e) => setPassage(e.target.value)}
          placeholder="Enter your passage here..."
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Get Keyword Explanations"}
        </Button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {keywords.length > 0 && (
        <div className="mt-8 p-4 border rounded-lg bg-gray-50 leading-relaxed">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">
            Passage with Keyword Explanations:
          </h2>
          <div className="space-y-4">
            {keywords.map((paragraph, pIdx) => (
              <div
                key={pIdx}
                className="text-gray-800 leading-relaxed whitespace-pre-wrap break-words text-justify"
              >
                {paragraph.map(
                  (wordObj: Record<string, string>, wIdx: number) => {
                    const space = wIdx === paragraph.length - 1 ? "" : " ";
                    return (
                      <span key={wIdx}>
                        <KeywordHighlight wordObj={wordObj} />
                        {space}
                      </span>
                    );
                  },
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
