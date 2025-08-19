import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

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
        value: ${DATABASE_URL}
        type: SECRET
log_destinations:
  - name: datadog
    datadog:
      api_key: ${DATADOG_API_KEY}
      region: US
domains:
  - domain: app.example.com
\`\`\``;
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
      <h1>Rapid-fire Q&amp;A: what’s blocking you from dropping DevOps toil?</h1>
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