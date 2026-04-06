import { marked } from 'marked'
import hljs from 'highlight.js'
import DOMPurify from 'isomorphic-dompurify'

const renderer = new marked.Renderer()

renderer.link = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : ''
  const isExternal = href.startsWith('http://') || href.startsWith('https://')
  const relAttr = isExternal ? ' rel="noopener noreferrer"' : ''
  return `<a href="${href}"${titleAttr} target="_blank"${relAttr}>${text}</a>`
}

renderer.code = ({ text, lang }) => {
  let highlighted: string

  if (lang && hljs.getLanguage(lang)) {
    try {
      highlighted = hljs.highlight(text, { language: lang }).value
    } catch {
      highlighted = hljs.highlightAuto(text).value
    }
  } else {
    highlighted = hljs.highlightAuto(text).value
  }

  return `<pre><code class="hljs ${lang || ''}">${highlighted}</code></pre>`
}

marked.setOptions({
  gfm: true,
  breaks: true,
  pedantic: false,
})

marked.use({ renderer })

export const useMarkdown = () => {
  const renderMarkdown = (content: string): string => {
    if (!content) return ''
    const rawHtml = marked.parse(content) as string
    return DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'del', 'ins',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote', 'pre', 'code',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'hr', 'div', 'span'
      ],
      ALLOWED_ATTR: [
        'href', 'title', 'target', 'rel',
        'src', 'alt', 'width', 'height',
        'class', 'id'
      ],
      ALLOW_DATA_ATTR: false,
    })
  }

  return {
    renderMarkdown,
  }
}
