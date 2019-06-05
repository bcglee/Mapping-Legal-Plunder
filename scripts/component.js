class Component {
    constructor (margin, width, height) {
        this.margin = margin;
        this.width = width;
        this.height = height;
        this.interaction = false;
    }

    post_load(data, map) {
        this.data = data;
        this.map = map;
    }

    enable_interactivity() {
        this.interaction = true;
    }
    
    disable_interactivity() {
        this.interaction = false;
    }
}

export default Component;