class layerControlSimple {

  constructor(options) {
    options = (!options) ? {
      layers: []
    } : options;
    this._layers = options.layers
  }

  onAdd(map) {
    this._map = map;
    let _this = this; //might use this later

    this._div = document.createElement('div');
    this._div["aria-label"] = "Layer Control";
    this._div.title = "Layer Control";
    this._div.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    this._div.style.padding = "8px";
    this._div.style.fontSize = "14px"

    this._mapLayers = this._map.getStyle().layers;
    this._mapLayerIds = getMapLayerIds(this._mapLayers);

    console.log(this._mapLayers)

    for (let i = 0; i < this._layers.length; i++) {
      let layer = this._layers[i];
      // console.log(this._mapLayerIds.indexOf(layer))
      if (this._mapLayerIds.indexOf(layer) > -1) {
        let checked = getMapLayerVisibility(this._mapLayers, this._mapLayerIds, layer);
        let index = this._mapLayerIds.indexOf(layer);
        let legend = (!this._mapLayers[index].legend) ? null : this._mapLayers[index].legend
        let input = createLayerInputToggle(layer, checked, index, legend);
        this._div.appendChild(input)
      }
    }

    /****
     * PUTTING THIS HERE SO AS NOT TO HAVE TO PASS IN THE MAP
     ****/
    function setLayerVisibility(checked, layer) {
      let visibility = (checked === true) ? 'visible' : 'none';
      _this._map.setLayoutProperty(layer, 'visibility', visibility);
    }

    this._div.addEventListener("click", function (e) {
      if (e.target.id) {
        setLayerVisibility(e.target.checked, e.target.name)
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
  layerControlSimple
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

function createLayerInputToggle(layer, checked, index, legend) {
  console.log(legend)
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
  label.innerHTML = (!legend) ? layer : legend + layer;
  label.style.cursor = "pointer";
  label.style.lineHeight = "24px" //need to make this relative to something
  div.appendChild(input);
  div.appendChild(label);
  return div
}