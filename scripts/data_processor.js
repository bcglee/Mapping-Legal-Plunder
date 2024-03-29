class DataProcessor {
    constructor() {

    }

    post_load(data, locations, categories) {
        //
        // constants
        //

        // store all data
        this.data = data;

        // default state for each filter
        var town_array = locations.map(d => d.town); // get array of town names
        this.selected_towns = {}; // create Object (js equiv of python Dictionary) of towns
        this.create_obj(town_array, this.selected_towns);
        var category_array = categories.map(d => d['object category']); // brackets needed here due to space
        this.selected_categories = {};
        this.create_obj(category_array, this.selected_categories);
        [this.earliest, this.latest] = d3.extent(data, d => d.date_full);
        [this.selected_start, this.selected_end] = [this.earliest, this.latest];
    }

    // to reset a filter, pass no arguments
    filter_towns() {
        if (arguments.length) {
            var town = arguments[0];
            var state = arguments[1];
            this.selected_towns[town] = state;
        }
        else { // no arguments passed, reset to default
            this.selected_towns = this.reset_obj(this.selected_towns);
        }
        return this.apply_filters();
    }

    // first argument category, second argument state (boolean), third
    // argument don't apply filters (boolean)
    filter_categories() {
        if (arguments.length) {
            var cat = arguments[0];
            var state = arguments[1];
            this.selected_categories[cat] = state;
        }
        else { // no arguments passed, reset to default
            this.selected_categories = this.reset_obj(this.selected_categories);
        }
        if (!arguments[2]) {
            return this.apply_filters();
        }
    }

    get_categories() {
        var cat_array = [];
        for (const key in this.selected_categories) {
            // if (this.selected_categories.hasOwnProperty(key)) {
                if (this.selected_categories[key]) {
                    cat_array.push(key);
                }
            // }
        }
        return cat_array;
    }

    filter_time() {
        if (arguments.length) {
            this.selected_start = arguments[0];
            this.selected_end = arguments[1];
        }
        else { // no arguments passed, reset to default
            this.selected_start = this.earliest;
            this.selected_end = this.latest;
        }
        return this.apply_filters();
    }

    // apply filters to all data
    apply_filters() {
        return this.data
            .filter(d => this.selected_towns[d.town])
            .filter(d => this.selected_categories[d.object_category])
            .filter(d => d.date_full >= this.selected_start && d.date_full <= this.selected_end);
    }

    // utility functions
    flip(val) {
        return !val;
    }

    create_obj(arr, obj) {
        for (const item of arr) {
            obj[item] = true;
        }
    }

    reset_obj(obj) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                obj[key] = true;
            }
        }
        return obj;
    }
}

export default DataProcessor;
