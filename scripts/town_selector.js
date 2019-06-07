class TownSelector {
    constructor (locations, plunder) {
        this.locations = locations.map(d => d.town);
        this.plunder = plunder;
        this.init();
    }

    init() {
        var cbox;
        var label;
        var id;
        for (var i=0; i < this.locations.length; i++) {
            id = "town" + i;

            cbox = document.createElement("input");
            cbox.setAttribute("type", "checkbox");
            cbox.setAttribute("id", id);
            cbox.setAttribute("name", "townSelector");
            cbox.setAttribute("checked", "checked");
            // cbox.onclick = this.filter;
            cbox.onclick = () => {
                var selected_nodes = document.querySelectorAll("input[name='townSelector']:checked");
                for (var i = 0; i < selected_nodes.length; i++) {
                    var accessor = 'label[for=' + selected_nodes[i].id + ']';
                    var selected = document.querySelector(accessor).innerHTML;
                    this.plunder.filter_towns(selected);
                }
            }

            label = document.createElement("label");
            label.setAttribute("for", id);
            label.appendChild(document.createTextNode(this.locations[i]));
            
            document.body.appendChild(document.createElement("br"));
            document.body.appendChild(cbox);
            document.body.appendChild(label);
        }
    }
}

export default TownSelector;

// TODO: select all/deselect all