import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Mermaid from '../../components/Mermaid';

export default function Slide() {
  const markdown = `- Drop a number in chat now:
  1) Build scripts/Dockerfiles  2) Certs/DNS  3) Logs/Metrics  4) Scaling/Rollouts

- Rapid answers
  - 1 → Use Cloud Native Buildpacks: no Dockerfile, no custom CI scripts
  - 2 → Map your domain; TLS certs are auto-provisioned and renewed
  - 3 → View logs/metrics in console; enable log forwarding in app spec
  - 4 → Pick instance size, set instance counts; rolling deploys + health checks
\`\`\`mermaid
flowchart TD
  Q[What's blocking you most?] --> B1[Build scripts & Dockerfiles]
  Q --> B2[Certs & DNS]
  Q --> B3[Logs & Metrics]
  Q --> B4[Scaling & Rollouts]
  B1 --> S1[Buildpacks build from Git]
  B2 --> S2[Custom domain + auto TLS]
  B3 --> S3[Logs in UI + forward to APM]
  B4 --> S4[Instance sizing + health checks]
\`\`\`
\`\`\`yaml
# App Platform snippet: logs, health checks, domain
services:
  - name: api
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
log_destinations:
  - name: datadog
    datadog:
      api_key: \${DATADOG_API_KEY}
      region: US
domains:
  - domain: app.example.com
\`\`\``;
  
  return (
    <div className="slide markdown-slide">
      <h1>Rapid-fire Q&amp;A: what’s blocking you from dropping DevOps toil?</h1>
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