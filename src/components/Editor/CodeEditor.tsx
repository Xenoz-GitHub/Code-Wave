'use client'

import { useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { getLanguageFromFileName } from '@/lib/utils'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

type File = {
  id: string
  name: string
  content: string
  type: string
}

type Props = {
  file: File
  onChange: (value: string | undefined) => void
}

export default function CodeEditor({ file, onChange }: Props) {
  const language = getLanguageFromFileName(file.name)

  return (
    <div className="h-full w-full">
      <MonacoEditor
        key={file.id}
        defaultLanguage={language}
        language={language}
        value={file.content}
        onChange={onChange}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          bracketPairColorization: { enabled: true },
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          formatOnPaste: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          parameterHints: { enabled: true },
          hover: { enabled: true },
          padding: { top: 8 },
        }}
        loading={
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            Loading editor...
          </div>
        }
      />
    </div>
  )
}
