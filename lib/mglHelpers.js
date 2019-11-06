function GetActiveLayers(map, layers) {
  let keys = layers.reduce((i, l) => {
    return [...i, l.id]
  }, []);
  let _map = map;
  let _mapLayers = _map.getStyle().layers;
  let _ids = GetMapLayerIds(_mapLayers);
  let urlParams = new URLSearchParams(window.location.search);
  let _layers = [...urlParams.keys()];
  let _values = [...urlParams.values()]; //COULD USE THIS IN THE FUTURE TO TURN LAYERS OFF FOR NOW ADDING ALL LAYERS AS VISIBILITY NONE AND TURNING THEM ON WITH THE LAYER CONTROL
  _layers.map(function(l) {
    if (keys.indexOf(l) > -1) {
      let visibility = GetLayerVisibility(_mapLayers, _ids, l);
      if (!visibility) {
        _map.setLayoutProperty(l, "visibility", "visible")
      }
    }
  });
}

function SetLayerVisibility(m, checked, layer) {
  let visibility = (checked === true) ? 'visible' : 'none';
    m.setLayoutProperty(layer, 'visibility', visibility);
}

function GetStyle(layers, layer) {
  let layerConfig = layers.filter(function(l) {
    return l.id === layer.id
  })
  let style = (!layerConfig[0].paint) ? false : layerConfig[0].paint

  return style
}

function GetMapLayerIds(layers) {
  return layers.reduce((array, layer) => {
    return [...array, layer.id]
  }, [])
}

function GetLayerVisibility(mapLayers, ids, layer) {
  var index = ids.indexOf(layer);
  if (index < 0) {
    return false
  }else{
    return mapLayers[index].layout.visibility === "visible" ? true : false;
  }
}

export {
  GetActiveLayers,
  SetLayerVisibility,
  GetStyle,
  GetMapLayerIds,
  GetLayerVisibility
}