interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
}

export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  // Create a FormData instance to send the file
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'njuwa_capital'); // Replace with your Cloudinary upload preset

  try {
    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    const data = await response.json();
    return {
      secure_url: data.secure_url,
      public_id: data.public_id,
      format: data.format,
      resource_type: data.resource_type,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

export function getFileTypeFromUrl(url: string): string {
  const extension = url.split('.').pop()?.toLowerCase();
  
  if (!extension) return 'unknown';
  
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
    case 'docx':
      return 'application/msword';
    case 'xls':
    case 'xlsx':
      return 'application/vnd.ms-excel';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    default:
      return 'application/octet-stream';
  }
}
