import Cloudinary from 'cloudinary';

// Configure Cloudinary
Cloudinary.v2.config({
    CLOUDINARY_URL: process.env.CLOUDINARY_URL,
});

// API endpoint for image upload
export default async function handler(req: any, res: any) {
    try {
        const { file } = req.files;
        const { secure_url } = await Cloudinary.v2.uploader.upload(file.path);

        res.status(200).json({ url: secure_url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong during image upload' });
    }
}



