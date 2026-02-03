import { useState, useRef } from "react";
import { Copy, Download, Trash2 } from "lucide-react";
import { obfuscateLua, formatBytes } from "@/lib/obfuscate";
import MonacoEditor from "@/components/MonacoEditor";

export default function Obfuscator() {
  const [inputCode, setInputCode] = useState('print("Hello World!")');
  const [outputCode, setOutputCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState({ original: 0, obfuscated: 0 });

  const handleObfuscate = () => {
    if (!inputCode.trim()) {
      alert("Please enter some Lua code to obfuscate");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      try {
        const result = obfuscateLua(inputCode);
        setOutputCode(result.code);
        setStats({
          original: result.originalSize,
          obfuscated: result.obfuscatedSize,
        });
      } catch (error) {
        console.error(error);
        alert("Error: " + (error instanceof Error ? error.message : "Unknown error"));
      } finally {
        setIsProcessing(false);
      }
    }, 300);
  };

  const handleCopyOutput = () => {
    if (!outputCode) {
      alert("No obfuscated code to copy");
      return;
    }

    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(outputCode).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        // Fallback to older method
        fallbackCopy();
      });
    } else {
      // Fallback for older browsers or restricted environments
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = outputCode;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        alert("Failed to copy to clipboard. Please try again.");
      }
    } catch (err) {
      console.error("Copy failed:", err);
      alert("Failed to copy to clipboard. Please try again.");
    }
  };

  const handleDownload = () => {
    if (!outputCode) {
      alert("No obfuscated code to download");
      return;
    }

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(outputCode)
    );
    element.setAttribute("download", "obfuscated.lua");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("File size exceeds 1MB limit");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        setInputCode(content);
      } catch (error) {
        alert("Failed to read file: " + (error instanceof Error ? error.message : "Unknown error"));
      }
    };
    reader.onerror = () => {
      alert("Failed to read file");
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    setInputCode("");
    setOutputCode("");
    setStats({ original: 0, obfuscated: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === "Enter") {
      handleObfuscate();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden gap-0 flex-col md:flex-row">
        {/* Left Panel - Input */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-[50vh] md:min-h-auto">
          {/* Button Row */}
          <div className="flex gap-2 p-3 bg-[#252525] border-b border-border flex-wrap">
            <button
              onClick={handleClearAll}
              className="flex-1 min-w-24 px-3 py-2 bg-card border border-border text-foreground rounded hover:bg-[#333] transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Clear</span>
            </button>
            <button
              onClick={handleObfuscate}
              disabled={isProcessing}
              className="flex-1 min-w-24 px-3 py-2 bg-primary text-primary-foreground rounded hover:bg-blue-500 transition-colors text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <span className="w-1 h-1 bg-current rounded-full animate-pulse-slow"></span>
                  <span className="hidden sm:inline">Processing...</span>
                </>
              ) : (
                <>
                  Obfuscate
                </>
              )}
            </button>
            <button
              onClick={handleCopyOutput}
              className="flex-1 min-w-24 px-3 py-2 bg-card border border-border text-foreground rounded hover:bg-[#333] transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <Copy size={16} />
              <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>

          {/* Editor Header */}
          <div className="px-4 py-3 bg-[#252525] border-b border-border text-sm text-muted-foreground flex justify-between items-center">
            <span className="font-semibold">Input Code</span>
            <label className="cursor-pointer text-primary hover:text-blue-500 transition-colors text-xs font-medium flex items-center gap-1">
              <span>Upload</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".lua,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Code Editor */}
          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="-- Paste your Lua code here..."
            className="flex-1 bg-background text-foreground font-mono text-sm p-4 resize-none outline-none border-none overflow-auto"
          />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-border"></div>
        <div className="md:hidden h-px bg-border w-full"></div>

        {/* Right Panel - Output */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-[50vh] md:min-h-auto">
          {/* Editor Header */}
          <div className="px-4 py-3 bg-[#252525] border-b border-border text-sm text-muted-foreground flex justify-between items-center">
            <span className="font-semibold">Obfuscated</span>
            {outputCode && (
              <button
                onClick={handleDownload}
                className="text-primary hover:text-blue-500 transition-colors text-xs font-medium flex items-center gap-1"
              >
                <Download size={14} />
                <span>{downloaded ? "Downloaded!" : "Download"}</span>
              </button>
            )}
          </div>

          {/* Output Content */}
          <div className="flex-1 overflow-auto p-4">
            {outputCode ? (
              <div className="relative">
                <pre className="bg-[#252525] border border-border rounded p-3 font-mono text-sm text-primary overflow-x-auto break-all whitespace-pre-wrap word-break-break-word">
                  {outputCode}
                </pre>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Output will appear here...
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
