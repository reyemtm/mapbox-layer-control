# mapbox-layer-control


![](mgl-lc-grouped.gif)

#### [Grouped Demo](https://reyemtm.github.io/mapbox-layer-control/example/grouped.html?rivers=true&riversCase=true&States=true&states-fill=true#4.11/38.61/-96.05)

#### [Sidebar Demo](https://reyemtm.github.io/mapbox-layer-control/example/grouped.html)

#### [Simple Demo](https://reyemtm.github.io/mapbox-layer-control/example/simple.html)

This is a simple layer control for Mapbox GL JS/MapLibre maps inspired by the Gartrell Group legend control. The layers need to already exist in the map. Each layer should only be added once to the control. The control does not affect map layer indexing. The layers should be added to the control in the same order that they have been added to the map (meaning the top layer is added last). The control simply adjusts the visibility layout property of the layer. In the grouped control, the group name toggles all the layers in the group. The control can have hidden layers that get toggled just like other layers. Layers have legends added automatically if they are a line, circle or fill with a single color. They can also have legend written in HTML.

Ideally the config for the layer control and for the opertational layers would be one and the same. The control will add url parameters for any layers turned on, allowing the map state to be shared. If this functionality is desired it is best to leave all layers off initially ("visibility": "none") and let the control turn them on with query parameters, as this function will not turn off layers that are initially visible.

**Legends use font-awesome.**

*This is very much in development and may change without notice.*


### version 0.1.0
- This version adds support for lazy loading of geojson sources, meaning the geojson is loaded the first time the layer is turned on.
  - To enable lazy loading the layer config needs to have the source in the metadata, and lazyLoading set to true.
  - The original layer source also needs to be added as a blank geojson feature collection.
  - Since multiple layers can share the same source, the metadata source object only needs to be added to one of the layers in the config.
  - Why? Where I use this in production I am loading many small geojson files and want to improve the inital load time of the map.
  - In the Grouped Demo, Counties and Rivers both have lazy loading turned on.
```JavaScript
map.addSource('sanitary-lines-source', {
  'type': 'geojson',
  'data': {
    type: "FeatureCollection",
    features: []
  }
});

const layerControlConfig = {
  collapsed: true,
  layers: [{
    id: "sewer-lines-case",
    directory: "Utilities",
    group: "Sanitary Sewer",
    hidden: true, //used for then this is a child of a parent layer
    parent: "sewer-lines", //optional, used to set the parent layer on the children
    children: false, //optional, used for the parent layer
    metadata: { //metadata for optional settings
      lazyLoading: true,
      source: {
        id: "sanitary-lines-source", //source of layer already added
        type: "geojson",
        data: 'sanitary-lines.geojson'
      }
    }
  }]
}
```


### version 0.0.8
- For the date filter to work the date field format has to be in ``yyyy/MM/dd`` or Epoch time.
- ``layerControlSimple.js`` will no longer be updated.
- New date filter option of `epoch` converts the date filter to Epoch time.

### version 0.0.6

- A simple filter control has been added, with multiple filters allowed per layer. If multiple filters are used, all conditions must be met. Add a ``filterSchema`` to the layer metadata, where the first object is the name of the field to be filtered, and the type being the type of filter. Available types are string, date, number, and select (single). 

**The filter form uses Spectre CSS for styling.**

### String and Date Filter

```JavaScript
{
  id: "States",
  hidden: false,
  group: "Political",
  directory: "Admin",
  metadata: {
    filterSchema: {
      "NAME": {
        type: "string"
      },
      "date_joined_formatted": {
        type: "date",
        epoch: false
      }
    }
  }
}
```

### Select Filter

```JavaScript
{
  id: "Zoning",
  metadata: {
    filterSchema: {
      zoning_code: {
        type: "select",
        options: ["", "RS-1","RS-2","RS-3","PUD"]  
      }
    }
  }
}
```

To Do:

* [ ] ADD DOCUMENTATION
* [ ] FIX WEIRD SELECTION BUG WHEN CLICK HEADING AND MOUSEOUT
* [ ] FIX HOVER/COLLAPSED EFFECT ON MOBILE
* [ ] ~~ADD CSS FRAMEWORK STYLING FOR TOGGLES~~
* [X] ADD TOGGLE ICON, COLLAPSIBLE ICON AND COLLAPSIBLE METHOD TO GROUP HEADING FOR HIDDEN LAYERS
* [X] ADD ICON WITH COUNT OF ACTIVE LAYERS FOR GROUPS AND DIRECTORIES
* [X] STYLE COLLAPSIBLE GROUP HEADINGS WITH HEIGHT TRANSITIONS
* [X] MOVE STYLES TO STYLESHEET
* [X] DECIDE ON LEGEND PLACEMENT VS HIDDEN LAYER PLACEMENT
* [x] ADD HIDDEN LAYERS
* [x] ADD LEGEND ITEMS
* [x] ADD COLLAPSIBLE DIRECTORY HEADINGS

![](simple.jpg)

```javascript
map.addControl( new layerControlSimple({
  layers: ["Lakes", "States", "Counties"]
}), "top-left");
```
Data is from [Natural Earth](https://www.naturalearthdata.com/) and [here](https://eric.clst.org/tech/usgeojson/).
