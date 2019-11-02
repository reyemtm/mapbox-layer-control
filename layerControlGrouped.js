class layerControlGrouped {

  constructor(options) {
    options = (!options) ? [] : options;

    options = options.reverse();

    this._options = options.slice()

    let directories = []; 
    let groups = [];

    directories = this._options.reduce(function(i, layer) {
      return [...i, layer.directory]
    }, []);

    this._directories = [...new Set(directories)];

    groups = this._options.reduce(function(i, layer) {
      if (!layer.group) layer.group = "Operational Layers"
      return [...i, layer.group]
    }, []);

    this._groups = [...new Set(groups)];

    let config = {};

    this._directories.map(function(d) {
      options.map(function(layer) {
        if (layer.directory === d) {
          config[layer.directory] = {
          }
        }
      })
    })

    this._options.map(function(l) {
      if (!l.group) l.group = "Operational Layers";
      config[l.directory][l.group] = []
    })

    this._options.map(function(l) {
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
    this._div = lcCreateButton();

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
    //   // console.log(e.target)
    // });

    this._div.addEventListener("click", function (e) {
      console.log(e.target);

      if (e.target.className === "mgl-layerControlCover") {
        return
      }

      if (e.target.className === "checkbox") {
        e.target.children[0].click();
        return
      }

      if (e.target.dataset.mapLayer && e.target.dataset.group === "false") {
        setLayerVisibility(e.target.checked, e.target.id);
        return
      }

      if (e.target.dataset.mapLayer) {
        e.stopPropagation();
        let group = e.target.dataset.group;
        let groupMembers = document.querySelectorAll("[data-group]");
        for (let i = 0; i < groupMembers.length; i++) {
          if (group != "false" && groupMembers[i].dataset.group === group) {
            console.log("data-map-layer data-group", group)
            setLayerVisibility(e.target.checked, groupMembers[i].id);
          }
        }
        return
      }

      if (e.target.dataset.layergroup) {
        console.log("layergroup")
        let inputs = e.target.parentElement.querySelectorAll("[data-map-layer");
        console.log("inputs", inputs)
        // CHECK IF ANY OF THE BOXES ARE NOT CHECKED AND IF NOT THEM CHECK THEM ALL
        if (!domHelperGetAllChecked(inputs)) {
          console.log("none are checked")
          console.log(inputs.length)
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

function mpxHelperGetLayerVisibility(layers, ids, layer) {
  var index = ids.indexOf(layer);
  return (layers[index].layout.visibility === "visible") ? true : false
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
  input.className = "layer slide-toggle";
  input.style.cursor = "pointer";
  input.dataset.mapLayer = true;
  if (checked) input.checked = true;
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
  // titleInputLabel.dataset.layergroup = group;
  titleInputLabel.style.display = "inline-flex";
  titleInputLabel.style.fontWeight = "inline-flex";
  titleInputLabel.textContent = group;

  titleInputContainer.appendChild(titleInput);
  titleInputContainer.appendChild(titleInputLabel);

  return titleInputContainer;

}

function lcCreateButton() {
  let div = document.createElement('div');
  div["aria-label"] = "Layer Control";
  div.title = "Layer Control";
  div.className = 'mapboxgl-ctrl mapboxgl-ctrl-group mgl-layerControl';
  div.style.fontSize = "16px"
  div.style.overflowX = "hidden";
  
  let cover = document.createElement("div");
  cover.style.width = "36px";
  cover.style.height = "36px";
  cover.style.zIndex = 1;
  cover.style.position = "absolute";
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
    legend = `<icon class='fa fa-square ' style='color:${style["fill-color"]};'></icon>`;
  }
  if (type.indexOf("circle-color") > -1 && isString(style["circle-color"])) {
    legend = `<icon class='fa fa-circle ' style='color:${style["circle-color"]};'></icon>`;
  }

  return legend
}

function isString(value) {
  return typeof value === 'string' || value instanceof String;
}
