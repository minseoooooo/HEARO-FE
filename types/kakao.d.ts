declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void
        Map: new (container: HTMLElement, options: any) => any
        LatLng: new (lat: number, lng: number) => any
        Marker: new (options: any) => any
        InfoWindow: new (options: any) => any
        MarkerImage: new (src: string, size: any, options?: any) => any
        Size: new (width: number, height: number) => any
        Point: new (x: number, y: number) => any
        services: {
          Status: {
            OK: string
            ZERO_RESULT: string
            ERROR: string
          }
          Geocoder: new () => {
            addressSearch: (address: string, callback: (result: any, status: any) => void) => void
            coord2RegionCode: (lng: number, lat: number, callback: (result: any, status: any) => void) => void
            coord2Address: (lng: number, lat: number, callback: (result: any, status: any) => void) => void
          }
          Places: new () => {
            keywordSearch: (keyword: string, callback: (result: any, status: any) => void, options?: any) => void
            categorySearch: (category: string, callback: (result: any, status: any) => void, options?: any) => void
          }
        }
        event: {
          addListener: (target: any, type: string, handler: (...args: any[]) => void) => void
          removeListener: (target: any, type: string, handler: (...args: any[]) => void) => void
        }
        ControlPosition: {
          TOP: string
          TOPLEFT: string
          TOPRIGHT: string
          LEFT: string
          RIGHT: string
          BOTTOMLEFT: string
          BOTTOM: string
          BOTTOMRIGHT: string
        }
        MapTypeControl: new () => any
        ZoomControl: new () => any
        drawing: {
          OverlayType: {
            MARKER: string
            RECTANGLE: string
            CIRCLE: string
            ELLIPSE: string
            POLYLINE: string
            ARROW: string
            POLYGON: string
          }
          DrawingManager: new (options: any) => any
        }
      }
    }
  }
}

export {}
