function layerControl(options) { }

layerControl.prototype.onAdd = function(map) {
  this._map = map;
  this._layers = this._map.getStyle().layer
  
  console.log(options)
  
  
  this._container = document.createElement('div');
  this._container.className = 'mapboxgl-ctrl';
  this._container.textContent = 'Hello, world';
  return this._container;
};

layerControl.prototype.onRemove = function(map) {
  this._container.parentNode.removeChild(this._container);
  this._map = undefined;
};

export layerControl
