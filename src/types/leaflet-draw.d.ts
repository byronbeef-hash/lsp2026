/* eslint-disable @typescript-eslint/no-namespace */
import "leaflet";

declare module "leaflet" {
  namespace Draw {
    namespace Event {
      const CREATED: string;
      const EDITED: string;
      const DELETED: string;
      const DRAWSTART: string;
      const DRAWSTOP: string;
      const DRAWVERTEX: string;
      const EDITSTART: string;
      const EDITMOVE: string;
      const EDITRESIZE: string;
      const EDITVERTEX: string;
      const EDITSTOP: string;
      const DELETESTART: string;
      const DELETESTOP: string;
    }

    class Polygon {
      constructor(map: L.Map, options?: Record<string, unknown>);
      enable(): void;
      disable(): void;
    }

    class Polyline {
      constructor(map: L.Map, options?: Record<string, unknown>);
      enable(): void;
      disable(): void;
    }

    class Marker {
      constructor(map: L.Map, options?: Record<string, unknown>);
      enable(): void;
      disable(): void;
    }

    class Rectangle {
      constructor(map: L.Map, options?: Record<string, unknown>);
      enable(): void;
      disable(): void;
    }

    class Circle {
      constructor(map: L.Map, options?: Record<string, unknown>);
      enable(): void;
      disable(): void;
    }
  }

  namespace DrawEvents {
    interface Created extends L.LeafletEvent {
      layer: L.Layer;
      layerType: string;
    }

    interface Edited extends L.LeafletEvent {
      layers: L.LayerGroup;
    }

    interface Deleted extends L.LeafletEvent {
      layers: L.LayerGroup;
    }
  }

  namespace Control {
    class Draw extends L.Control {
      constructor(options?: Record<string, unknown>);
    }
  }
}

declare module "leaflet-draw" {
  // Side-effect import — adds drawing tools to the L namespace
}
