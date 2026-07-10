'use client'

import { useState, useEffect, useRef } from 'react'

type Props = {
  code: string
  language: string
}

export default function LivePreview({ code, language }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile' | 'tablet'>('desktop')

  useEffect(() => {
    if (!iframeRef.current || !code) return
    const iframe = iframeRef.current

    if (language === 'html') {
      const blob = new Blob([code], { type: 'text/html' })
      iframe.src = URL.createObjectURL(blob)
    } else if (language === 'javascript' || language === 'typescript') {
      // For JS/TS, wrap in a basic HTML page
      const html = `<!DOCTYPE html><html><body><script>${code}<\/script></body></html>`
      const blob = new Blob([html], { type: 'text/html' })
      iframe.src = URL.createObjectURL(blob)
    } else if (language === 'css') {
      const html = `<!DOCTYPE html><html><head><style>${code}</style></head><body><div class="preview">Preview</div></body></html>`
      const blob = new Blob([html], { type: 'text/html' })
      iframe.src = URL.createObjectURL(blob)
    } else {
      iframe.srcdoc = '<p style="color:gray;font-family:sans-serif;padding:20px">Preview not available for this language</p>'
    }
  }, [code, language])

  const widths = {
    mobile: 'w-[375px]',
    tablet: 'w-[768px]',
    desktop: 'w-full',
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between px-2 py-1 border-b border-gray-200 bg-gray-50 shrink-0">
        <span className="text-xs text-gray-500">Preview</span>
        <div className="flex items-center gap-1">
          {(['mobile', 'tablet', 'desktop'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setPreviewMode(mode)}
              className={`px-2 py-0.5 text-xs rounded ${
                previewMode === mode ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              {mode === 'mobile' ? '📱' : mode === 'tablet' ? '📟' : '🖥️'}
            </button>
          ))}
        </div>
      </div>
      <div className={`flex-1 flex items-start justify-center overflow-auto bg-gray-100 p-2`}>
        <div className={`${widths[previewMode]} bg-white shadow-sm min-h-[200px] transition-all`}>
          <iframe
            ref={iframeRef}
            className="w-full h-full min-h-[300px] border-0"
            sandbox="allow-scripts allow-modals allow-same-origin"
            title="Live Preview"
          />
        </div>
      </div>
    </div>
  )
}
