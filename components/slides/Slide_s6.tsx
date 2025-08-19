import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Slide() {
  const markdown = `- **Buildpack detects the wrong runtime**
  - Add clear language signals; avoid custom Dockerfiles unless truly needed
  - Use Procfile/runtime pinning
\`\`\`procfile
# Procfile (root or source_dir)
web: node server.js
\`\`\`
\`\`\`text
# runtime.txt (Python example)
python-3.11.5
\`\`\`
\`\`\`json
// package.json (Node example)
{
  "engines": { "node": ">=18 <21" }
}
\`\`\`
- **Secrets/config drift**
  - Keep config in App Spec; mark secrets explicitly
\`\`\`yaml
# app.yaml snippet
services:
  - name: api
    http_port: 3000
    envs:
      - key: DATABASE_URL
        value: \${DATABASE_URL}
        scope: RUN_AND_BUILD_TIME
        type: SECRET
\`\`\`
- **Ephemeral filesystem & migrations**
  - Don’t write to disk; use Managed Databases/Spaces; run migrations during deploy via a worker or scripted step
- **No health checks or scaling tuning**
  - Add a lightweight readiness endpoint; set min/max instances
\`\`\`yaml
services:
  - name: api
    instance_count: 2
    health_check:
      path: /health
\`\`\`
\`\`\`mermaid flowchart TD
  A[Build fails / wrong runtime] --> B[Add Procfile or runtime.txt]
  B --> C{Fixed?}
  C -- Yes --> D[Rebuild with Buildpacks]
  C -- No --> E[Consider Dockerfile as last resort]
  F[Data missing / resets] --> G[Use Managed DB/Spaces; run migrations]
  H[Intermittent 502s] --> I[Add health_check + set min/max instances]
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
      <h1>Common pitfalls and fast fixes</h1>
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
                <pre className="language-mermaid">
                  <code>{String(children).replace(/\n$/, '')}</code>
                </pre>
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