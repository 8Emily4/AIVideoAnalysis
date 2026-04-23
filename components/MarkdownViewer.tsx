import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownViewerProps {
  content: string;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  return (
    <div className="prose prose-invert prose-violet max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="text-2xl font-bold text-violet-400 border-b border-slate-800 pb-2 mb-6"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-xl font-bold text-purple-400 mt-8 mb-4"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-lg font-semibold text-pink-400 mt-6 mb-3"
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className="text-base font-semibold text-slate-200 mt-4 mb-2"
              {...props}
            />
          ),
          strong: ({ node, ...props }) => (
            <strong className="text-violet-400 font-bold" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc list-outside ml-5 space-y-1 text-slate-400"
              {...props}
            />
          ),
          li: ({ node, ...props }) => <li className="pl-1" {...props} />,
          hr: ({ node, ...props }) => (
            <hr className="border-slate-800 my-8" {...props} />
          ),
          code: ({ node, className, children, ...props }) => {
            return (
              <code
                className="bg-slate-800 text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-700"
                {...props}
              >
                {children}
              </code>
            );
          },
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-slate-700 pl-4 italic text-slate-500 my-4 bg-slate-800/30 py-2 pr-2 rounded-r"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;