import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownDisplayProps {
  markdown: string | null;
}

const MarkdownDisplay: React.FC<MarkdownDisplayProps> = ({ markdown }) => {
  return (
      <div className='markdown-container'>
          {markdown ? <ReactMarkdown>{markdown}</ReactMarkdown> : <p>Loading or no data.</p>}
      </div>
  );
};

export default MarkdownDisplay;
