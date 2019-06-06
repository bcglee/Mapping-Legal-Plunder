class TownSelector {
    constructor (locations) {
        this.locations = locations.map(d => d.town);
        this.checkboxes = [];
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
            cbox.onclick = this.filter();

            label = document.createElement("label");
            label.setAttribute("for", id);
            label.appendChild(document.createTextNode(this.locations[i]));
            
            document.body.appendChild(document.createElement("br"));
            document.body.appendChild(cbox);
            document.body.appendChild(label);

            this.checkboxes.push(cbox);
        }
    }

    filter() {
        var selected = document.querySelectorAll("input[name='townSelector']:checked");
        console.log(selected);
    }
}

export default TownSelector;
