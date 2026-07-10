export function cn(...inputs: (string | boolean | null | undefined)[]) {
  return inputs.filter(Boolean).join(' ')
}

export function getLanguageFromFileName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    jsx: 'javascript',
    tsx: 'typescript',
    html: 'html',
    css: 'css',
    json: 'json',
    py: 'python',
    rb: 'ruby',
    rs: 'rust',
    go: 'go',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    dart: 'dart',
    scala: 'scala',
    sql: 'sql',
    md: 'markdown',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    sh: 'shell',
    bash: 'shell',
    zig: 'zig',
    nim: 'nim',
    lua: 'lua',
    r: 'r',
    hs: 'haskell',
    ex: 'elixir',
    exs: 'elixir',
    erl: 'erlang',
    pl: 'perl',
    vue: 'html',
    svelte: 'html',
  }
  return map[ext || ''] || 'plaintext'
}
