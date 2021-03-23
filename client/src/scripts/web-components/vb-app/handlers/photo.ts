import { Photo } from '../../../model/photo';
import { Config } from '../../../config';

export class PhotoHandler {
  static async getCategoryPhotos(): Promise<Photo[]> {
    const url = Config.url.server.photo.categoryPhotos;
    let result: Photo[] = null;

    await fetch(url, { method: 'GET' })
      .then((response) => response.json())
      .then((data) => {
        result = data[''] as Photo[];
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    return result;
  }
}
