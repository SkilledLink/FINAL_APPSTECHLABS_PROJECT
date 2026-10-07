// src/features/ai/components/AIMessage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, User, ArrowRight } from 'lucide-react';
import type { ChatMessage, ActionCard } from '../types/ai.types';
import { AIRecommendationCard } from './AIRecommendationCard';
import { AIActionCard } from './AIActionCard';

interface AIMessageProps {
  message: ChatMessage;
  onActionClick: (card: ActionCard) => void;
  /** Fired before any internal navigation. Widget uses this to close. */
  onNavigate?: () => void;
}

function normalizeInternalHref(href: string): string {
  if (!href) return href;
  if (href.startsWith('/profile/')) {
    return `/home/profile/${href.slice('/profile/'.length)}`;
  }
  if (href === '/discovery' || href.startsWith('/discovery?')) {
    return `/home/discover${href.slice('/discovery'.length)}`;
  }
  return href;
}

function isInternalHref(href: string): boolean {
  return href.startsWith('/');
}

/**
 * Renders the assistant's text with **bold** and [links](url) support.
 * The `onInternalLink` callback fires for any internal link click so
 * the parent can close the widget before navigation.
 */
function renderContent(
  content: string,
  onInternalLink?: () => void,
) {
  const lines = content.split('\n');

  return lines.map((line, i) => {
    if (line.trim() === '') return <div key={i} className="h-2" />;

    const parts: React.ReactNode[] = [];
    let remaining = line;
    let key = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

      if (
        boldMatch &&
        (!linkMatch || (boldMatch.index ?? 0) < (linkMatch.index ?? 0))
      ) {
        const matchIndex = boldMatch.index ?? 0;
        if (matchIndex > 0) {
          parts.push(
            <span key={`t-${key++}`}>{remaining.slice(0, matchIndex)}</span>,
          );
        }
        parts.push(
          <strong
            key={`b-${key++}`}
            className="font-semibold text-slate-900 dark:text-slate-50"
          >
            {boldMatch[1]}
          </strong>,
        );
        remaining = remaining.slice(matchIndex + boldMatch[0].length);
      } else if (linkMatch) {
        const matchIndex = linkMatch.index ?? 0;
        if (matchIndex > 0) {
          parts.push(
            <span key={`t-${key++}`}>{remaining.slice(0, matchIndex)}</span>,
          );
        }
        const rawHref = linkMatch[2];

        if (isInternalHref(rawHref)) {
          const to = normalizeInternalHref(rawHref);
          parts.push(
            <InternalLink key={`l-${key++}`} to={to} onClick={onInternalLink}>
              {linkMatch[1]}
            </InternalLink>,
          );
        } else {
          parts.push(
            <a
              key={`l-${key++}`}
              href={rawHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 hover:underline underline-offset-2"
            >
              {linkMatch[1]}
            </a>,
          );
        }

        remaining = remaining.slice(matchIndex + linkMatch[0].length);
      } else {
        parts.push(<span key={`t-${key++}`}>{remaining}</span>);
        remaining = '';
      }
    }

    return (
      <p key={i} className="leading-relaxed">
        {parts}
      </p>
    );
  });
}

/** Internal link that closes the widget before navigating. */
function InternalLink({
  to,
  onClick,
  children,
}: {
  to: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick?.();
    navigate(to);
  };

  return (
    <a
      href={to}
      onClick={handle}
      className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 hover:underline underline-offset-2"
    >
      {children}
    </a>
  );
}

export function AIMessage({
  message,
  onActionClick,
  onNavigate,
}: AIMessageProps) {
  const isUser = message.sender === 'user';
  const hasCards =
    !isUser && message.recommendations && message.recommendations.length > 0;
  const hasRedirect = !isUser && !!message.redirectUrl;

  return (
    <div
      className={`flex gap-3 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      } w-full animate-in fade-in slide-in-from-bottom-1 duration-300`}
    >
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 shadow-slate-500/20'
            : 'bg-gradient-to-br from-blue-600 to-cyan-500 shadow-blue-500/30'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      <div className={`flex-1 min-w-0 ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div
          className={`inline-block max-w-[85%] sm:max-w-[78%] px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-md shadow-lg shadow-blue-500/25'
              : 'bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl rounded-tl-md text-slate-700 dark:text-slate-200 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.15)]'
          }`}
        >
          <div className={isUser ? '' : 'space-y-1'}>
            {renderContent(message.content, onNavigate)}
          </div>
        </div>

        {hasCards && (
          <div className="mt-3 grid gap-3 grid-cols-1 sm:grid-cols-2 w-full">
            {message.recommendations!.map((rec) => (
              <AIRecommendationCard
                key={rec.id}
                rec={rec}
                onClick={onNavigate}
              />
            ))}
          </div>
        )}

        {hasRedirect && (
          <SeeAllResultsLink
            to={normalizeInternalHref(message.redirectUrl!)}
            onNavigate={onNavigate}
          />
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

function SeeAllResultsLink({
  to,
  onNavigate,
}: {
  to: string;
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigate?.();
    navigate(to);
  };

  return (
    <a
      href={to}
      onClick={handle}
      className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] no-underline"
    >
      See all results
      <ArrowRight className="w-4 h-4" />
    </a>
  );
}