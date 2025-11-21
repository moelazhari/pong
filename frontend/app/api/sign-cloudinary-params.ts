import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paramsToSign } = body;

    // Log to verify env vars are available
    console.log('API Key available:', !!process.env.CLOUDINARY_API_KEY);
    console.log('API Secret available:', !!process.env.CLOUDINARY_API_SECRET);

    if (!process.env.CLOUDINARY_API_SECRET) {
      return Response.json(
        { error: "Cloudinary API secret not configured" },
        { status: 500 }
      );
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return Response.json({ signature });
  } catch (error) {
    console.error('Error signing cloudinary params:', error);
    return Response.json(
      { error: "Failed to sign upload parameters" },
      { status: 500 }
    );
  }
}