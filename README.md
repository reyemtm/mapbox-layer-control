# mapbox-layer-control

#### [Demo](https://reyemtm.github.io/mapbox-layer-control/example/)

This is a simple layer control for Mapbox GL JS maps. This is meant to be a starting point for a more complicated control. The layers need to already exist in the map. Each layer should only be added once to the control. The control does not control map layer indexing. The layers should be added to the control in the opposite order that they have been added to the map, so that the first layer in the control is the topmost layer in the map of the layers in the control. The control simply adjusts the visibility layout property of the layer. In the grouped control, the group name toggles all the layers in the group.

To Do:

* [ ] ADD HIDDEN LAYERS
* [ ] ADD LEGEND ITEMS
* [ ] ADD DOCUMENTATION
* [ ] ADD CSS FRAMEWORK STYLING
* [ ] ADD COLLAPSIBLE GROUP HEADINGS
* [ ] ADD HOVER/COLLAPSED EFFECT

![](grouped.jpg)


![](simple.jpg)


```javascript
map.addControl( new layerControlSimple({
  layers: ["Lakes", "States", "Counties"]
}), "top-left");

map.addControl( new layerControlGrouped({
  layers: [
    {
      name: "Hydro",
      layers: ["Lakes"]
    },
    {
      name: "Admin",
      layers: ["States", "Counties"]
    }
  ]
}), "top-left");
```
