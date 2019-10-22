function layerControl() { }

layerControl.prototype.onAdd = function(map) {
  this._map = map;
  this._container = document.createElement('div');
  this._container.className = 'mapboxgl-ctr';
  this._container.textContent = 'Hello, world';
  return this._container;
};

layerControl.prototype.onRemove() {
  this._container.parentNode.removeChild(this._container);
  this._map = undefined;
};

export layerControl
