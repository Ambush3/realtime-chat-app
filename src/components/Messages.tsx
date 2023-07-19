'use client'
import React, { FC, useEffect, useRef, useState } from 'react';
import { pusherClient } from '@/lib/pusher';
import { cn, toPusherKey } from '@/lib/utils';
import { Message } from '@/lib/validations/message';
import { format } from 'date-fns';
import Image from 'next/image';
import EmojiReactionModal from './EmojiReactionModal';

interface MessagesProps {
  initialMessages: Message[];
  sessionId: string;
  chatId: string;
  sessionImg: string | null | undefined;
  chatPartner: User;
}

const Messages: FC<MessagesProps> = ({
  initialMessages,
  sessionId,
  chatId,
  chatPartner,
  sessionImg,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [showModal, setShowModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null);
  const [longPressMessage, setLongPressMessage] = useState<Message | null>(null);

  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleMouseDown = (message: Message, _event: React.MouseEvent<HTMLDivElement>) => {
    // Clear any existing timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
    }

    // Start the long press timer
    const timer = setTimeout(() => {
      setLongPressMessage(message);
      setShowModal(true);
      console.log('set timer')
      const rect = messageRefs.current[message.id]?.getBoundingClientRect();
      if (rect) {
        setModalPosition({ top: rect.top, left: rect.left + rect.width + 10 });
      }
    }, 1000);

    setLongPressTimer(timer as unknown as number);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
      console.log('clear timer')
    }
  };

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`chat:${chatId}`));

    const messageHandler = (message: Message) => {
      setMessages((prev) => [message, ...prev]);
    };

    pusherClient.bind('incoming-message', messageHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));
      pusherClient.unbind('incoming-message', messageHandler);
    };
  }, [chatId]);

  const scrollDownRef = useRef<HTMLDivElement | null>(null);

  const formatTimestamp = (timestamp: number) => {
    return format(timestamp, 'hh:mm');
  };

  return (
    <div
      id='messages'
      className='flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch'
    >
      <div ref={scrollDownRef} />

      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === sessionId;

        const hasNextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId;

        return (
          <div
            className='chat-message'
            key={`${message.id}-${message.timestamp}`}
            ref={(ref) => (messageRefs.current[`${message.id}-${message.timestamp}`] = ref)}
            onMouseDown={(event) => handleMouseDown(message, event)}
            onMouseUp={handleMouseUp}
          >
            <div
              className={cn('flex items-end', {
                'justify-end': isCurrentUser,
              })}
            >
              <div
                className={cn('flex flex-col space-y-2 text-base max-w-xs mx-2', {
                  'order-1 items-end': isCurrentUser,
                  'order-2 items-start': !isCurrentUser,
                })}
              >
                <span
                  className={cn('px-4 py-2 rounded-lg inline-block', {
                    'bg-sky-600 text-white': isCurrentUser,
                    'bg-gray-200 text-gray-900': !isCurrentUser,
                    'rounded-br-none': !hasNextMessageFromSameUser && isCurrentUser,
                    'rounded-bl-none': !hasNextMessageFromSameUser && !isCurrentUser,
                  })}
                >
                  {message.imageUrl && (
                    <Image src={message.imageUrl} alt='Image' width={100} height={100} />
                  )}
                  {message.text}
                  <span className='ml-2 text-xs text-gray-400'>
                    {formatTimestamp(message.timestamp)}
                  </span>
                </span>
              </div>

              <div
                className={cn('relative w-6 h-6', {
                  'order-2': isCurrentUser,
                  'order-1': !isCurrentUser,
                  invisible: hasNextMessageFromSameUser,
                })}
              >
                <Image
                  fill
                  src={isCurrentUser ? (sessionImg as string) : chatPartner.image}
                  alt='Profile picture'
                  referrerPolicy='no-referrer'
                  className='rounded-full'
                />
              </div>
            </div>
          </div>
        );
      })}
      {showModal && longPressMessage && (
        <EmojiReactionModal
          message={longPressMessage}
          closeModal={() => {
            setShowModal(false);
            setLongPressMessage(null);
          }}
          position={modalPosition}
        />
      )}
    </div>
  );
};

export default Messages;
