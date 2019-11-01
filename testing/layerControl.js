class layerControl {
  constructor(options) {
    const defaultOptions = {
      layers: []
    };

    this._options = (!options) ? defaultOptions : options;
    this._layers = this._options.layers;

    //ONLOAD ADD ACTIVE LAYERS TO WINDOWS SEARCH QUERY PARAMS
    //GET ACTIVE LAYERS FROM SEARCH PARAMS AND ACTIVATE THOSE LAYERS IN THE LAYER CONTROL AND ON THE MAP
    const urlParams = new URLSearchParams(window.location.search);
    const activeLayers = ([...urlParams.keys()]);
    const categories = [];
    this._layers.map(function(l) {
      if (categories.indexOf(l.category) < 0) {
        categories.push(l.category);
      }
      l.layout.visibility = (!activeLayers.length) ? l.layout.visibility : (activeLayers.indexOf(l.id) > -1) ? "visible" : "none";
      // if (activeLayers.length) {
      //   if (activeLayers.indexOf(l.id) > -1) {
      //     l.layout.visibility = "visible"
      //   }else{
      //     l.layout.visibility = "none"
      //   }
      // }
    });
    this._categories = categories.reverse();
    console.log("Categories:", this._categories)
  }

  addSourcesToMap = () => {
    let map = this._map;
    this._sources = [];
    this._layers.map(l => {
      if (this._sources.indexOf(l.source.data) === -1) {
        this._sources.push(l.source.data)
        console.log(l.source)
        map.addSource(l.source.data, {
          type: l.source.type,
          data: l.source.data
        })
        l.source = l.source.data;
      }else{
        l.source = l.source.data
      }
    })
    console.log(this._sources)
    console.log(this._layers)
  }


  addLayersToMap = () => {
    let map = this._map;
    let mapLayers = this._map.getStyle().layers;
    let mapIds = mapLayers.map(function(l) {
      return l.id
    });
    this._layers.map(function(layer, i) {
      if (mapIds.indexOf(layer.name) > 0) {
        return
      }else{
        map.addLayer(layer)
      }
    })
  }

  addLayersToControl = () => {
    let legend = document.querySelector("layer-control");
    let layerSelector = document.createElement("input")
    layerSelector.type = "checkbox";
    layerSelector.checked = "true";
    legend.appendChild(layerSelector)
  }

  addCategory = () => {
    this._layers.map(function(layer) {
      if (!layer.category) {
        return
      }
      console.log(layer.category)
    })
  }

  toggleCategory = () => {

  }

  toggleControl = () => {
    this._map.on("click", function() {
      console.log("click")
      if (document.querySelector(".layer-control")) {
        document.querySelector(".layer-control").classList.remove("active")
      }
    })
  }

  toggleLayers = () => {
    console.log(this)
  }

  onAdd(map) {
    this._map = map;

    //CREATE LAYER CONTROL BUTTON
    this._btn = document.createElement('button');
    this._btn.type = 'button';
    this._btn['aria-label'] = 'Layer Control';
    this._btn.style.backgroundImage = 'url("icongr.am-material-layers.svg")';
    this._btn.classList.add("layer-control--btn");
    this._btn.onclick = () => {
      this.parentNode.classList.add("active")
    };

    //CREATE LAYER CONTROL CONTAINER
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group layer-control';
    this._container.appendChild(this._btn);

    //LAYER CONTROL HOVER EFFECT
    this._container.onmouseenter = function() {
      this.classList.add("active");
    };
    this._container.onmouseleave = function() {
      this.classList.remove("active")
    };

    //CREATE LAYER CONTROL LAYER SELECTOR DIV
    let legend = document.createElement("div");
    legend.classList = "overlays"

    //MAPBOX ADDS LAYERS TO THE MAP IN THE ORDER OF THE ARRAY, SO WE WILL SWITCH THE ORDER TO MAP THE MAP ORDER, SO THE LAST LAYER IN THE LAYERS ARRAY WILL BE THE TOPMOST LAYER
    let categories = this._categories.slice();

    /*
    <div class="layer-control">
      <div class="layer-cateogry">
        <div class="layer-selector">
          <input>
          <label>
        </div>
        <div class="layer-selector">
        <input>
        <label>
        </div>
      </div>
    </div>
    */

    categories.map(function(c, i) {
      let layerSelectorCategory = document.createElement("div");
      layerSelectorCategory.id = "category" + i;
      layerSelectorCategory.classList = "layer-selector"
      layerSelectorCategory.innerHTML = `<strong>${c}</strong><br>`;
      // layerSelectorCategory.onclick = function() {
      //   console.log(this.children)
      //   for (let i = 1; i < this.children.length; i++) {
      //     if (this.children[i].classList.contains("collapsed")) {
      //       this.children[i].classList.remove("collapsed")
      //     }else{
      //       this.children[i].classList.add("collapsed")
      //     }
      //   }
      // }
      legend.appendChild(layerSelectorCategory);
    })
    
    let layersInvert = (this._layers.slice()).reverse()
    layersInvert.map(function(layer) {
      let layerSelectorDiv = document.createElement("div");
      let layerSelector = document.createElement("input");
      let layerSelectorLabel = document.createElement("label");
      layerSelectorLabel.setAttribute("for", layer.id);
      layerSelector.id = layer.id;
      layerSelector.type = "checkbox";
      layerSelector.classList = "apple-switch";
      layerSelector.name = layer.name;
      layerSelectorLabel.innerText = layer.name

      if (layer.layout.visibility === "visible") {
        layerSelector.checked = true;
      }

      layerSelector.onclick = function() {
        let params = new URLSearchParams(window.location.search);
        if (this.checked) {
          if (!map.getLayer(layer.id)) {
            map.addLayer(layer);
            map.setLayoutProperty(layer.id, "visibility", "visible");
            params.set(layer.id, true);
            if (history.pushState) {
              let url = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + params.toString() + window.location.hash;
              window.history.pushState({path:url},'',url);
            }
          }else{
            map.setLayoutProperty(layer.id, "visibility", "visible");
            params.set(layer.id, true);
            if (history.pushState) {
              let url = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + params.toString() + window.location.hash;
              window.history.pushState({path:url},'',url);
            }
          }
        }else{
          map.setLayoutProperty(layer.id, "visibility", "none");
          params.delete(layer.id);
          if (history.pushState) {
            let url = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + params.toString() + window.location.hash;
            window.history.pushState({path:url},'',url);
          }
        }
      }

      //ADD LAYER TO PROPER CATEGORY
      let layerCategory = categories.indexOf(layer.category);
      let layerCategoryDiv = legend.querySelector("#category"+layerCategory);

      layerSelectorDiv.appendChild(layerSelector);
      layerSelectorDiv.appendChild(layerSelectorLabel);
      layerCategoryDiv.appendChild(layerSelectorDiv);
      // layerCategoryDiv.appendChild(layerSelectorLabel);
      // layerSelectorDiv.appendChild(layerSelectorLabel);
    })

    this._container.appendChild(legend);

    this.addSourcesToMap();

    // ADD LAYERS TO CONTROL
    this.addLayersToMap();

    //ADD MAP LISTENERS
    this.toggleControl();

    //LAYER CONTROL LISTENERS
    this.toggleCategory(); 
    this.toggleLayers();

    return this._container;
  }

  onRemove() {
    this.container.parentNode.removeChild(this.container);
    delete this._map;
  };
}

export {
  layerControl
};