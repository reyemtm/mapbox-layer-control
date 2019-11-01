class layerControlGrouped {

  constructor(config) {
    config = (!config) ? [] : config;

    config = config.reverse();

    this._config = config.slice()

    let directories = []; 
    let groups = [];

    directories = this._config.reduce(function(i, layer) {
      return [...i, layer.directory]
    }, []);

    this._directories = [...new Set(directories)];

    groups = this._config.reduce(function(i, layer) {
      if (!layer.group) layer.group = "Operational Layers"
      return [...i, layer.group]
    }, []);

    this._groups = [...new Set(groups)];

    let temp = {};

    this._directories.map(function(d) {
      config.map(function(layer) {
        if (layer.directory === d) {
          temp[layer.directory] = {
          }
        }
      })
    })

    this._config.map(function(l) {
      if (!l.group) l.group = "Operational Layers";
      temp[l.directory][l.group] = []
    })

    this._config.map(function(l) {
      temp[l.directory][l.group].push(l)
    })

    this._layerControlConfig = temp

    console.log(temp)

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

    // SETUP MAIN MAPBOX CONTROL = MOVE TO OTHER FUNCTION controlCreate()
    this._div = document.createElement('div');
    this._div["aria-label"] = "Layer Control";
    this._div.title = "Layer Control";
    this._div.className = 'mapboxgl-ctrl mapboxgl-ctrl-group mgl-layerControl';
    this._div.style.fontSize = "14px"
    this._div.style.overflowX = "hidden";
    this._cover = document.createElement("div");
    this._cover.style.width = "36px";
    this._cover.style.height = "36px";
    this._cover.style.zIndex = 1;
    this._cover.style.position = "absolute";
    this._cover.classList = "mgl-layerControlCover";
    this._div.appendChild(this._cover);

    // GET THE MAP LAYERS AND LAYER IDS
    this._mapLayers = this._map.getStyle().layers;
    this._mapLayerIds = getMapLayerIds(this._mapLayers);
  

    //BUILD DIRECTORIES, GROUPS AND LAYER TOGGLES
    for (let d in this._layerControlConfig) {

      //CREATE DIRECTORY
      let directory = d;
      let directoryDiv = lcCreateDicrectory(directory);

      //CREATE TOGGLE GROUPS
      for (let g in this._layerControlConfig[d]) {

        let groupDiv = lcCreateGroup(g, this._layerControlConfig[d][g], map)

      // CREATE INDIVIDUAL LAYER TOGGLES
      for (let l = 0; l < this._config.length; l++) {
        let layer = this._config[l];
        if (layer.directory === directory && layer.group === g) {
          // if (layer.group && group) {
          //   let titleInputContainer = document.createElement("div");
          // }


          let checked = getMapLayerVisibility(this._mapLayers, this._mapLayerIds, layer.id);
          let layerSelector = createLayerInputToggle(layer, checked);
          groupDiv.appendChild(layerSelector)
        }
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
        console.log(1)
        setLayerVisibility(e.target.checked, e.target.id);
        return
      }

      if (e.target.dataset.mapLayer) {
        console.log(2)

        let group = e.target.dataset.group;
        let groupMembers = document.querySelectorAll("[data-group]");
        for (let i = 0; i < groupMembers.length; i++) {
          if (group != "false" && groupMembers[i].dataset.group === group) {
            console.log(group)
            setLayerVisibility(e.target.checked, groupMembers[i].id);
          }
        }
        return
      }

      if (e.target.dataset.layergroup) {
        console.log("layergroup")
        let inputs = e.target.parentElement.getElementsByClassName("layer");
        console.log("inputs", inputs)
        // CHECK IF ANY OF THE BOXES ARE NOT CHECKED AND IF NOT THEM CHECK THEM ALL
        if (!getAllChecked(inputs)) {
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
          e.target.parentElement.children[0].style.backgroundImage = "url('/plus.svg')";
        }else{
          e.target.parentElement.children[0].style.backgroundImage = "url('/minus.svg')";
        }
        toggleChildren(e.target.parentElement)
        
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
  }else{
    label.innerText = (!layer.name) ? layer.id : layer.name;
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
  return boolean
}

function toggleChildren(div) {
  var children = div.children;
  if (children.length > 1 && children[2].style.display === "none") {
    for (var i = 2; i < children.length; i++) {
      if (!children[i].dataset.hidden) children[i].style.display = "block"
    }
  }else{
    for (var i = 2; i < children.length; i++) {
      children[i].style.display = "none"
    }
  }
}


function lcCreateDicrectory(directoryName) {

    let accordian = document.createElement("div");
    accordian.dataset.accordian = true;
  
    let button = document.createElement("button");
    button.style.backgroundImage = "url('/minus.svg')";    

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
  titleInputLabel.dataset.layergroup = group;
  titleInputLabel.style.display = "inline-flex";
  titleInputLabel.style.fontWeight = "inline-flex";
  titleInputLabel.textContent = group;

  titleInputContainer.appendChild(titleInput);
  titleInputContainer.appendChild(titleInputLabel);

  return titleInputContainer;

}

function lcCreateLayerToggles(layer) {

}
