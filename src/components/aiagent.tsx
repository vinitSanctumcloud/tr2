'use client';

import React, { useState, useRef } from 'react';
import Head from 'next/head';
import { FaMicrophone } from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5';
import ReactMarkdown from 'react-markdown';

interface Prompt {
  id: number;
  user_id: number;
  whitelabel_client_id: number;
  ai_agent_id: number;
  prompt_text: string;
  is_active: boolean;
}

interface MetaCard {
  metaId?: string;
  url?: string;
  image?: string;
  title?: string;
  description?: string;
  favicon?: string;
  brand?: string;
}

interface Message {
  text: string;
  sender: 'user' | 'assistant' | 'meta';
  image?: string;
  metaCards?: MetaCard[];
  url?: string;
}

interface AiAgent {
  id: number;
  user_id: number;
  whitelabel_client_id: number;
  agent_name: string;
  ai_agent_slug: string;
  avatar_image_url: string | null;
  greeting_media_url: string;
  greeting_media_type: string;
  greeting_title: string;
  welcome_greeting: string;
  training_instructions: string;
  last_trained_at: string;
  prompts: Prompt[];
}

interface AiAgentProps {
  agentDetails: AiAgent | null;
  messages: Message[];
  input: string;
  showWelcome: boolean;
  showPrompts: boolean;
  isChatOpen: boolean;
  thumbnailUrl: string;
  pageTitle: string;
  pageDescription: string;
  chatEndRef: React.RefObject<HTMLDivElement>;
  setInput: (value: string) => void;
  handleSendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  toggleChat: () => void;
  boxStyles: { className: string; style: React.CSSProperties };
  cross: boolean;
}

export function AiAgent({
  agentDetails,
  messages,
  input,
  showWelcome,
  showPrompts,
  isChatOpen,
  thumbnailUrl,
  pageTitle,
  pageDescription,
  chatEndRef,
  setInput,
  handleSendMessage,
  handleKeyPress,
  toggleChat,
  boxStyles,
  cross,
}: AiAgentProps) {
  const [isMuted, setIsMuted] = useState(true);
  const cardContainerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const scrollCards = (direction: 'prev' | 'next', index: number) => {
    const container = cardContainerRefs.current[index];
    if (container) {
      const scrollAmount = direction === 'next' ? 200 : -200;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Define the default robot image URL
  const defaultRobotImage = 'https://via.placeholder.com/1200x630?text=Robot+Image'; // Replace with your actual robot image URL

  // Use thumbnailUrl if available, otherwise fallback to default robot image
  const socialImage ='data:image/jpeg;base64,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'

  return (
    <div className="min-h-screen w-full py-4 relative bg-transparent">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={socialImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`https://linkaai-9lgi.vercel.app/liveagent/${agentDetails?.ai_agent_slug ?? ''}`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={socialImage} />
      </Head>

      {/* Chatbox */}
      <div className={boxStyles.className} style={boxStyles.style}>
        {/* Close Button */}
        {cross && (
          <button
            onClick={toggleChat}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 z-50"
            aria-label="Close chat"
          >
            <IoClose className="h-5 w-5 text-gray-600" />
          </button>
        )}

        {/* Header with Agent Info */}
        {showWelcome && (
          <div className="flex flex-col items-center justify-center flex-shrink-0 py-2 sm:py-4">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-white shadow-md mb-2">
              {agentDetails?.greeting_media_type === 'video' ? (
                <video
                  src={agentDetails?.greeting_media_url ?? ''}
                  loop
                  playsInline
                  autoPlay
                  muted={isMuted}
                  onClick={toggleMute}
                  className="w-full h-full object-cover object-center cursor-pointer"
                />
              ) : (
                <img
                  src={agentDetails?.greeting_media_url ?? 'https://via.placeholder.com/150'}
                  alt={agentDetails?.agent_name ?? 'Agent Avatar'}
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold text-black text-center">
              {agentDetails?.greeting_title ?? 'Agent'}
            </h2>
            <p className="text-base sm:text-lg text-gray-500 text-center">
              {agentDetails?.welcome_greeting ?? ''}
            </p>
          </div>
        )}

        {/* Quick Prompts */}
        {showPrompts && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-4 py-1">
            {agentDetails?.prompts
              ?.filter((prompt) => prompt.is_active)
              .map((prompt) => (
                <button
                  key={prompt.id}
                  className="w-full text-base font-semibold bg-white text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-sm border border-gray-200 hover:border-gray-300"
                  onClick={() => {
                    setInput(prompt.prompt_text);
                    setTimeout(handleSendMessage, 100);
                  }}
                >
                  {prompt.prompt_text}
                </button>
              ))}
          </div>
        )}

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto pl-4 pr-4 pb-4 no-scrollbar bg-white">
          {messages.map((message, index) => (
            <React.Fragment key={index}>
              {(message.sender === 'user' || message.sender === 'assistant') && (
                <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                  {message.sender === 'assistant' && (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden mr-2">
                      <img
                        src={agentDetails?.avatar_image_url ?? 'https://via.placeholder.com/150'}
                        alt="Assistant"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-2xl p-3 shadow-md ${message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                    }`}
                  >
                    <ReactMarkdown
                      components={{
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            className="text-blue-600 underline break-words"
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc ml-[20px]" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal ml-[20px]" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="mb-1" {...props} />
                        ),
                        h1: ({ node, ...props }) => (
                          <h1 className="font-bold text-lg mb-2" {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2 className="font-semibold text-base mb-1" {...props} />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="mb-2 break-words" {...props} />
                        ),
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
              {message.sender === 'meta' && message.metaCards && (
                <div className="w-full py-2 relative">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => scrollCards('prev', index)}
                      className="absolute left-0 z-10 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200"
                      aria-label="Previous card"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div
                      className="flex gap-2 overflow-x-auto px-10 py-2 meta-scrollbar-hide"
                      ref={(el) => {
                        cardContainerRefs.current[index] = el;
                      }}
                    >
                      {message.metaCards.map((meta, idx) => (
                        <a
                          key={meta.metaId ?? idx}
                          href={meta.url ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-w-[140px] max-w-[160px] sm:min-w-[170px] sm:max-w-[190px] bg-white rounded-xl shadow border border-gray-200 flex flex-col items-center p-0 hover:shadow-lg transition-shadow duration-200"
                          style={{ flex: '0 0 auto', textDecoration: 'none' }}
                        >
                          <div className="w-full h-[110px] sm:h-[130px] rounded-t-xl overflow-hidden flex items-center justify-center bg-gray-100">
                            <img
                              src={meta.image ?? 'https://via.placeholder.com/160'}
                              alt={meta.title ?? 'Image'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="px-2 py-2 w-full flex flex-col items-center">
                            <div className="text-xs sm:text-sm font-bold text-gray-900 text-center line-clamp-2">
                              {meta.title ?? 'No Title Available'}
                            </div>
                            <div className="text-xs text-gray-500 font-medium mt-1 text-center line-clamp-3">
                              {meta.description ?? 'No description available.'}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {meta.favicon ? (
                                <img src={meta.favicon} alt={meta.brand ?? 'Brand'} className="w-4 h-4" />
                              ) : (
                                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                              )}
                              <span className="text-xs text-gray-600 font-medium">{meta.brand ?? 'Unknown Brand'}</span>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                    <button
                      onClick={() => scrollCards('next', index)}
                      className="absolute right-0 z-10 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200"
                      aria-label="Next card"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l-7 7 7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white">
          <div className="flex flex-wrap items-center gap-2 border border-gray-200 rounded-md px-3 py-2 bg-white shadow-sm hover:shadow-md transition-all duration-200">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 min-w-0 text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-transparent outline-none focus:outline-none focus:ring-0 focus:placeholder-gray-300 transition-colors duration-150"
            />
            <div className="flex items-center gap-2 shrink-0">
              <button
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 outline-none focus:outline-none focus:ring-0"
                aria-label="Voice input"
              >
                <FaMicrophone className="text-gray-600 h-5 w-5 hover:text-gray-800" />
              </button>
              <button
                onClick={handleSendMessage}
                className="p-2 rounded-full bg-black text-white transition-colors duration-200 outline-none focus:outline-none focus:ring-0"
                aria-label="Send message"
              >
                <FiSend className="h-5 w-5" />
              </button>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center font-medium">
            Type your question or tap the microphone
          </p>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-size: 11px;
          text-align: left;
        }
        .meta-scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .meta-scrollbar-hide::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        .break-words {
          word-break: break-all;
          overflow-wrap: break-word;
        }
      `}</style>
    </div>
  );
}