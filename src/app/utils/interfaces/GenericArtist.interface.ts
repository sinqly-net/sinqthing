import { GenericImage } from '@utils/interfaces/GenericImage.interface';

export interface GenericArtist {
  id?: string;
  url: string;
  genres: string[];
  images: GenericImage[];
  name: string;
}
