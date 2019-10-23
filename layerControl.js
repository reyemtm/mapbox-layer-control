class layerControl {
  constructor(options) {
  }

  onAdd(map) {
    console.log(this)
    this._map = map;


    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl';
    this._container.innerHTML = '<div style="width:100%;background:#ff0000;">&nbsp;</div>';

    this._mapLayers = this._map.getStyle().layers;
    console.log(this._mapLayers)
    this._layers = ["counties"];

    this._layers.map(layer => {
      console.log(layer)
      console.log(layer.indexOf(this._mapLayers) )
      if (layer.indexOf(this._mapLayers) > -1) {
        this._container.innerHTML += `<div>${layer}</div>`
      }
    })

    return this._container;
  }
  onRemove(map) {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

export { layerControl }