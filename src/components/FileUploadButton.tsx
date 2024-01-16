import React, { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

interface FileUploadButtonProps {
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    selectedFile: File | null;
}

const FileUploadButton: FC<FileUploadButtonProps> = ({ onFileChange, onClear, selectedFile }) => {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileChange(event);
        }
    };

    const removeFile = () => {
        onClear();
    };

    return (
        <div>
            <label htmlFor="file-upload" className="text-blue-500 cursor-pointer">
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add File
            </label>
            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
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