import { FC, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

interface FileUploadButtonProps {
    onFileUpload: (file: File) => void
}

const FileUploadButton: FC<FileUploadButtonProps> = ({ onFileUpload }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        setSelectedFile(file || null)
        if (file) {
            onFileUpload(file)
        }
    }

    return (
        <div className="text-center">
            <label
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                htmlFor="file_input"
            >
            </label>
            <div className="flex items-center justify-center border-2 border-gray-300 border-dashed rounded-lg cursor-pointer">
                {selectedFile ? (
                    <p className="text-sm text-gray-900">
                        {selectedFile.name}
                    </p>
                ) : (
                    <>
                        <label htmlFor="file_input">
                            <FontAwesomeIcon
                                icon={faPlus}
                                className="text-gray-400 text-4xl cursor-pointer"
                            />
                        </label>
                    </>
                )}
                <input
                    className="hidden"
                    id="file_input"
                    type="file"
                    accept="image/svg+xml,image/png,image/jpeg,image/gif"
                    onChange={handleFileChange}
                />
            </div>
            
        </div>
    )
}

export default FileUploadButton
