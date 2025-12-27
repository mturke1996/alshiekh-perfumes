/**
 * imgBB Image Upload Utility
 * API Key: c88aa2a07e646156560d10904fee5864
 */

const IMGBB_API_KEY = 'c88aa2a07e646156560d10904fee5864';
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

export interface ImgBBResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: number;
    height: number;
    size: number;
    time: number;
    expiration: number;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

/**
 * Upload image to imgBB
 */
export async function uploadImageToImgBB(file: File): Promise<string> {
  try {
    // Convert file to base64
    const base64 = await fileToBase64(file);
    
    // Create form data - imgBB expects 'image' as base64 string
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', base64);

    // Upload to imgBB
    const response = await fetch(IMGBB_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('imgBB API Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to upload image to imgBB');
    }

    return result.data.url;
  } catch (error: any) {
    console.error('Error uploading to imgBB:', error);
    throw new Error(error.message || 'فشل رفع الصورة إلى imgBB. يرجى المحاولة مرة أخرى.');
  }
}

/**
 * Convert File to Base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:image/...;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Upload multiple images to imgBB
 */
export async function uploadMultipleImagesToImgBB(files: File[]): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => uploadImageToImgBB(file));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
}

