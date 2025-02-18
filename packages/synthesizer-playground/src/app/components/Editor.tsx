'use client';

import { Editor as MonacoEditor } from '@monaco-editor/react';

const DEFAULT_CODE = `// Example circuit
circuit Example {
    signal input a;
    signal input b;
    signal output c;
    
    c <== a * b;
}`;

export function Editor() {
  return (
    <div className="h-full w-full border rounded-lg overflow-hidden">
      <MonacoEditor
        height="100%"
        defaultLanguage="javascript"
        defaultValue={DEFAULT_CODE}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          readOnly: false
        }}
      />
    </div>
  );
} 