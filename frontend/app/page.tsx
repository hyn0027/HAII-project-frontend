'use client';
import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [passage, setPassage] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSummary('');

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/summarize/', { passage });
      setSummary(res.data.summary);
    } catch (err) {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-10 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Text Summarizer</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={passage}
          onChange={(e) => setPassage(e.target.value)}
          placeholder="Enter your passage here..."
          className="border border-gray-300 rounded-lg p-4 min-h-[150px] text-gray-800"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Summarizing...' : 'Summarize'}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {summary && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Summary:</h2>
          <p>{summary}</p>
        </div>
      )}
    </main>
  );
}