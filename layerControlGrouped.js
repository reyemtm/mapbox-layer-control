class layerControlGrouped {

  constructor(options) {
    options = (!options) ? {} : options;

    this._collapsed = false;

    if (options.options && options.options.collapsed) {
      this._collapsed = true;
    }

    this._layers = options.layers.reverse().slice()

    let directories = []; 
    let groups = [];

    directories = this._layers.reduce(function(i, layer) {
      return [...i, layer.directory]
    }, []);

    this._directories = [...new Set(directories)];

    groups = this._layers.reduce(function(i, layer) {
      if (!layer.group) layer.group = "Operational Layers"
      return [...i, layer.group]
    }, []);

    this._groups = [...new Set(groups)];

    let config = {};

    this._directories.map(function(d) {
      options.layers.map(function(layer) {
        if (layer.directory === d) {
          config[layer.directory] = {
          }
        }
      })
    })

    this._layers.map(function(l) {
      if (!l.group) l.group = "Operational Layers";
      config[l.directory][l.group] = []
    })

    this._layers.map(function(l) {
      config[l.directory][l.group].push(l)
    })

    this._layerControlConfig = config

    console.log(config)

    // this._layerControlConfig = {
    //     directory1: {
    //       groupName: [
    //         {
    //           id: "id",
    //           name: "name",
    //           legend: "html"
    //         }
    //       ]
    //     },
    //     directory2: {
    //       groupName: [
    //         {
    //           id: "id",
    //           name: "name",
    //           legend: "html"
    //         }
    //       ]
    //     }
    //   }
  }

  onAdd(map) {

    this._map = map;
    let _this = this; //might use this later

    // SETUP MAIN MAPBOX CONTROL = MOVE TO OTHER FUNCTION lcCreateButton()
    this._div = lcCreateButton(this._collapsed);

    // GET THE MAP LAYERS AND LAYER IDS
    this._mapLayers = this._map.getStyle().layers;
    this._mapLayerIds = mpxHelperGetMapLayerIds(this._mapLayers);

    //BUILD DIRECTORIES, GROUPS, LAYER TOGGLES AND LEGENDS FROM THE layerControlConfig
    for (let d in this._layerControlConfig) {

      //CREATE DIRECTORY
      let directory = d;
      let directoryDiv = lcCreateDicrectory(directory);

      //CREATE TOGGLE GROUPS
      for (let g in this._layerControlConfig[d]) {

        let groupDiv = lcCreateGroup(g, this._layerControlConfig[d][g], map)

        let groupLayers = this._layerControlConfig[d][g];

        // CREATE INDIVIDUAL LAYER TOGGLES
        for (let l = 0; l < groupLayers.length; l++) {
          let layer = groupLayers[l];
          let style = mpxHelperGetStyle(this._mapLayers, layer);
          if (!layer.legend && style) {
            layer.simmpleLegend = lcCreateLegend(style)
          }
          let checked = mpxHelperGetLayerVisibility(this._mapLayers, this._mapLayerIds, layer.id);
          let layerSelector = lcCreateLayerToggle(layer, checked);
          groupDiv.appendChild(layerSelector)
        }
        directoryDiv.appendChild(groupDiv);
      }

      this._div.appendChild(directoryDiv)
    }

    /****
     * PUTTING THIS HERE SO AS NOT TO HAVE TO PASS IN THE MAP
     ****/
    function setLayerVisibility(checked, layer) {
      // console.log("layer", layer, "checked", checked)
      let visibility = (checked === true) ? 'visible' : 'none';
      
      // console.log("the", layer, "has visibility", visibility)
      map.setLayoutProperty(layer, 'visibility', visibility);
    }

    /****
     * ADD EVENT LISTENERS FOR THE LAYER CONTROL ALL ON THE CONTROL ITSELF
     ****/
    // this._div.addEventListener("mouseenter", function (e) {
    //   e.target.classList.remove("collapsed")
    //   return
    // });

    // this._div.addEventListener("mouseout", function (e) {
    //   e.target.classList.add("collapsed")
    //   return
    // });

    this._div.addEventListener("click", function (e) {
      console.log(e.target);

      if (e.target.className === "mgl-layerControlCover") {
        e.target.parentElement.classList.remove("collapsed")
        return
      }

      if (e.target.className === "checkbox") {
        e.target.children[0].click();
        return
      }

      if (e.target.dataset.mapLayer) {
        setLayerVisibility(e.target.checked, e.target.id);
        if (e.target.dataset.children) {
          let children = document.querySelectorAll("[data-parent]");
          for (let i = 0; i < children.length; i++) {
            if (children[i].dataset.parent === e.target.id) {
              // setLayerVisibility(e.target.checked, children[i].id);
              children[i].click()
            }
          }
        }
        return
      }

      if (e.target.dataset.mapLayer && e.target.dataset.group != false) {
        e.stopPropagation();
        let group = e.target.dataset.group;
        let groupMembers = document.querySelectorAll("[data-group]");
        for (let i = 0; i < groupMembers.length; i++) {
          if (group != "false" && groupMembers[i].dataset.group === group) {
            // console.log("data-map-layer data-group", group)
            setLayerVisibility(e.target.checked, groupMembers[i].id);
          }
        }
        return
      }

      if (e.target.dataset.layergroup) {
        console.log("layergroup")
        let inputs = e.target.parentElement.querySelectorAll("[data-map-layer");
        // console.log("inputs", inputs)
        // CHECK IF ANY OF THE BOXES ARE NOT CHECKED AND IF NOT THEM CHECK THEM ALL
        if (!domHelperGetAllChecked(inputs)) {
          for (let i = 0; i < inputs.length; i++) {
            if (!inputs[i].checked) {
              inputs[i].click()
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
        return
      }

      if (e.target.dataset.directoryToggle) {
        if (e.target.parentElement.children[2].style.display != "none") {
          e.target.parentElement.children[0].style.backgroundImage = "url('../plus.svg')";
        }else{
          e.target.parentElement.children[0].style.backgroundImage = "url('../minus.svg')";
        }
        domHelperToggleChildren(e.target.parentElement, 2)
        
        return
      }
    })

    if (this._collapsed) {
      this._map.on("click", function() {
        _this._div.classList.add("collapsed")
      })
    }

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

function mpxHelperGetMapLayerIds(layers) {
  return layers.reduce((array, layer) => {
    return [...array, layer.id]
  }, [])
}

function mpxHelperGetLayerVisibility(mapLayers, ids, layer) {
  var index = ids.indexOf(layer);
  return (mapLayers[index].layout.visibility === "visible") ? true : false
}

function lcCreateLayerToggle(layer, checked, index) {
  let div = document.createElement("div");
  div.className = "checkbox";
  div.style.cursor = "pointer";

  if (layer.hidden) {
    div.style.display = "none";
    div.dataset.hidden = true
  }

  let input = document.createElement("input");
  input.name = (!layer.name) ? layer.id : layer.name;
  input.type = "checkbox"
  input.id = layer.id;
  input.dataset.group = (layer.group) ? layer.group : false;

  if (layer.children) {
    input.dataset.children = true
  }
  if (layer.parent) {
    input.dataset.parent = layer.parent
  }
  input.className = "layer slide-toggle";
  input.style.cursor = "pointer";
  input.dataset.mapLayer = true;
  if (checked) input.checked = true;

  input.onclick = function() {
    lcSetActiveLayers(this.id, this.checked)
  }
  

  let label = document.createElement("label");
  label.setAttribute("for", layer.id);
  label.style.cursor = "pointer";
  label.style.lineHeight = "32px" //need to make this relative to something
  if (layer.legend) {
    label.innerText = (!layer.name) ? layer.id : layer.name;
    let legend = document.createElement("div");
    legend.innerHTML = layer.legend;
    label.appendChild(legend)
  } else if (layer.simmpleLegend) {
    label.innerHTML += layer.simmpleLegend;
    label.innerHTML += (!layer.name) ? layer.id : layer.name;
  }else{
    label.innerText = (!layer.name) ? layer.id : layer.name;
  }
  label.dataset.layerToggle = "true"
  div.appendChild(input);
  div.appendChild(label);
  
  return div
}

function domHelperGetAllChecked(boxes) {
  let boolean = false;
  for (let i = 0; i < boxes.length; i++) {
    console.log(boxes[i].checked)
    if (boxes[i].checked) {
      boolean = true;
      continue
    } else {
      boolean = false
      break
    }
  }
  return boolean
}

function domHelperToggleChildren(div, start) {
  var children = div.children;
  if (children.length > 1 && children[start].style.display === "none") {
    for (var i = start; i < children.length; i++) {
      if (!children[i].dataset.hidden) children[i].style.display = "block"
    }
  }else{
    for (var i = start; i < children.length; i++) {
      children[i].style.display = "none"
    }
  }
}


function lcCreateDicrectory(directoryName) {

    let accordian = document.createElement("div");
    accordian.dataset.accordian = true;
    accordian.style.backgroundColor = "white"
  
    let button = document.createElement("button");
    button.dataset.directoryToggle = true
 
    accordian.appendChild(button);
  
    let d = document.createElement("div");

    d.style.fontSize = "18px";
    d.style.background = "whitesmoke";
    d.style.padding = "8px";
    d.style.cursor = "pointer";
  
    d.id = directoryName.replace(" ", "");
    d.innerText =  directoryName;
    d.className = "layerControlDirectory";
    d.dataset.name = directoryName;
    d.dataset.directoryToggle = true

    accordian.appendChild(d);
    return accordian;
}

function lcCreateGroup(group, layers, map) {
  let titleInputChecked = false;
  // GET CHECKED STATUS OF LAYER GROUP
  // for (let i = 0; i < layers.length; i++) {
  //   let l = layers[i];
  //   console.log(l)
  //   if(map.getLayoutProperty(l.id, "visibility") === "visible") {
  //     titleInputChecked = true
  //     continue
  //   }else{
  //     break
  //   }
  // }

  let titleInputContainer = document.createElement("div");
  titleInputContainer.style.margin = "8px"

  let titleInput = document.createElement("input");
  titleInput.type = "checkbox";
  let titleInputId = "layerGroup_" + group.replace(" ", "");
  titleInput.id = titleInputId;
  titleInput.style.display = "none";
  titleInput.dataset.layergroup = group;

  if (titleInputChecked) titleInput.checked = true

  let titleInputLabel = document.createElement("label");
  titleInputLabel.setAttribute("for", titleInputId);
  titleInputLabel.style.cursor = "pointer";
  titleInputLabel.style.display = "inline-flex";
  titleInputLabel.style.fontWeight = "inline-flex";
  titleInputLabel.textContent = group;

  titleInputContainer.appendChild(titleInput);
  titleInputContainer.appendChild(titleInputLabel);

  return titleInputContainer;

}

function lcCreateButton(collapsed) {
  let div = document.createElement('div');
  div["aria-label"] = "Layer Control";
  div.title = "Layer Control";
  div.className = 'mapboxgl-ctrl mapboxgl-ctrl-group mgl-layerControl';
  if (collapsed) div.classList.add("collapsed");
  
  let cover = document.createElement("img");
  cover.src="https://icongr.am/material/layers.svg";
  cover.classList = "mgl-layerControlCover";
  div.appendChild(cover);
  
  return div
}

function mpxHelperGetStyle(layers, layer) {
  let layerConfig = layers.filter(function(l) {
    return l.id === layer.id
  })
  let style = (!layerConfig[0].paint) ? false : layerConfig[0].paint

  return style
}

function lcCreateLegend(style) {
  let type = Object.keys(style)
  let legend = false;
  if (type.indexOf("line-color") > -1 && isString(style["line-color"])) {
    legend = `<icon class='fa fa-minus ' style='color:${style["line-color"]};'></icon>`;
  }
  if (type.indexOf("fill-color") > -1 && isString(style["fill-color"])) {
    legend = `<icon class='fa fa-square' style='color:${style["fill-color"]};'></icon>`;
  }
  if (type.indexOf("circle-color") > -1 && isString(style["circle-color"])) {
    legend = `<icon class='fa fa-circle ' style='color:${style["circle-color"]};'></icon>`;
  }

  return legend
}

function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

function lcGetActiveLayers(map, mapLayers, ids, layers) {
  let _map = map;
  let _mapLayers = mapLayers;
  let _ids = ids;
  let urlParams = new URLSearchParams(window.location.search);
  let activeLayers = ([...urlParams.keys()]);
  layers.map(function(l) {
    let visibility = mpxHelperGetLayerVisibility(_mapLayers, _ids, l);
    if (visibility) {
      _map.setLayoutProperty(layer, "visibility", "visible")
    }
  });
}

//NEED TO ACCOUNT FOR HIDDEN LAYERS
function lcSetActiveLayers(l,checked) {
  let _layer = l;
  let _visibility = checked;
  let params = new URLSearchParams(window.location.search);
  if (_visibility) {
    params.set(_layer, true);
    if (history.pushState) {
      let url = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + params.toString() + window.location.hash;
      window.history.pushState({path:url},'',url);
    }
  }else{
    params.delete(_layer);
    if (history.pushState) {
      let url = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + params.toString() + window.location.hash;
      window.history.pushState({path:url},'',url);
    }
  }
}