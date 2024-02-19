import { NextApiRequest, NextApiResponse } from 'next';
import Cloudinary from 'cloudinary';

// Configure Cloudinary
Cloudinary.v2.config({
    CLOUDINARY_URL: process.env.CLOUDINARY_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { file } = req.body;
        const { secure_url } = await Cloudinary.v2.uploader.upload(file.path);

        res.status(200).json({ url: secure_url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong during image upload' });
    }
}
