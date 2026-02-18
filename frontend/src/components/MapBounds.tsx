import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';

interface MapBoundsProps {
  routeCoordinates: LatLngExpression[];
  farmerPosition: LatLngExpression;
  bestMandiPosition: LatLngExpression;
}

const MapBounds: React.FC<MapBoundsProps> = ({ 
  routeCoordinates, 
  farmerPosition, 
  bestMandiPosition 
}) => {
  const map = useMap();

  useEffect(() => {
    if (routeCoordinates.length > 0) {
      // Create bounds from route coordinates
      const bounds = L.latLngBounds(routeCoordinates);
      
      // Add some padding
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      // Fallback to farmer and best mandi positions
      const bounds = L.latLngBounds([farmerPosition, bestMandiPosition]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, routeCoordinates, farmerPosition, bestMandiPosition]);

  return null;
};

export default MapBounds;
