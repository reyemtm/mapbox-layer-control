function layerControl() { }

layerControl.prototype.onAdd = function(map) {
  this._map = map;
  this._container = document.createElement(‘div’);
  this._container.className = ‘mapboxgl-ctrl’;
  this._container.textContent = ‘Hello, world’;
  return this._container;
};

HelloWorldControl.prototype.onRemove() {
  this._container.parentNode.removeChild(this._container);
  this._map = undefined;
};

export layerControl
