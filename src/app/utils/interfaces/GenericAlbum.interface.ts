import { GenericArtist } from '@utils/interfaces/GenericArtist.interface';
import { GenericImage } from '@utils/interfaces/GenericImage.interface';

export interface GenericAlbum {
  id: string;
  name: string;
  uri: string;
  release_date: Date;
  images: GenericImage[];
  artists: GenericArtist[];
}
