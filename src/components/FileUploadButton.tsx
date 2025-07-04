import React, { FC, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

interface FileUploadButtonProps {
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    selectedFile: File | null;
}

const FileUploadButton: FC<FileUploadButtonProps> = ({ onFileChange, onClear, selectedFile }) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileChange(event);
        }
    };

    const removeFile = () => {
        onClear();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div>
            <label htmlFor="file-upload" className="text-blue-500 cursor-pointer flex items-center">
                <FontAwesomeIcon icon={faPlus} className="ml-1 mt-1" style={{ fontSize: '24px', height: '1em', width: '1em' }} />
            </label>
            <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
            />
            {selectedFile && <div>Selected File: {selectedFile.name}</div>}
            {selectedFile && (
                <button className="text-red-500 hover:text-red-600 cursor-pointer" onClick={removeFile}>
                    Remove
                </button>
            )}
        </div>
    );
};

export default FileUploadButton;
