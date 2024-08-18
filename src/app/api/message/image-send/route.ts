import Cloudinary from 'cloudinary';

// Configure Cloudinary
Cloudinary.v2.config({
    CLOUDINARY_URL: process.env.CLOUDINARY_URL,
});

// API endpoint for image upload
export async function POST(req: Request) {
    const { file } = req.body as unknown as { file: File };

    if (!file) {
        return new Response('No file found', { status: 400 });
    }

    const { createReadStream } = file as unknown as { createReadStream: () => any };
    const stream = createReadStream();

    const uploadResponse = await Cloudinary.v2.uploader.upload(stream, {
        upload_preset: 'chat-app',
    });

    return new Response(JSON.stringify(uploadResponse), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}



