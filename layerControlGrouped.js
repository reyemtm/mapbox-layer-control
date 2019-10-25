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
    this._div.className = 'mapboxgl-ctrl mapboxgl-ctrl-group mgl-layerControl';
    // this._div.style.padding = "8px";
    this._div.style.fontSize = "14px"
    this._div.style.overflowX = "hidden";

    // GET THE MAP LAYERS AND LAYER IDS
    this._mapLayers = this._map.getStyle().layers;
    this._mapLayerIds = getMapLayerIds(this._mapLayers);

    console.log(this._layers)

    // CREATE THE INPUTS FOR THE CONTROL
    for (let i = 0; i < this._layers.length; i++) {
      let layer = this._layers[i];

      if (layer.directory) {
        //create a collapsible directory to hold the groups this directory will not have the ability toggle the layers
        console.log(layer.name, "is in", layer.directory, "directory")
      }

      let accordian = document.createElement("div");
      
      accordian.dataset.accordian = true;

      let directory = document.createElement("div");

      directory.style.fontSize = "18px";
      directory.style.background = "whitesmoke";
      directory.style.padding = "8px";
      directory.style.cursor = "pointer";
      directory.id = (!layer.directory) ? Math.floor(Math.random() *10000) : (layer.directory).replace(" ", "");
      directory.innerHTML = "&#45;&nbsp;&nbsp;" + layer.directory; //"&#43; "
      directory.className = "layerControlDirectory";
      directory.dataset.name = layer.directory;
      directory.style.fontWeight = "bold";


      // let layerGroupContainer = document.createElement("div");
      let title = document.createElement("div");
      title.style.margin = "4px";
      title.style.fontWeight = "bold";
      // title.innerHTML = (layer.legend) ? layer.name + "<br>" + layer.legend : layer.name;
      title.innerText = layer.name
      title.dataset.layergroup = layer.name;
      title.style.cursor = "pointer";
      title.style.display = "block";

      accordian.append(directory);
      accordian.appendChild(title)

      // layerGroupContainer.appendChild(accordian);

      for (let i = 0; i < layer.mapLayers.length; i++) {
        let groupedLayer = layer.mapLayers[i];

        if (this._mapLayerIds.indexOf(groupedLayer.id) > -1) {
          let checked = getMapLayerVisibility(this._mapLayers, this._mapLayerIds, groupedLayer.id);
          let index = this._mapLayerIds.indexOf(groupedLayer.id);

          let input = createLayerInputToggle(groupedLayer, checked, index);
          accordian.appendChild(input);
        }
      }

      this._div.appendChild(accordian)

    }

    /****
     * PUTTING THIS HERE SO AS NOT TO HAVE TO PASS IN THE MAP
     ****/
    function setLayerVisibility(checked, layer) {
      console.log("layer", layer, "checked", checked)
      let visibility = (checked === true) ? 'visible' : 'none';
      
      console.log("the", layer, "has visibility", visibility)
      _this._map.setLayoutProperty(layer, 'visibility', visibility);
    }

    /****
     * ADD EVENT LISTENERS FOR THE LAYER CONTROL ALL ON THE CONTROL ITSELF
     ****/
    this._div.addEventListener("click", function (e) {
      // console.log("target", e.target.id)
      if (e.target.id && e.target.dataset.mapLayer) {
        let group = e.target.dataset.group;
        console.log("group", group)
        let groupMembers = document.querySelectorAll("[data-group]");
        for (let i = 0; i < groupMembers.length; i++) {
          if (group != "false" && groupMembers[i].dataset.group === group) {
            // console.log(groupMembers[i].id, groupMembers[i].dataset.group)
            setLayerVisibility(groupMembers[i].checked, groupMembers[i].id);
          }
        }
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

      if (e.target.className === "layerControlDirectory") {
        //change the plus minus with css???
        // console.log(e.target.parentElement.children[1].style.display)
        if (e.target.parentElement.children[1].style.display === "block") {
          e.target.innerHTML = "&#43; " + e.target.dataset.name;
        }else{
          e.target.innerHTML = "&#45;&nbsp;&nbsp;" + e.target.dataset.name;
        }
        toggleChildren(e.target.parentElement)
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
  div.className = "checkbox";

  if (layer.hidden) {
    div.style.display = "none"
  }

  let input = document.createElement("input");
  input.name = layer.name;
  input.type = "checkbox"
  input.id = layer.id;
  input.dataset.group = (layer.group) ? layer.group : false;
  input.className = "layer";
  input.style.cursor = "pointer";
  input.dataset.mapLayer = true;
  if (checked) input.checked = true;
  let label = document.createElement("label");
  label.setAttribute("for", layer.id);
  label.style.cursor = "pointer";
  label.style.lineHeight = "24px" //need to make this relative to something
  if (layer.legend) {
    label.innerText = layer.name;
    let legend = document.createElement("div");
    legend.innerHTML = layer.legend;
    label.appendChild(legend)
  }else{
    label.innerText = layer.name;
  }
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

function toggleChildren(div) {
  var children = div.children;
  if (children.length > 1 && children[1].style.display === "none") {
    for (var i = 1; i < children.length; i++) {
      children[i].style.display = "block"
    }
  }else{
    for (var i = 1; i < children.length; i++) {
      children[i].style.display = "none"
    }
  }
}
