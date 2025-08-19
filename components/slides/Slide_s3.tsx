import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Slide() {
  const markdown = `- Why Buildpacks remove DevOps pain
  - Auto-detect language/framework; no Dockerfiles or custom CI scripts
  - Reproducible, cached builds; secure base images and SBOMs
  - Sensible defaults; override with env vars when needed
  - Output: OCI image ready for rolling deploys
- App Platform components you can mix
  - Web Services: HTTP APIs, web apps
  - Static Sites: Built and hosted on a global CDN
  - Workers: Background jobs, schedulers, queue consumers
  - Define multiple components in one app; scale independently
- The App Spec: your single source of truth
  - Declarative YAML for source, routes, env, scaling, health checks
  - Keep it in git for repeatable, auditable deploys (GitOps style)
  - Works for monorepos via source_dir
\`\`\`mermaid
flowchart LR
  A[Git push / Merge] --> B[App Platform]
  B --> C{CNB Detect}
  C -->|Node.js| D[Paketo Node Buildpack]
  C -->|Python| E[Paketo Python Buildpack]
  C -->|Go| F[Paketo Go Buildpack]
  D --> G[OCI Image + Cache + SBOM]
  E --> G
  F --> G
  G --> H[Rolling Deploy]
  H --> I[Web Service]
  H --> J["Static Site (CDN)"]
  H --> K[Worker]
  I --> L[Routing + TLS]
  J --> L
  K --> L
  L --> M[Logs + Metrics + Autoscaling]
\`\`\`
\`\`\`yaml
# Minimal App Spec (API + Worker + Static Site)
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
    instance_count: 2
    routes:
      - path: /
    health_check:
      path: /health
    envs:
      - key: BP_NODE_VERSION   # Pin runtime via Buildpacks
        value: 20.*
        scope: BUILD_TIME
  - name: worker
    source_dir: services/worker
    github:
      repo: myorg/myrepo
      branch: main
      deploy_on_push: true
    instance_size_slug: basic-xs
    instance_count: 1
static_sites:
  - name: web
    source_dir: web
    github:
      repo: myorg/myrepo
      branch: main
      deploy_on_push: true
    build_command: npm ci && npm run build
    output_dir: dist
# TLS, DNS, logs, metrics handled by the platform; add domains/log forwarding as needed
\`\`\`
- Practical tips
  - If detection misses, add runtime hints (e.g., package.json, Procfile, runtime.txt) or set BP_* vars
  - Scope monorepos with source_dir to speed builds
  - Use health checks to protect rolling deploys`;
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
      <h1>Under the hood: Buildpacks, components, and the App Spec</h1>
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