'use client'
import { FC, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import TextareaAutosize from 'react-textarea-autosize';
import FileUploadButton from './FileUploadButton';
import axios from 'axios';
import Button from './ui/button';
import { Loader2 } from 'lucide-react';
import { ChangeEvent } from 'react';

interface ChatInputProps {
    chatPartner: User;
    chatId: string;
}

const ChatInput: FC<ChatInputProps> = ({ chatPartner, chatId }) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [input, setInput] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleClear = () => {
        setSelectedFile(null);
    };

    const sendMessage = async () => {
        if (!input && !selectedFile) return;
        setIsLoading(true);

        try {
            let imageUrl = '';

            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('upload_preset', 'realtimechat');

                const response = await axios.post(
                    // 'https://api.cloudinary.com/v1_1/dadihdkuh/image/upload',
                    'https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload',
                    formData
                );

                imageUrl = response.data.secure_url;
            }

            if (input || imageUrl) {
                await axios.post('/api/message/send', {
                    text: input,
                    imageUrl,
                    chatId,
                });
            }

            setInput('');
            setSelectedFile(null);
            textareaRef.current?.focus();
        } catch (error) {
            toast.error('Something went wrong. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    return (
        <div className="border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
            <div className="relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-sky-600">
                <FileUploadButton onFileChange={handleFileChange} onClear={handleClear} selectedFile={selectedFile} />
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
                        <Button onClick={sendMessage} disabled={isLoading} className="cursor-pointer">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Send
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInput;