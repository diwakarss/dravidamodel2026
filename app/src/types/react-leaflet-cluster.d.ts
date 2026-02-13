declare module "react-leaflet-cluster" {
  import { ComponentType } from "react";
  import type { DivIcon } from "leaflet";

  interface MarkerCluster {
    getChildCount(): number;
  }

  interface MarkerClusterGroupProps {
    children?: React.ReactNode;
    chunkedLoading?: boolean;
    iconCreateFunction?: (cluster: MarkerCluster) => DivIcon;
    maxClusterRadius?: number;
    spiderfyOnMaxZoom?: boolean;
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    disableClusteringAtZoom?: number;
    spiderfyDistanceMultiplier?: number;
    singleMarkerMode?: boolean;
    animate?: boolean;
    animateAddingMarkers?: boolean;
    removeOutsideVisibleBounds?: boolean;
    spiderLegPolylineOptions?: Record<string, unknown>;
    polygonOptions?: Record<string, unknown>;
  }

  const MarkerClusterGroup: ComponentType<MarkerClusterGroupProps>;
  export default MarkerClusterGroup;
}
