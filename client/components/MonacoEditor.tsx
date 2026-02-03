import Editor from "@monaco-editor/react";

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
  return (
    <Editor
      height="100%"
      defaultLanguage={language}
      language={language}
      value={value}
      onChange={(newValue) => onChange(newValue || "")}
      theme="vs-dark"
      options={{
        readOnly: readOnly,
        minimap: { enabled: false },
        fontSize: 13,
        fontFamily: "'Courier New', monospace",
        lineHeight: 1.6,
        padding: { top: 16, bottom: 16 },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        tabSize: 2,
        automaticLayout: true,
      }}
      className={className}
    />
  );
}
