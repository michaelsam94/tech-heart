function CodeBlock({ lang, code }) {
  return (
    <pre className="article-code" tabIndex={0}>
      <code className={lang ? `language-${lang}` : undefined}>{code.trimEnd()}</code>
    </pre>
  )
}

export function SectionRenderer({ sections }) {
  if (!sections?.length) return null

  return sections.map((block, i) => {
    const key = `s-${i}`

    if (block.p) {
      return (
        <div key={key} className="article-paragraphs">
          {block.p.map((text, j) => (
            <p key={j}>{text}</p>
          ))}
        </div>
      )
    }

    if (block.h2) return <h2 key={key}>{block.h2}</h2>
    if (block.h3) return <h3 key={key}>{block.h3}</h3>

    if (block.ul) {
      return (
        <ul key={key} className="article-list">
          {block.ul.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      )
    }

    if (block.code) {
      return (
        <CodeBlock
          key={key}
          lang={block.code.lang}
          code={block.code.code}
        />
      )
    }

    if (block.note) {
      return (
        <aside key={key} className="article-note" role="note">
          <strong>Note.</strong> {block.note}
        </aside>
      )
    }

    return null
  })
}
