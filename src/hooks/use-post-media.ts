import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

export function usePostMedia() {
  const [media, setMedia] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [isPicking, setIsPicking] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  async function handlePickMedia() {
    setIsPicking(true);
    setMediaError(null);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setMediaError('Allow photo and video access to upload media.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 1,
      });
      if (result.canceled) return;

      const selected = result.assets.filter((asset) => {
        const size = asset.fileSize ?? asset.file?.size ?? new File(asset.uri).size;
        if (size > 8 * 1024 * 1024) {
          setMediaError('Each image or video must be 8 MB or smaller.');
          return false;
        }
        return true;
      });
      setMedia((current) => [...current, ...selected.filter((asset) => (
        !current.some((item) => item.uri === asset.uri)
      ))]);
    } catch (caughtError) {
      setMediaError(caughtError instanceof Error ? caughtError.message : 'Could not select media.');
    } finally {
      setIsPicking(false);
    }
  }

  return { media, setMedia, isPicking, mediaError, handlePickMedia };
}
