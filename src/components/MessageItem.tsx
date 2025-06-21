'use client'

import { FC } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Message } from '@/lib/validations/message';
import Image from 'next/image';
import { format } from 'date-fns';
import { User } from '@/lib/validations/user';

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  hasNextMessageFromSameUser: boolean;
  sessionImg: string | null | undefined;
  chatPartner: User;
}

const MessageItem: FC<MessageItemProps> = ({
  message,
  isCurrentUser,
  hasNextMessageFromSameUser,
  sessionImg,
  chatPartner,
}) => {
  const formatTimestamp = (timestamp: number) => {
    return format(timestamp, 'p'); // 'p' is a shorter format like '12:00 PM'
  };

  // Framer Motion hooks for drag gesture
  const x = useMotionValue(0);

  // Define swipe thresholds
  const swipeThreshold = isCurrentUser ? -60 : 60;

  // Transform the opacity of the timestamp based on the drag distance
  const timestampOpacity = useTransform(
    x,
    [0, swipeThreshold], // from 0 drag to swipeThreshold
    [0, 1]              // opacity from 0 to 1
  );

  const dragConstraints = isCurrentUser
    ? { left: -80, right: 0 } // Can only drag left
    : { left: 0, right: 80 }; // Can only drag right

  const timestampClass = cn('text-xs text-gray-400 select-none', {
    'order-1 mr-3': !isCurrentUser, // Partner's timestamp on the left
    'order-3 ml-3': isCurrentUser,   // Your timestamp on the right
  });

  return (
    <div className="chat-message" key={`${message.id}-${message.timestamp}`}>
      <div
        className={cn('flex items-end', {
          'justify-end': isCurrentUser,
        })}
      >
        <div
          className={cn('flex items-center', {
            'flex-row-reverse': isCurrentUser,
          })}
        >
          {/* Draggable Message Bubble */}
          <motion.div
            drag="x"
            dragConstraints={dragConstraints}
            dragElastic={0.1} // Adds a bit of resistance at the drag limit
            style={{ x }} // Bind the motion value to the div's transform
            className={cn('flex flex-col text-base max-w-xs z-10', {
              'order-2': true, // Always order 2 within its flex container
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
              {message.text}
            </span>
          </motion.div>

          {/* Animated Timestamp */}
          <motion.div style={{ opacity: timestampOpacity }} className={timestampClass}>
            {formatTimestamp(message.timestamp)}
          </motion.div>

          {/* Profile Picture */}
          <div
            className={cn('relative w-6 h-6', {
              'order-1 mr-2': !isCurrentUser, // Partner's avatar
              'order-3 ml-2': isCurrentUser,   // Your avatar
              'invisible': hasNextMessageFromSameUser,
            })}
          >
            <Image
              fill
              src={isCurrentUser ? (sessionImg as string) : chatPartner.image!}
              alt="Profile picture"
              referrerPolicy="no-referrer"
              className="rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
