import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Mermaid from '../../components/Mermaid';

export default function Slide() {
  const markdown = `- Connect repo; no Dockerfile needed — Buildpacks auto-detect and build
- Instant HTTPS on a default domain; add custom domain when ready
- Set min/max instances; platform autoscale handles bursts
- View live logs and metrics; forward logs to your provider
- Keep it repeatable with an app spec (YAML)
\`\`\`javascript
// index.js — tiny API with health check and structured logs
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/health', (req, res) => res.status(200).send('ok'));

app.get('/', (req, res) => {
  const msg = { level: 'info', msg: 'hello from app-platform', ts: new Date().toISOString() };
  console.log(JSON.stringify(msg));
  res.json({ hello: 'world' });
});

app.listen(PORT, () => {
  console.log(JSON.stringify({ level: 'info', msg: \`listening on \${PORT}\`, ts: new Date().toISOString() }));
});
\`\`\`
\`\`\`yaml
# app.yaml — minimal web service (Buildpacks build from source)
name: demo-app
region: nyc
services:
  - name: api
    http_port: 8080
    instance_size_slug: basic-xxs
    instance_count: 1  # set min to 1; autoscale range in UI during demo
    github:
      repo: yourorg/demo-repo
      branch: main
      deploy_on_push: true
    routes:
      - path: /
    health_check:
      path: /health
    envs:
      - key: NODE_ENV
        value: production
\`\`\`
\`\`\`bash
# Logs (CLI): stream app logs during the demo
# Get the app ID from the UI or \`doctl apps list\`
doctl apps logs <APP_ID> --follow --component api

# Optional quick load to trigger autoscale (in another terminal)
npx autocannon -c 50 -d 60 https://<your-app>.ondigitalocean.app/
\`\`\`
\`\`\`mermaid
flowchart LR
  A[Git Repo] --> B["Buildpacks Detect\n(Node, Python, etc.)"]
  B --> C[OCI Image Built\nwith caching]
  C --> D[Deploy to App Platform]
  D --> E[Default URL + TLS\nondigitalocean.app]
  E --> F["Autoscale on load\n(min/max instances)"]
  D --> G[Logs & Metrics\nUI/CLI/Forwarding]
\`\`\``;
  
  return (
    <div className="slide markdown-slide">
      <h1>Demo: Repo → Buildpacks → URL with TLS → autoscale → logs in minutes</h1>
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