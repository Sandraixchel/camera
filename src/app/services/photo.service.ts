import { Injectable } from '@angular/core';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  public photos: UserPhoto[] = []; //create an Array to store user photos
  private PHOTO_STORAGE = 'photos';
  private platform: Platform;
  constructor(platform: Platform) {
    this.platform = platform;
  }

  private async convertBase64(photo: Photo) {
    if (photo.webPath) {
      const res = await fetch(photo.webPath);
      const blob = await res.blob();

      return (await this.convertBlobTo64(blob)) as string;
    }
    return null;
  }
  private convertBlobTo64(blob: Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  }
  private async saveToDevice(photo: Photo) {
    const base64data = await this.convertBase64(photo);
    if (base64data) {
      const filename = `Picture taken at ${new Date().getTime()}.jpeg`;
      const savedFile = await Filesystem.writeFile({
        path: filename,
        data: base64data,
        directory: Directory.Data,
      });
      console.log(filename);
      console.log(savedFile);

      return {
        filepath: filename,
        webviewPath: photo.webPath,
        isFavourite: false, // create a boolean variable to set all poctures as NOT favourites until the user changes it
      };
    }
  }

  async takePhoto() {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });
    // this.photos.unshift({
    //   filepath: 'tbd',
    //   webviewPath: photo.webPath,
    //   isFavourite: false, // create a boolean variable to set all poctures as NOT favourites until the user changes it
    // });
    console.log(this.photos.length);
    const savedImage = (await this.saveToDevice(photo)) as UserPhoto;
    this.photos.unshift(savedImage);
    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });
  }

  public async loadSaved() {
    // Retrieve cached photo array data
    const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.photos = (value ? JSON.parse(value) : []) as UserPhoto[];
    // Display the photo by reading into base64 format
    for (let photo of this.photos) {
      // Read each saved photo's data from the Filesystem
      const readFile = await Filesystem.readFile({
        path: photo.filepath,
        directory: Directory.Data,
      });

      // Web platform only: Load the photo as base64 data
      photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
    }
  }

  // Funtion to change the property "isFavorite" to true
  public async addtoFavourites(photo: UserPhoto) {
    photo.isFavourite = true;
    console.log('Photo added to your favourites' + photo);
    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });
  }
  // Funtion to change the property "isFavorite" to false from true
  public async removeFavourites(photo: UserPhoto) {
    photo.isFavourite = false;
    console.log('Photo removed from your favourites' + photo);
    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });
  }

  //Function to save description data
  public async saveDescription() {
    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });
  }

  // Filtering through the photos array to see whoich ones have isFavourite=true
  get favourites() {
    return this.photos.filter((photo) => photo.isFavourite);
  }
}

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
  isFavourite: boolean;
  description?: string;
}
