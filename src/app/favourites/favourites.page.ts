import { Component, OnInit } from '@angular/core';
import { PhotoService } from '../services/photo.service';

@Component({
  selector: 'app-favourites',
  templateUrl: './favourites.page.html',
  styleUrls: ['./favourites.page.scss'],
})
export class FavouritesPage implements OnInit {
  constructor(public photoService: PhotoService) {}

  async ngOnInit() {
    // await this.photoService.loadSaved();
  }
}
