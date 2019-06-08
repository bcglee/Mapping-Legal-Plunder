class TownSelector {
    constructor (locations, plunder) {
        this.locations = locations.map(d => d.town);
        this.plunder = plunder;
        this.checkboxes = [];
        this.init();
    }

    init() {
        var cbox;
        var label;
        var id;
        var selector_div = document.querySelector("#townSelector");
        for (var i=0; i < this.locations.length; i++) {
            id = "town" + i;

            cbox = document.createElement("input");
            cbox.setAttribute("type", "checkbox");
            cbox.setAttribute("id", id);
            cbox.setAttribute("name", "townSelector");
            cbox.setAttribute("checked", "checked");
            cbox.onclick = () => this.filter();
            // cbox.onclick = () => {
            //     var selected_nodes = document.querySelectorAll("input[name='townSelector']:checked");
            //     for (var i = 0; i < selected_nodes.length; i++) {
            //         var accessor = 'label[for=' + selected_nodes[i].id + ']';
            //         var selected = document.querySelector(accessor).innerHTML;
            //         this.plunder.filter_towns(selected);
            //     }
            // }

            label = document.createElement("label");
            label.setAttribute("for", id);
            label.appendChild(document.createTextNode(this.locations[i]));
            
            selector_div.appendChild(cbox);
            selector_div.appendChild(label);
            // selector_div.appendChild(document.createElement("br"));
            this.checkboxes.push(cbox);
        }
        
        var buttons_div = document.querySelector("#townButtons");

        var deselect_all = document.createElement("button");
        var deselect_all_text = document.createTextNode("deselect all");
        deselect_all.appendChild(deselect_all_text);
        deselect_all.addEventListener("click", () => this.deselect_all());
        buttons_div.appendChild(deselect_all);
        
        var select_all = document.createElement("button");
        var select_all_text = document.createTextNode("select all");
        select_all.appendChild(select_all_text);
        select_all.addEventListener("click", () => this.select_all());
        buttons_div.appendChild(select_all);
    }

    select_all() {
        for (var i = 0; i < this.checkboxes.length; i++) {
            this.checkboxes[i].checked = true;
        }
        this.filter();
    }

    deselect_all() {
        for (var i = 0; i < this.checkboxes.length; i++) {
            this.checkboxes[i].checked = false;
        }
        this.filter();
    }

    filter() {
        // var selected_nodes = document.querySelectorAll("input[name='townSelector']:checked");
        // for (var i = 0; i < selected_nodes.length; i++) {
        //     var accessor = 'label[for=' + selected_nodes[i].id + ']';
        //     var selected = document.querySelector(accessor).innerHTML;
        //     this.plunder.filter_towns(selected);
        // }
        for (var i = 0; i < this.checkboxes.length; i++) { // could be quite slow...
            var accessor = 'label[for=' + this.checkboxes[i].id + ']';
            var state = this.checkboxes[i].checked;
            var selected = document.querySelector(accessor).innerHTML;
            this.plunder.filter_towns(selected, state);
        }
    }
}

export default TownSelector;
