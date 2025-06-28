import { Device } from '@spotify/web-api-ts-sdk';
import { GenericDevice } from '@utils/interfaces/GenericDevice.interface';

export function mapSpotifyDevice(device: Device): GenericDevice {
  return {
    id: device.id ?? undefined,
    name: device.name ?? undefined,
    type: device.type ?? undefined,
    volumePercent: device.volume_percent ?? undefined,
  };
}
