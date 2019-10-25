# mapbox-layer-control

#### [Grouped Demo](https://reyemtm.github.io/mapbox-layer-control/example/grouped.html)

#### [Simple Demo](https://reyemtm.github.io/mapbox-layer-control/example/simple.html)

*This is very much in development. Any assistance is appreciated. This is inspired by the Gartrell Group mapbox legend control.*

This is a simple layer control for Mapbox GL JS maps. This is meant to be a starting point for a more complicated control. The layers need to already exist in the map. Each layer should only be added once to the control. The control does not control map layer indexing. The layers should be added to the control in the opposite order that they have been added to the map, so that the first layer in the control is the topmost layer in the map of the layers in the control. The control simply adjusts the visibility layout property of the layer. In the grouped control, the group name toggles all the layers in the group.

To Do:


* [ ] ADD DOCUMENTATION
* [ ] ADD CSS FRAMEWORK STYLING FOR TOGGLES
* [ ] STYLE COLLAPSIBLE GROUP HEADINGS WITH HEIGHT TRANSITIONS
* [ ] MOVE STYLES TO STYLESHEET
* [ ] DECIDE ON LEGEND PLACEMENT VS HIDDEN LAYER PLACEMENT
* [ ] ADD TOGGLE ICON, COLLAPSIBLE ICON AND COLLAPSIBLE METHOD TO GROUP HEADING FOR HIDDEN LAYERS
* [ ] ACCESSIBILITY FOR HIDDEN LAYERS, LAYER HEADINGS AND DIRECTORY HEADINGS???
* [x] ADD HIDDEN LAYERS
* [x] ADD LEGEND ITEMS
* [x] ADD COLLAPSIBLE GROUP HEADINGS
* [X] ADD HOVER/COLLAPSED EFFECT



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
