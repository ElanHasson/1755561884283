import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

export default function Slide() {
  const markdown = `- The pain we’re deleting today:
  - Build scripts and Dockerfiles → Cloud Native Buildpacks create secure, reproducible images automatically
  - Certs and DNS → Automatic TLS provisioning/renewal and simple custom domain mapping
  - Log and metrics plumbing → Built-in logs/metrics with one-click forwarding to your provider
  - Risky rollouts and manual scaling → Health-checked rolling deploys and easy horizontal/vertical scaling
  - Secrets drift → Encrypted env vars and managed DB integrations

\`\`\`yaml
# app.yaml — the only config you need
name: demo
region: nyc
services:
  - name: api
    source_dir: api
    github:
      repo: myorg/myrepo
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
        scope: RUN_AND_BUILD_TIME
        type: SECRET
domains:
  - domain: app.example.com
log_destinations:
  - name: datadog
    datadog:
      api_key: \${DATADOG_API_KEY}
      region: US
\`\`\`

\`\`\`mermaid
flowchart TD
  A[Push code] --> B[CNB detects runtime & builds image]
  B --> C[App Platform deploys with health checks]
  C --> D[TLS certs + DNS configured]
  C --> E[Logs + metrics wired]
  C --> F[Horizontal/vertical scaling]
  D --> G[You focus on features]
  E --> G
  F --> G
\`\`\`
`;
  const mermaidRef = useRef(0);
  
  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: true,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#667eea',
        primaryTextColor: '#fff',
        primaryBorderColor: '#7c3aed',
        lineColor: '#5a67d8',
        secondaryColor: '#764ba2',
        tertiaryColor: '#667eea',
        background: '#1a202c',
        mainBkg: '#2d3748',
        secondBkg: '#4a5568',
        tertiaryBkg: '#718096',
        textColor: '#fff',
        nodeTextColor: '#fff',
      }
    });
    
    // Find and render mermaid diagrams
    const renderDiagrams = async () => {
      const diagrams = document.querySelectorAll('.language-mermaid');
      for (let i = 0; i < diagrams.length; i++) {
        const element = diagrams[i];
        const graphDefinition = element.textContent;
        const id = `mermaid-${mermaidRef.current++}`;
        
        try {
          const { svg } = await mermaid.render(id, graphDefinition);
          element.innerHTML = svg;
          element.classList.remove('language-mermaid');
          element.classList.add('mermaid-rendered');
        } catch (error) {
          console.error('Mermaid rendering error:', error);
        }
      }
    };
    
    renderDiagrams();
  }, [markdown]);
  
  return (
    <div className="slide markdown-slide">
      <h1>The DevOps pain checklist we’re deleting today</h1>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          code({node, className, children, ...props}: any) {
            const match = /language-(w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const isInline = !className;
            
            if (!isInline && language === 'mermaid') {
              return (
                <pre className="language-mermaid">
                  <code>{String(children).replace(/\n$/, '')}</code>
                </pre>
              );
            }
            
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}