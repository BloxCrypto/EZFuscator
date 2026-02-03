import { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  className?: string;
}

export default function MonacoEditorComponent({
  value,
  onChange,
  language = "lua",
  readOnly = false,
  className = "",
}: MonacoEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !mounted) return;

    // Create editor instance
    const editor = monaco.editor.create(containerRef.current, {
      value: value,
      language: language,
      theme: "vs-dark",
      readOnly: readOnly,
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 13,
      fontFamily: "'Courier New', monospace",
      lineHeight: 1.6,
      padding: { top: 16, bottom: 16 },
      scrollBeyondLastLine: false,
      wordWrap: "on",
      tabSize: 2,
    });

    editorRef.current = editor;

    // Handle value changes
    const disposable = editor.onDidChangeModelContent(() => {
      onChange(editor.getValue());
    });

    return () => {
      disposable.dispose();
    };
  }, [mounted, onChange, language, readOnly]);

  // Update editor value when prop changes externally
  useEffect(() => {
    if (editorRef.current && mounted) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== value) {
        editorRef.current.setValue(value);
      }
    }
  }, [value, mounted]);

  useEffect(() => {
    setMounted(true);
    return () => {
      editorRef.current?.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`h-full w-full ${className}`}
      style={{ overflow: "hidden" }}
    />
  );
}
