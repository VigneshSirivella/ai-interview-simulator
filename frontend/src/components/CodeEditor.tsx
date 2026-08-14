import React, { useState, useEffect } from "react";
import { Play, Code2, Copy, Check, RotateCcw } from "lucide-react";

interface CodeEditorProps {
  initialCode?: string;
  selectedLanguage?: string;
  onCodeChange: (code: string) => void;
  onLanguageChange?: (lang: string) => void;
  onRunCode?: (code: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode = "// Write your solution here...\nfunction solution() {\n  return true;\n}",
  selectedLanguage = "javascript",
  onCodeChange,
  onLanguageChange,
  onRunCode,
}) => {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState(selectedLanguage);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  useEffect(() => {
    setLanguage(selectedLanguage);
  }, [selectedLanguage]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCode(val);
    onCodeChange(val);
  };

  const handleLangSelect = (lang: string) => {
    setLanguage(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(initialCode);
    onCodeChange(initialCode);
  };

  const lineCount = code.split("\n").length;

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 dark:bg-slate-950 shadow-2xl flex flex-col font-mono text-sm">
      {/* Editor Header Bar */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-slate-300">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive Code Console</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center gap-1 text-xs font-sans">
            <span className="text-slate-400 text-[11px] hidden sm:inline">Lang:</span>
            <select
              value={language}
              onChange={(e) => handleLangSelect(e.target.value)}
              className="bg-slate-800 text-xs text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 outline-none focus:ring-1 focus:ring-indigo-500 font-sans cursor-pointer"
            >
              <option value="python">Python 3.12</option>
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="typescript">TypeScript</option>
              <option value="cpp">C++ (GCC 13)</option>
              <option value="java">Java 21</option>
              <option value="c">C (GCC 13)</option>
              <option value="go">Go 1.22</option>
              <option value="rust">Rust 2021</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Reset Code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {onRunCode && (
            <button
              type="button"
              onClick={() => onRunCode(code)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold font-sans transition shadow-sm"
            >
              <Play className="w-3 h-3 fill-current" />
              Run Code
            </button>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative flex min-h-[220px] max-h-[380px] overflow-auto">
        {/* Line Numbers */}
        <div className="py-3 px-3 bg-slate-900/50 text-slate-600 text-right select-none border-r border-slate-800/80 text-xs leading-6 min-w-[2.5rem]">
          {Array.from({ length: Math.max(8, lineCount) }).map((_, idx) => (
            <div key={idx}>{idx + 1}</div>
          ))}
        </div>

        {/* TextArea */}
        <textarea
          value={code}
          onChange={handleChange}
          spellCheck={false}
          className="w-full p-3 bg-transparent text-slate-100 outline-none resize-none leading-6 font-mono text-xs sm:text-sm focus:ring-0 selection:bg-indigo-500/30"
          rows={Math.max(8, lineCount)}
        />
      </div>
    </div>
  );
};
