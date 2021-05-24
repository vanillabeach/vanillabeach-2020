import { Photo } from '../../../model/photo';
import { Config } from '../../../config';

export class PhotoHandler {
  static async getPhoto(id: string): Promise<Photo> {
    const photoPath = Config.url.server.photo.entry;
    const url = `${photoPath}?id=${id}`;
    let result: Photo = null;

    await fetch(url, { method: 'GET' })
      .then((response) => response.json())
      .then((data) => {
        result = data as Photo;
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    return result;
  }

  static async getPhotos(category = ''): Promise<Photo[]> {
    const categoriesPath = Config.url.server.photo.categories;
    const photosPath = Config.url.server.photo.photosForCategory;
    const url =
      category === '' ? categoriesPath : `${photosPath}?category=${category}`;
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
