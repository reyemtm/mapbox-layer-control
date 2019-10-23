/****
 * [ ] ADD HIDDEN LAYERS
 * [ ] ADD LEGEND ITEMS
 * [ ] ADD DOCUMENTATION
 * [ ] ADD CSS FRAMEWORK STYLING
 * [ ] ADD COLLAPSIBLE GROUP HEADINGS
 */

class layerControlGrouped {

  constructor(options) {
    options = (!options) ? {
      layerGroups: []
    } : options;
    this._layers = options.layers
  }

  onAdd(map) {
    this._map = map;
    let _this = this; //might use this later

    // SETUP MAIN MAPBOX CONTROL
    this._div = document.createElement('div');
    this._div["aria-label"] = "Layer Control";
    this._div.title = "Layer Control";
    this._div.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    this._div.style.padding = "8px";
    this._div.style.fontSize = "14px"

    // GET THE MAP LAYERS AND LAYER IDS
    this._mapLayers = this._map.getStyle().layers;
    this._mapLayerIds = getMapLayerIds(this._mapLayers);

    console.log(this._layers)

    // CREATE THE INPUTS FOR THE CONTROL
    for (let i = 0; i < this._layers.length; i++) {
      let layer = this._layers[i];

      let layerGroupContainer = document.createElement("div");
      let title = document.createElement("h4");
      title.style.margin = "5px 0";
      title.innerText = layer.name;
      title.dataset.layergroup = layer.name;
      title.style.cursor = "pointer";
      layerGroupContainer.appendChild(title);

      for (let i = 0; i < layer.layers.length; i++) {
        let groupedLayer = layer.layers[i];
        if (this._mapLayerIds.indexOf(groupedLayer) > -1) {
          let checked = getMapLayerVisibility(this._mapLayers, this._mapLayerIds, groupedLayer);
          let index = this._mapLayerIds.indexOf(groupedLayer);

          let input = createLayerInputToggle(groupedLayer, checked, index);
          layerGroupContainer.appendChild(input);
        }
      }

      this._div.appendChild(layerGroupContainer)

    }

    /****
     * PUTTING THIS HERE SO AS NOT TO HAVE TO PASS IN THE MAP
     ****/
    function setLayerVisibility(checked, layer) {
      let visibility = (checked === true) ? 'visible' : 'none';
      _this._map.setLayoutProperty(layer, 'visibility', visibility);
    }

    /****
     * ADD EVENT LISTENERS FOR THE LAYER CONTROL ALL ON THE CONTROL ITSELF
     ****/
    this._div.addEventListener("click", function (e) {
      console.log("target", e.target)
      if (e.target.id && e.target.name) {
        setLayerVisibility(e.target.checked, e.target.name)
        return
      }
      if (e.target.dataset.layergroup) {
        let inputs = e.target.parentElement.getElementsByClassName("layer");

        // CHECK IF ANY OF THE BOXES ARE NOT CHECKED AND IF NOT THEM CHECK THEM ALL
        if (!getAllChecked(inputs)) {
          for (let i = 0; i < inputs.length; i++) {
            let checkbox = inputs[i];
            if (!checkbox.checked) {
              checkbox.click()
            }
          }
        } 
        
        // IF ALL OF THE BOXES ARE CHECKED, UNCHECK THEM ALL
        else {
          for (let i = 0; i < inputs.length; i++) {
            let checkbox = inputs[i];
            if (checkbox.checked) {
              checkbox.click()
            }
          }
        }
      }
    })

    return this._div;
  }
  onRemove(map) {
    this._map = map;
    this._div.parentNode.removeChild(this._div);
    this._map = undefined;
  }
}

export {
  layerControlGrouped
}

/****
 * HELPER FUNCTIONS
 ****/

function getMapLayerIds(layers) {
  return layers.reduce((array, layer) => {
    return [...array, layer.id]
  }, [])
}

function getMapLayerVisibility(layers, ids, layer) {
  var index = ids.indexOf(layer);
  return (layers[index].layout.visibility === "visible") ? true : false
}

function createLayerInputToggle(layer, checked, index) {
  let div = document.createElement("div");
  div.className = "checkbox"
  let input = document.createElement("input");
  input.name = layer;
  input.type = "checkbox"
  input.id = "layer_" + index;
  input.className = "layer";
  input.style.cursor = "pointer";
  if (checked) input.checked = true
  let label = document.createElement("label");
  label.innerText = layer;
  label.setAttribute("for", "layer_" + index);
  label.innerText = layer;
  label.style.cursor = "pointer";
  label.style.lineHeight = "24px" //need to make this relative to something
  div.appendChild(input);
  div.appendChild(label);
  return div
}

function getAllChecked(boxes) {
  let boolean = false;
  for (let i = 0; i < boxes.length; i++) {
    if (boxes[i].checked) {
      boolean = true;
      continue
    } else {
      boolean = false
      break
    }
  }
  // console.log(boolean)
  return boolean
}