import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function ArticleBody({ markdown }) {
  return (
    <div className="article-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  )
}
