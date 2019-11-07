/***
 * TODO
 * [ ] ADD ALL EXTERNAL FUNCTIONS AS IMPORTS DOM HELPERS AND MBX HELPERS
 * [ ] ADD NUMBER NEXT TO LAYER GROUP OR LAYER DIRECTORY SHOWING HOW MANY LAYERS ARE TURNED ON
 * [ ] ADD MORE DOCS
 * [ ] ADD ZOOM LEVEL VISIBILITY ON TOGGLES MAKE INACTIVE ON ZOOMEND ADD FUNCTION TO CHECK FOR VISIBILITY
 */

import * as mglHelper from "./lib/mglHelpers.js";
import * as domHelper from "./lib/domHelpers.js";


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

    directories = this._layers.reduce(function (i, layer) {
      return [...i, layer.directory]
    }, []);

    this._directories = [...new Set(directories)];

    groups = this._layers.reduce(function (i, layer) {
      if (!layer.group) layer.group = "Operational Layers"
      return [...i, layer.group]
    }, []);

    this._groups = [...new Set(groups)];

    let config = {};

    this._directories.map(function (d) {
      options.layers.map(function (layer) {
        if (layer.directory === d) {
          config[layer.directory] = {}
        }
      })
    })

    this._layers.map(function (l) {
      if (!l.group) l.group = "Operational Layers";
      config[l.directory][l.group] = []
    })

    this._layers.map(function (l) {
      config[l.directory][l.group].push(l)
    })

    this._layerControlConfig = config

    console.log(config)

    // TARGET CONFIG LAYOUT
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

    // SETUP MAIN MAPBOX CONTROL
    this._div = lcCreateButton(this._collapsed);

    // GET THE MAP LAYERS AND LAYER IDS

    mglHelper.GetActiveLayers(this._map, this._layers)

    this._mapLayers = this._map.getStyle().layers;
    this._mapLayerIds = mglHelper.GetMapLayerIds(this._mapLayers);

    //BUILD DIRECTORIES, GROUPS, LAYER TOGGLES AND LEGENDS FROM THE layerControlConfig
    for (let d in this._layerControlConfig) {

      //CREATE DIRECTORY
      let directory = d;

      let layerCount = 0;

      this._layers.map(l => {
        if (l.directory === d && !l.parent) {
          var checked = mglHelper.GetLayerVisibility(this._mapLayers, this._mapLayerIds, l.id);
          if (checked) layerCount = layerCount + 1
        }
      })

      let directoryDiv = lcCreateDicrectory(directory, layerCount);

      //CREATE TOGGLE GROUPS
      for (let g in this._layerControlConfig[d]) {

        let groupDiv = lcCreateGroup(g, this._layerControlConfig[d][g], map)

        let groupLayers = this._layerControlConfig[d][g];

        // CREATE INDIVIDUAL LAYER TOGGLES
        for (let l = 0; l < groupLayers.length; l++) {
          let layer = groupLayers[l];
          let style = mglHelper.GetStyle(this._mapLayers, layer);
          if (!layer.legend && style) {
            layer.simpleLegend = lcCreateLegend(style)
          }
          let checked = mglHelper.GetLayerVisibility(this._mapLayers, this._mapLayerIds, layer.id);
          let layerSelector = lcCreateLayerToggle(layer, checked);
          groupDiv.appendChild(layerSelector)
        }
        directoryDiv.appendChild(groupDiv);
      }

      this._div.appendChild(directoryDiv)
    }

    /****
     * ADD EVENT LISTENERS FOR THE LAYER CONTROL ALL ON THE CONTROL ITSELF
     ****/
    if (this._collapsed) {
      this._div.addEventListener("mouseenter", function (e) {
        setTimeout(function () {
          e.target.classList.remove("collapsed")
        }, 0)
        return
      });
  
      this._div.addEventListener("mouseleave", function (e) {
        e.target.classList.add("collapsed")
        return
      });
    }

    this._div.addEventListener("click", function (e) {
      // console.log(e.target);

      if (e.target.dataset.layerControl) {
        e.target.classList.remove("collapsed");
        return
      }

      if (e.target.className === "checkbox") {
        e.target.children[0].click();
        return
      }

      if (e.target.dataset.mapLayer) {
        mglHelper.SetLayerVisibility(map, e.target.checked, e.target.id);
        if (e.target.dataset.children) {
          let children = document.querySelectorAll("[data-parent]");
          for (let i = 0; i < children.length; i++) {
            if (children[i].dataset.parent === e.target.id) {
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
            mglHelper.SetLayerVisibility(map, e.target.checked, groupMembers[i].id);
          }
        }
        return
      }

      if (e.target.dataset.layergroup) {
        console.log("layergroup")
        let inputs = e.target.parentElement.querySelectorAll("[data-master-layer]");
        // CHECK IF ANY OF THE BOXES ARE NOT CHECKED AND IF NOT THEM CHECK THEM ALL
        if (!domHelper.GetAllChecked(inputs)) {
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
          e.target.parentElement.children[0].className = "collapsed"
        } else {
          e.target.parentElement.children[0].className = ""
        }
        domHelper.ToggleChildren(e.target.parentElement, 2)

        return
      }
    })

    if (this._collapsed) {
      this._map.on("click", function () {
        _this._div.classList.add("collapsed")
      })
    }

    //NEED TO SET THIS AT THE BEGINNING PASS IN CURRENT ZOOM OF MAP AND SET DISABLED PROPERTY THIS ALSO BINGS IN WEIRD THINGS WITH THE CHECK ALL GROUP BUT TACKLE THAT LATER
    this._map.on("zoomend", function () {
      let zoomendMap = this;
      let lcLayers = document.querySelectorAll("[data-master-layer]");
      lcLayers.forEach(function (l) {
        if (l.dataset.minzoom && l.dataset.minzoom > zoomendMap.getZoom()) {
          l.parentElement.style.opacity = "0.3"
          l.disabled = true
        } else {
          l.parentElement.style.opacity = "1"
          l.disabled = false
        }
      });
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

function lcCreateLayerToggle(layer, checked, index) {
  let div = document.createElement("div");
  div.className = "checkbox";
  div.title = "Map Layer";

  if (layer.hidden) {
    div.style.display = "none";
    div.dataset.hidden = true
  }

  let input = document.createElement("input");
  input.name = (!layer.name) ? layer.id : layer.name;
  input.type = "checkbox"
  input.id = layer.id;
  input.dataset.group = (layer.group) ? layer.group : false;

  if (layer.minzoom) {
    input.dataset.minzoom = layer.minzoom
  }

  if (layer.children) {
    input.dataset.children = true;
    input.dataset.masterLayer = true;
  }
  if (layer.parent) {
    input.dataset.parent = layer.parent;
  } else {
    input.dataset.masterLayer = true;
  }

  input.className = "layer slide-toggle";
  input.dataset.mapLayer = true;
  if (checked) input.checked = true;

  input.onclick = function () {
    lcSetActiveLayers(this.id, this.checked)
    lcSetLegendVisibility(this)
    lcSetDirectoryLayerCount(this);
  };

  let label = document.createElement("label");
  label.setAttribute("for", layer.id);
  let legend = document.createElement("div");
  if (layer.legend) {
    label.innerText = (!layer.name) ? layer.id : layer.name;
    legend.innerHTML = layer.legend;
    legend.className = "mgl-layerControlLegend";
    legend.dataset.layerChildLegend = "true"
    if (!checked) {
      legend.style.display = "none"
    }
  } else if (layer.simpleLegend) {
    label.innerHTML += layer.simpleLegend;
    label.innerHTML += (!layer.name) ? layer.id : layer.name;
    label.className = "mgl-layerControlLegend"
  } else {
    label.innerText = (!layer.name) ? layer.id : layer.name;
  }
  label.dataset.layerToggle = "true";
  div.appendChild(input);
  div.appendChild(label);
  div.appendChild(legend)

  return div
}

function lcSetDirectoryLayerCount(e) {
  let targetDirectory = e.closest(".mgl-layerControlDirectory")
  let targetChildren = targetDirectory.querySelectorAll("[data-master-layer]");
  let targetCount = 0;
  targetChildren.forEach(function (c) {
    if (c.checked) targetCount = targetCount + 1;
  })
  if (targetCount > 0) {
    targetDirectory.children[1].children[0].innerHTML = targetCount;
    targetDirectory.children[1].children[0].style.display = "block"
  } else {
    targetDirectory.children[1].children[0].style.display = "none"
  }
}

function lcCreateDicrectory(directoryName, layerCount) {

  let accordian = document.createElement("div");
  accordian.dataset.accordian = true;
  accordian.style.backgroundColor = "white";
  accordian.className = "mgl-layerControlDirectory";

  let button = document.createElement("button");
  button.dataset.directoryToggle = true

  accordian.appendChild(button);

  let d = document.createElement("div");
  d.className = "directory"
  d.id = directoryName.replace(" ", "");
  d.innerText = directoryName;
  d.dataset.name = directoryName;
  d.dataset.directoryToggle = true

  var counter = document.createElement("span");
  counter.style.background = "#0d84b3";
  counter.className = "mgl-layerControlDirectoryCounter";
  counter.style.display = (layerCount === 0) ? "none" : "block";
  counter.innerText = (!layerCount) ? "" : layerCount
  counter.style.float = "right";
  counter.style.color = "white";
  counter.style.padding = "1px 4px";
  d.appendChild(counter)

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
  titleInputContainer.style.margin = "4px 0 4px 8px"

  let titleInput = document.createElement("input");
  titleInput.type = "checkbox";
  let titleInputId = "layerGroup_" + group.replace(" ", "");
  titleInput.id = titleInputId;
  titleInput.style.display = "none";
  titleInput.dataset.layergroup = group;

  if (titleInputChecked) titleInput.checked = true

  let titleInputLabel = document.createElement("label");
  titleInputLabel.setAttribute("for", titleInputId);
  titleInputLabel.className = "mgl-layerControlGroupHeading"
  titleInputLabel.textContent = group;

  // let titleSettings = document.createElement("span");
  // titleSettings.style.position = "absolute";
  // titleSettings.style.right = "5px";
  // titleSettings.style.opacity = "0.8";
  // titleSettings.innerHTML = "<img src='https://icongr.am/material/dots-vertical.svg' height='24px'></img>"
  // titleInputLabel.appendChild(titleSettings);

  titleInputContainer.appendChild(titleInput);
  titleInputContainer.appendChild(titleInputLabel);

  return titleInputContainer;

}

function lcCreateButton(collapsed) {
  let div = document.createElement('div');
  div["aria-label"] = "Layer Control";
  div.dataset.layerControl = "true"
  div.className = 'mapboxgl-ctrl mapboxgl-ctrl-group mgl-layerControl';
  if (collapsed) div.classList.add("collapsed");

  return div
}

function lcCreateLegend(style) {
  let type = Object.keys(style)
  let legend = false;
  if (type.indexOf("line-color") > -1 && isString(style["line-color"])) {
    legend = `<icon class='fa fa-minus ' style='color:${style["line-color"]};margin-right:6px;'></icon>`;
  }
  if (type.indexOf("fill-color") > -1 && isString(style["fill-color"])) {
    legend = `<icon class='fa fa-square' style='color:${style["fill-color"]};margin-right:6px;'></icon>`;
  }
  if (type.indexOf("circle-color") > -1 && isString(style["circle-color"])) {
    legend = `<icon class='fa fa-circle ' style='color:${style["circle-color"]};margin-right:6px;'></icon>`;
  }

  return legend
}

function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

function lcSetActiveLayers(l, checked) {
  let _layer = l;
  let _visibility = checked;
  let params = new URLSearchParams(window.location.search);
  if (_visibility) {
    params.set(_layer, true);
    if (history.pushState) {
      let url = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + params.toString() + window.location.hash;
      window.history.pushState({
        path: url
      }, '', url);
    }
  } else {
    params.delete(_layer);
    if (history.pushState) {
      let url = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + params.toString() + window.location.hash;
      window.history.pushState({
        path: url
      }, '', url);
    }
  }
}

function lcSetLegendVisibility(e) {
  let _legend = e.parentElement.querySelectorAll("[data-layer-child-legend]");
  let _display = (!e.checked) ? "none" : "block";
  for (let i = 0; i < _legend.length; i++) {
    _legend[i].style.display = _display
  }
}