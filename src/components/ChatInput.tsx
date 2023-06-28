'use client'

import axios from 'axios';
import { FC, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import TextareaAutosize from 'react-textarea-autosize';
// import Button from './ui/button';
import FileUploadButton from './FileUploadButton';
import { ChangeEvent } from 'react';
import { Loader2 } from 'lucide-react';

interface ChatInputProps {
    chatPartner: User;
    chatId: string;
}

const ChatInput: FC<ChatInputProps> = ({ chatPartner, chatId }) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [input, setInput] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const sendMessage = async () => {
        if (!input && !selectedFile) return;
        setIsLoading(true);

        try {
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);

                const response = await axios.post('/api/message/send', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                const { secure_url: imageUrl } = response.data;

                // Send the image URL as a message to the other user
                await axios.post('/api/message/send', {
                    text: input,
                    imageUrl, // Include the Cloudinary image URL in the message
                    chatId,
                });
            } else {
                // If no image is attached, send only the text as a message
                await axios.post('/api/message/send', {
                    text: input,
                    chatId,
                });
            }

            setInput('');
            setSelectedFile(null);
            textareaRef.current?.focus();
        } catch {
            toast.error('Something went wrong. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);

            console.log('this is the current file in ChatInput component', file)
        }
    };

    const handleFileUpload = (file: File) => {
        setSelectedFile(file);
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
    };

    return (
        <div className="border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
            <div className="relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-sky-600">
                {/* <FileUploadButton onFileUpload={handleFileUpload} selectedFile={selectedFile} onRemoveFile={handleRemoveFile} /> */}
                <FileUploadButton onFileChange={handleFileChange} />
                <TextareaAutosize
                    ref={textareaRef}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Message ${chatPartner.name}`}
                    className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6"
                />

                <div onClick={() => textareaRef.current?.focus()} className="py-2" aria-hidden="true">
                    <div className="py-px">
                        <div className="h-9" />
                    </div>
                </div>

                <div className="absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
                    <div className="flex-shrink-0">
                        <button
                            onClick={sendMessage}
                            disabled={isLoading}
                            className="cursor-pointer">
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInput;
