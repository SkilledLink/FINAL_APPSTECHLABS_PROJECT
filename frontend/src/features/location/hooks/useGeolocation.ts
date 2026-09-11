import { useCallback, useState } from 'react';

export type GeolocationStatus =
  | 'idle'
  | 'prompt'
  | 'granted'
  | 'denied'
  | 'unsupported'
  | 'error';

export interface GeolocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface UseGeolocationResult {
  coords: GeolocationCoords | null;
  status: GeolocationStatus;
  error: string | null;
  loading: boolean;
  request: () => Promise<GeolocationCoords | null>;
  clear: () => void;
}

const isSupported =
  typeof navigator !== 'undefined' && 'geolocation' in navigator;

export function useGeolocation(): UseGeolocationResult {
  const [coords, setCoords] = useState<GeolocationCoords | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>(
    isSupported ? 'idle' : 'unsupported'
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const request = useCallback(async (): Promise<GeolocationCoords | null> => {
    if (!isSupported) {
      setStatus('unsupported');
      setError('Your browser does not support location services.');
      return null;
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const next: GeolocationCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setCoords(next);
          setStatus('granted');
          setLoading(false);
          resolve(next);
        },
        (err) => {
          let message = 'Unable to get your location.';
          let nextStatus: GeolocationStatus = 'error';
          if (err.code === err.PERMISSION_DENIED) {
            message = 'Location permission was denied.';
            nextStatus = 'denied';
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            message = 'Your location is currently unavailable.';
          } else if (err.code === err.TIMEOUT) {
            message = 'Location request timed out.';
          }
          setStatus(nextStatus);
          setError(message);
          setLoading(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, []);

  const clear = useCallback(() => {
    setCoords(null);
    setStatus(isSupported ? 'idle' : 'unsupported');
    setError(null);
  }, []);

  return { coords, status, error, loading, request, clear };
}