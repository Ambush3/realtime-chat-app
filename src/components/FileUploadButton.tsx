import { FC, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

interface FileUploadButtonProps {
    onFileUpload: (file: File) => void
    selectedFile: File | null;
    onRemoveFile: () => void;
}

const FileUploadButton: FC<FileUploadButtonProps> = ({ onFileUpload, selectedFile, onRemoveFile }) => {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileUpload(file);
        }
    };

    return (
        <div className="text-center">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white cursor-pointer" htmlFor="file_input">
                Attach Image
            </label>
            <div className="flex items-center justify-center border-2 border-gray-300 border-dashed rounded-lg cursor-pointer">
                <input className="hidden" id="file_input" type="file" accept="image/svg+xml,image/png,image/jpeg,image/gif" onChange={handleFileChange} />
                {selectedFile && (
                    <div className="flex items-center justify-between px-2 py-1.5 bg-gray-100 rounded">
                        <span className="text-xs text-gray-600">{selectedFile.name}</span>
                        <button className="text-xs text-gray-600" onClick={onRemoveFile}>
                            Remove
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
export default FileUploadButton

// import { CldImage } from "next-cloudinary";

// import { useState } from "react";
// import axios from "axios";

// interface UploadFormProps {
//     onFileUpload: (file: File) => void
// }

// const UploadForm = () => {
//     const [file, setFile] = useState(null);
//     const [filename, setFilename] = useState("");

//     const handleFileChange = (event) => {
//         setFile(event.target.files[0]);
//         setFilename(event.target.files[0].name);
//     };

//     const handleSubmit = async (event) => {
//         event.preventDefault();

//         const formData = new FormData();
//         formData.append("file", file);
//         formData.append('upload_preset', 'YOUR_UPLOAD_PRESET_NAME');

//         try {
//             const response = await axios.post(
//                 "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload",
//                 formData
//             );
//             console.log(response);
//         } catch (error) {
//             console.log(error);
//         }
//     }

//     return (
//         <form onSubmit={handleSubmit}>
//             <div className="mb-3">
//                 <input onChange={handleFileChange} />
//                 <label>{filename}</label>
//             </div>
//             <button type="submit">Submit</button>
//         </form>
//     )
// }

// export default UploadForm;