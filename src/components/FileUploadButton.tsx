import { FC, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

interface FileUploadButtonProps {
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploadButton: FC<FileUploadButtonProps> = ({ onFileChange }) => {
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileChange(event); // Call the parent's onFileChange function
            setSelectedFileName(file.name); // Set the selected file name
        }
    };

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
