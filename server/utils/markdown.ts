import { marked } from 'marked'
import hljs from 'highlight.js'

const renderer = new marked.Renderer()

renderer.link = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`
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

export function renderMarkdown(content: string): string {
  if (!content) return ''
  return marked.parse(content) as string
}
