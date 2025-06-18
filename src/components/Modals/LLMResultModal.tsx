import React, { useEffect, useState, useRef } from 'react';
import { X, Loader, Copy, Check, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { createMarkdownLinkRenderer } from '../../utils/markdownLinkRenderer';
import { NodeObject } from '../../types';

interface LLMResultModalProps {
  darkMode: boolean;
  title: string;
  content: string;
  isLoading: boolean;
  onClose: () => void;
  allNodes?: NodeObject[];
  onSelectNode?: (node: NodeObject, sectionSlug?: string) => void;
  onPaperClick?: (citationKey: string) => void;
}

const LLMResultModal: React.FC<LLMResultModalProps> = ({
  darkMode,
  title,
  content,
  isLoading,
  onClose,
  allNodes = [],
  onSelectNode,
  onPaperClick
}) => {
  const [copied, setCopied] = useState(false);
  const [newWindow, setNewWindow] = useState<Window | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
  };

  // Create markdown link renderer for interactive links
  const markdownLinkRenderer = createMarkdownLinkRenderer({
    darkMode,
    allNodes,
    onSelectNode: onSelectNode || (() => {}),
    onPaperClick: onPaperClick || (() => {}),
    currentFileKey: 'llm-result'
  });

  // Open result in new window
  const openInNewWindow = () => {
    // Create a new window
    const win = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    
    if (!win) {
      alert('Pop-up blocked! Please allow pop-ups for this site.');
      return;
    }
    
    // Set the new window content
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.6;
              color: ${darkMode ? '#e2e8f0' : '#1a202c'};
              background-color: ${darkMode ? '#1a202c' : '#f7fafc'};
              padding: 2rem;
              margin: 0;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
            }
            h1 { 
              border-bottom: 1px solid ${darkMode ? '#4a5568' : '#e2e8f0'};
              padding-bottom: 0.5rem;
              font-size: 1.8rem;
            }
            h2 {
              font-size: 1.5rem;
              margin-top: 2rem;
              border-bottom: 1px solid ${darkMode ? '#4a5568' : '#e2e8f0'};
              padding-bottom: 0.3rem;
            }
            h3 { font-size: 1.3rem; margin-top: 1.5rem; }
            h4 { font-size: 1.1rem; margin-top: 1.2rem; }
            p { margin: 1rem 0; }
            ul, ol { padding-left: 2rem; }
            li { margin: 0.5rem 0; }
            code {
              background-color: ${darkMode ? '#2d3748' : '#edf2f7'};
              padding: 0.2rem 0.4rem;
              border-radius: 0.2rem;
              font-family: 'Courier New', Courier, monospace;
            }
            pre {
              background-color: ${darkMode ? '#2d3748' : '#edf2f7'};
              padding: 1rem;
              border-radius: 0.3rem;
              overflow-x: auto;
            }
            pre code {
              background-color: transparent;
              padding: 0;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 1rem 0;
            }
            th, td {
              border: 1px solid ${darkMode ? '#4a5568' : '#e2e8f0'};
              padding: 0.5rem;
              text-align: left;
            }
            th {
              background-color: ${darkMode ? '#2d3748' : '#edf2f7'};
            }
            blockquote {
              border-left: 4px solid ${darkMode ? '#4a5568' : '#e2e8f0'};
              padding-left: 1rem;
              margin-left: 0;
              color: ${darkMode ? '#a0aec0' : '#718096'};
            }
            a {
              color: ${darkMode ? '#90cdf4' : '#3182ce'};
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
            img {
              max-width: 100%;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 2rem;
            }
            .header button {
              background-color: ${darkMode ? '#2d3748' : '#edf2f7'};
              border: none;
              padding: 0.5rem 1rem;
              border-radius: 0.3rem;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 0.5rem;
              color: ${darkMode ? '#e2e8f0' : '#1a202c'};
            }
            .header button:hover {
              background-color: ${darkMode ? '#4a5568' : '#e2e8f0'};
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${title}</h1>
              <button onclick="window.print()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                Print
              </button>
            </div>
            <div id="content">
              ${isLoading ? 
                `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px;">
                  <div style="border: 4px solid #e2e8f0; border-top: 4px solid #3182ce; border-radius: 50%; width: 50px; height: 50px; animation: spin 2s linear infinite;"></div>
                  <p style="margin-top: 1rem;">Loading content...</p>
                </div>
                <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>` 
                : 
                `<div class="markdown-content">${content}</div>`
              }
            </div>
          </div>
          <script>
            // Function to convert markdown to HTML
            function renderMarkdown() {
              const contentElement = document.querySelector('.markdown-content');
              if (!contentElement) return;
              
              // Simple markdown parsing for headings, lists, code blocks, etc.
              let markdown = contentElement.innerHTML;
              
              // Convert headings
              markdown = markdown.replace(/^# (.*$)/gm, '<h1>$1</h1>');
              markdown = markdown.replace(/^## (.*$)/gm, '<h2>$1</h2>');
              markdown = markdown.replace(/^### (.*$)/gm, '<h3>$1</h3>');
              markdown = markdown.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
              
              // Convert bold and italic
              markdown = markdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
              markdown = markdown.replace(/\*(.*?)\*/g, '<em>$1</em>');
              
              // Convert lists
              markdown = markdown.replace(/^\s*- (.*$)/gm, '<li>$1</li>');
              markdown = markdown.replace(/^\s*\d+\. (.*$)/gm, '<li>$1</li>');
              
              // Wrap lists
              markdown = markdown.replace(/<li>.*?<\/li>(?:\s*<li>.*?<\/li>)+/gs, match => {
                if (match.includes('1. ') || match.includes('2. ')) {
                  return '<ol>' + match + '</ol>';
                } else {
                  return '<ul>' + match + '</ul>';
                }
              });
              
              // Convert code blocks
              markdown = markdown.replace(/\`\`\`([\s\S]*?)\`\`\`/g, '<pre><code>$1</code></pre>');
              
              // Convert inline code
              markdown = markdown.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
              
              // Convert paragraphs (must come after other conversions)
              markdown = markdown.replace(/^(?!<[a-z])(.*$)/gm, '<p>$1</p>');
              
              // Fix empty paragraphs
              markdown = markdown.replace(/<p><\/p>/g, '<br>');
              
              // Set the HTML content
              contentElement.innerHTML = markdown;
            }
            
            // Run the markdown renderer
            document.addEventListener('DOMContentLoaded', renderMarkdown);
            
            // Also run it now in case the DOM is already loaded
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
              setTimeout(renderMarkdown, 1);
            }
          </script>
        </body>
      </html>
    `);
    
    win.document.close();
    setNewWindow(win);
  };

  // Effect to update new window content when it changes
  useEffect(() => {
    if (newWindow && !isLoading) {
      const contentElement = newWindow.document.getElementById('content');
      if (contentElement) {
        contentElement.innerHTML = `<div class="markdown-content">${content}</div>`;
        // Execute the markdown rendering function
        newWindow.renderMarkdown();
      }
    }
  }, [newWindow, content, isLoading]);

  // Close new window when modal is closed
  useEffect(() => {
    return () => {
      if (newWindow) {
        newWindow.close();
      }
    };
  }, [newWindow]);

  // Open in new window automatically when modal is shown
  useEffect(() => {
    openInNewWindow();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`w-full max-w-4xl h-5/6 flex flex-col rounded-xl shadow-2xl ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`p-4 flex justify-between items-center border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className="text-xl font-bold">{title}</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className={`p-2 rounded-full ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              title="Copy content"
              disabled={isLoading}
            >
              {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
            </button>
            <button
              onClick={openInNewWindow}
              className={`p-2 rounded-full ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              title="Open in new window"
              disabled={isLoading}
            >
              <ExternalLink size={20} />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div 
          ref={contentRef}
          className={`flex-grow p-6 overflow-y-auto ${
            darkMode ? 'bg-gray-900' : 'bg-gray-50'
          }`}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader className="w-12 h-12 animate-spin text-blue-500 mb-4" />
              <p className="text-lg">Generating response...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
            </div>
          ) : (
            <div className={`prose max-w-none ${darkMode ? 'prose-invert' : ''} 
                            prose-headings:font-bold prose-headings:border-b prose-headings:pb-1 
                            prose-headings:border-gray-200 dark:prose-headings:border-gray-700
                            prose-a:text-blue-600 dark:prose-a:text-blue-400
                            prose-code:bg-gray-100 dark:prose-code:bg-gray-800
                            prose-code:text-red-500 dark:prose-code:text-red-400
                            prose-code:p-1 prose-code:rounded`}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                rehypePlugins={[rehypeRaw]}
                components={{
                  a: markdownLinkRenderer,
                  // Add custom renderers for other elements if needed
                  table: ({node, ...props}) => (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700" {...props} />
                    </div>
                  ),
                  th: ({node, ...props}) => (
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider bg-gray-100 dark:bg-gray-800" {...props} />
                  ),
                  td: ({node, ...props}) => (
                    <td className="px-3 py-2 whitespace-nowrap text-sm" {...props} />
                  )
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LLMResultModal;