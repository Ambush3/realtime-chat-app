import { FC, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

interface FileUploadButtonProps {
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    clearSelectedFile: boolean; // Add the clearSelectedFile prop
}

const FileUploadButton: FC<FileUploadButtonProps> = ({
    onFileChange,
    onClear,
    clearSelectedFile,
}) => {
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileChange(event);
            setSelectedFileName(file.name);
        }
    };

    useEffect(() => {
        if (clearSelectedFile) {
            setSelectedFileName(null);
            onClear();
        }
    }, [clearSelectedFile, onClear]);

    return (
        <div>
            <label htmlFor="file-upload" className="text-blue-500 cursor-pointer">
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add File
            </label>
            <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange} // Use the handleFileChange function
            />
            {selectedFileName && <div>Selected File: {selectedFileName}</div>}
        </div>
    );
};

export default FileUploadButton;
