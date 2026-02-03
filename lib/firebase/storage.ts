import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { storage } from './config';

/**
 * Upload an image to Firebase Storage and return the download URL
 */
export async function uploadProductImage(file: File): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  try {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storageRef = ref(storage, `products/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading product image:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Upload a benefit logo to Firebase Storage
 */
export async function uploadBenefitLogo(file: File): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  try {
    const timestamp = Date.now();
    const fileName = `benefit_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storageRef = ref(storage, `benefits/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading benefit logo:', error);
    throw new Error('Failed to upload image');
  }
}

export async function uploadTrackFile(file: File): Promise<{ downloadUrl: string; storagePath: string; }>{
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  try {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `track_${timestamp}_${safeName}`;
    const storagePath = `tracks/${fileName}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type || 'application/gpx+xml',
    });
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return { downloadUrl, storagePath };
  } catch (error) {
    console.error('Error uploading track file:', error);
    throw new Error('Failed to upload track');
  }
}

export async function deleteTrackFile(pathOrUrl: string): Promise<void> {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  try {
    let fileRef;
    if (pathOrUrl.startsWith('https://')) {
      const decodedUrl = decodeURIComponent(pathOrUrl);
      const parts = decodedUrl.split('/o/')[1].split('?')[0];
      fileRef = ref(storage, parts);
    } else {
      fileRef = ref(storage, pathOrUrl);
    }

    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting track file:', error);
  }
}

/**
 * Delete an image from Firebase Storage using its download URL or path
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  try {
    // Extract path from download URL or use directly if it's a path
    // Format: https://firebasestorage.googleapis.com/.../o/products%2Ffilename?alt=media
    let imageRef;
    if (imageUrl.startsWith('https://')) {
      const decodedUrl = decodeURIComponent(imageUrl);
      const parts = decodedUrl.split('/o/')[1].split('?')[0];
      imageRef = ref(storage, parts);
    } else {
      imageRef = ref(storage, imageUrl);
    }
    
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting product image:', error);
    // Don't throw if delete fails (e.g. file already gone)
  }
}

/**
 * Upload a payment receipt to Firebase Storage
 */
export async function uploadReceipt(file: File): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  try {
    const timestamp = Date.now();
    const fileName = `receipt_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storageRef = ref(storage, `receipts/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading receipt:', error);
    throw new Error('Failed to upload receipt');
  }
}
