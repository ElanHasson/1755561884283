import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Mermaid from '../../components/Mermaid';

export default function Slide() {
  const markdown = `- **Adopt paved roads: Buildpacks + app spec**
  - Start with Cloud Native Buildpacks; skip bespoke Dockerfiles and bash build glue
  - Keep an \`app.yaml\` in the repo for GitOps-style, repeatable deploys
  - Map custom domains; App Platform handles TLS certs and renewals automatically
\`\`\`yaml
# app.yaml (excerpt)
name: myapp
region: nyc
services:
  - name: api
    source_dir: services/api
    github:
      repo: myorg/myrepo
      branch: main
      deploy_on_push: true
    http_port: 3000
    instance_size_slug: basic-xxs
    instance_count: 2  # set autoscaling min/max in settings or spec
    routes:
      - path: /
    health_check:
      path: /health
    envs:
      - key: DATABASE_URL
        value: \${DATABASE_URL}
        scope: RUN_AND_BUILD_TIME
        type: SECRET
log_destinations:
  - name: datadog
    datadog:
      api_key: \${DATADOG_API_KEY}
      region: US
\`\`\`
- **12‑Factor config, not snowflake servers**
  - Use env vars for config and secrets; avoid filesystem persistence
  - Attach Managed Databases and Spaces for durable data
  - Separate staging/prod apps with distinct secrets
\`\`\`yaml
# Secrets and environment separation
envs:
  - key: NODE_ENV
    value: production
  - key: REDIS_URL
    value: \${REDIS_URL}
    type: SECRET
\`\`\`
- **Health checks + safe deploys**
  - Provide a lightweight readiness endpoint; enable rolling deploys
  - Fail fast on unhealthy builds to avoid serving bad releases
\`\`\`js
// Node/Express readiness
app.get('/health', (req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime() });
});
\`\`\`
- **Observability by default**
  - Use structured logs; forward to your provider in one click/app spec
  - Monitor CPU, memory, request metrics; set alerts in your APM
\`\`\`json
{"ts":"2025-08-18T12:00:00Z","level":"info","evt":"user_signup","user_id":"123","plan":"pro"}
\`\`\`
- **Scale smart + isolate workloads**
  - Right-size instances; set autoscaling ranges per component
  - Split API, static site, and workers so each scales independently
\`\`\`mermaid
flowchart TD
  A[git push] --> B[Buildpacks detect + build]
  B --> C[OCI image]
  C --> D[Rolling deploy]
  D --> E[TLS + DNS handled]
  D --> F[Logs + Metrics]
  F --> G[Alerts/Forwarding]
  D --> H[Autoscale per component]
\`\`\``;
  
  return (
    <div className="slide markdown-slide">
      <h1>Best practices: paved roads to stay out of ops quicksand</h1>
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