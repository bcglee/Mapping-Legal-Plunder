class Component {
    constructor (margin, width, height) {
        this.margin = margin;
        this.width = width;
        this.height = height;
    }

    post_load(data, map) {
        this.data = data;
        this.map = map;
    }
}

export default Component;