import multer from 'multer';
import Cloudinary from 'cloudinary';

console.log('we are in the route file')

// Configure Cloudinary
Cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

console.log(process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_SECRET,)


// API endpoint for image upload
export default async function handler(req: any, res: any) {
    try {
        const { file } = req.files;
        const { secure_url } = await Cloudinary.v2.uploader.upload(file.path);

        res.status(200).json({ url: secure_url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong in the route' });
    }
}



