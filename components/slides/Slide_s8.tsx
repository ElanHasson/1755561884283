import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Mermaid from '../../components/Mermaid';

export default function Slide() {
  const markdown = `- Ship today in 5 steps
  - Connect repo → accept detected Buildpacks (no Dockerfile)
  - Add env vars and mark secrets; attach a managed database
  - Expose \`/health\` for safe rolling deploys
  - Map custom domain → TLS auto-provisioned/renewed
  - Set min/max instances; enable log forwarding
- Keep it reproducible
  - Commit an \`app.yaml\` in your repo (GitOps-friendly)
  - Stateless app; use Managed Databases/Spaces for persistence
\`\`\`yaml
# app.yaml — minimal starter
name: myapp
services:
  - name: api
    github:
      repo: yourorg/yourrepo
      branch: main
      deploy_on_push: true
    http_port: 3000
    instance_size_slug: basic-xxs
    instance_count: 2
    routes:
      - path: /
    health_check:
      path: /health
    envs:
      - key: DATABASE_URL
        value: \${DATABASE_URL}
        type: SECRET
\`\`\`
\`\`\`mermaid
flowchart TD
  A[Push to main] --> B[Buildpacks build image]
  B --> C[Rolling deploy]
  C --> D[TLS & DNS auto]
  D --> E[Autoscale + Logs/Metrics]
  E --> F[Sleep well]
\`\`\``;
  
  return (
    <div className="slide markdown-slide">
      <h1>Actionable next steps: ship today, sleep tonight</h1>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          code({node, inline, className, children, ...props}: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            // Handle inline code
            if (inline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            
            // Handle mermaid diagrams
            if (language === 'mermaid') {
              return (
                <Mermaid chart={String(children).replace(/\n$/, '')} />
              );
            }
            
            // Handle code blocks with syntax highlighting
            if (language) {
              return (
                <SyntaxHighlighter
                  language={language}
                  style={atomDark}
                  showLineNumbers={true}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              );
            }
            
            // Default code block without highlighting
            return (
              <pre>
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          }
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}