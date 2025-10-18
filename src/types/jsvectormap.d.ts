declare module "jsvectormap" {
  interface RegionStyle {
    initial?: {
      fill?: string;
      fillOpacity?: number;
      stroke?: string;
      strokeWidth?: number;
    };
    hover?: {
      fill?: string;
      fillOpacity?: number;
      stroke?: string;
      strokeWidth?: number;
      cursor?: string;
    };
    selected?: {
      fill?: string;
      fillOpacity?: number;
      stroke?: string;
      strokeWidth?: number;
    };
  }

  interface RegionLabelStyle {
    initial?: {
      fontFamily?: string;
      fontSize?: number;
      fontWeight?: string;
      fill?: string;
    };
    hover?: {
      cursor?: string;
      fill?: string;
    };
  }

  interface MapLabels {
    regions?: {
      render?: (code: string) => string;
    };
  }

  interface VectorMapConfig {
    selector: string;
    map: string;
    zoomButtons?: boolean;
    zoomOnScroll?: boolean;
    zoomMax?: number;
    zoomMin?: number;
    zoomStep?: number;
    regionStyle?: RegionStyle;
    regionLabelStyle?: RegionLabelStyle;
    backgroundColor?: string;
    labels?: MapLabels;
    onRegionClick?: (event: Event, code: string) => void;
    onRegionOver?: (event: Event, code: string) => void;
    onRegionOut?: (event: Event, code: string) => void;
  }

  interface VectorMapInstance {
    destroy(): void;
    updateSize(): void;
    setFocus(config?: { region?: string; animate?: boolean }): void;
    clearSelectedRegions(): void;
  }

  class jsVectorMap {
    constructor(config: VectorMapConfig);
    destroy(): void;
    updateSize(): void;
    setFocus(config?: { region?: string; animate?: boolean }): void;
    clearSelectedRegions(): void;
  }

  export default jsVectorMap;
}
