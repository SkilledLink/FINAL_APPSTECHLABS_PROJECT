// components/AIMessage.tsx
import React from 'react';
import { Bot, User, ArrowRight } from 'lucide-react';
import type { ChatMessage, ActionCard } from '../types/ai.types';
import { AIRecommendationCard } from './AIRecommendationCard';
import { AIActionCard } from './AIActionCard';

interface AIMessageProps {
  message: ChatMessage;
  onActionClick: (card: ActionCard) => void;
}

function renderContent(content: string) {
  const lines = content.split('\n');
  return lines.map((line, i) => {
    if (line.trim() === '') return <div key={i} className="h-2" />;

    const parts: React.ReactNode[] = [];
    let remaining = line;
    let key = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

      if (boldMatch && (!linkMatch || (boldMatch.index ?? 0) < (linkMatch.index ?? 0))) {
        const matchIndex = boldMatch.index ?? 0;
        if (matchIndex > 0) parts.push(<span key={`t-${key}`}>{remaining.slice(0, matchIndex)}</span>);
        parts.push(<strong key={`b-${key++}`} className="font-semibold text-slate-900">{boldMatch[1]}</strong>);
        remaining = remaining.slice(matchIndex + boldMatch[0].length);
      } else if (linkMatch) {
        const matchIndex = linkMatch.index ?? 0;
        if (matchIndex > 0) parts.push(<span key={`t-${key}`}>{remaining.slice(0, matchIndex)}</span>);
        const href = linkMatch[2];
        const isInternal = href.startsWith('/profile/') || href.startsWith('/');
        if (isInternal) {
          parts.push(
            <a
              key={`l-${key++}`}
              href={`#${href}`}
              className="text-teal-600 font-medium hover:text-teal-700 hover:underline"
            >
              {linkMatch[1]}
            </a>,
          );
        } else {
          parts.push(
            <a key={`l-${key++}`} href={href} className="text-teal-600 font-medium hover:underline">
              {linkMatch[1]}
            </a>,
          );
        }
        remaining = remaining.slice(matchIndex + linkMatch[0].length);
      } else {
        parts.push(<span key={`t-${key}`}>{remaining}</span>);
        remaining = '';
      }
    }

    return <p key={i} className="leading-relaxed">{parts}</p>;
  });
}

export function AIMessage({ message, onActionClick }: AIMessageProps) {
  const isUser = message.sender === 'user';
  const hasCards =
    !isUser &&
    message.recommendations &&
    message.recommendations.length > 0;
  const hasRedirect = !isUser && !!message.redirectUrl;

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} w-full`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-teal-600' : 'bg-gradient-to-br from-teal-500 to-cyan-600'
        }`}
      >
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div className={`flex-1 min-w-0 ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div
          className={`inline-block max-w-[85%] sm:max-w-[75%] ${
            isUser
              ? 'bg-teal-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5'
              : 'bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 text-slate-700 shadow-sm'
          }`}
        >
          <div className={`text-sm ${isUser ? '' : 'space-y-1'}`}>
            {renderContent(message.content)}
          </div>
        </div>

        {hasCards && (
          <div className="mt-3 grid gap-3 grid-cols-1 sm:grid-cols-2 w-full">
            {message.recommendations!.map((rec) => (
              <AIRecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>
        )}

        {hasRedirect && (
          <a
            href={`#${message.redirectUrl}`}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            See all results
            <ArrowRight className="w-4 h-4" />
          </a>
        )}

        {message.actionCards && message.actionCards.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.actionCards.map((card, idx) => (
              <AIActionCard key={idx} card={card} onClick={onActionClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}