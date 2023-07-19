import React from 'react';
import { Message } from '@/lib/validations/message'; // Make sure to import the correct Message type

interface EmojiReactionModalProps {
    message: Message;
    closeModal: () => void;
}

const EmojiReactionModal: React.FC<EmojiReactionModalProps> = ({ message, closeModal }) => {
    return <div>Hello Modal</div>;
}

export default EmojiReactionModal;
