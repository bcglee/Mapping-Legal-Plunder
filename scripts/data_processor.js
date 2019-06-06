class DataProcessor {
    constructor(data, locations, categories) {
        // 
        // constants
        // 

        // store all data
        this.data = data;

        // default state for each filter
        this.all_towns = locations.map(d => d.town); // map fn creates array of selected column
        this.all_categories = categories.map(d => d['object category']); // brackets needed here due to space
        [this.earliest, this.latest] = d3.extent(data, d => d.date_full);

        //
        // current filters
        //

        this.selected_towns = this.all_towns;
        this.selected_categories = this.all_categories;
        [this.selected_start, this.selected_end] = [this.earliest, this.latest];
    }

    // to reset a filter, pass no arguments
    filter_towns() {
        if (arguments.length) {
            this.selected_towns = Array.from(arguments);
        }
        else { // no arguments passed, reset to default
            this.selected_towns = this.all_towns;
        }
        return this.apply_filters();
    }

    filter_categories() {
        if (arguments.length) {
            this.selected_categories = Array.from(arguments);
        }
        else { // no arguments passed, reset to default
            this.selected_categories = this.all_categories;
        }
        return this.apply_filters();
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
            .filter(d => this.selected_towns.includes(d.town))
            .filter(d => this.selected_categories.includes(d.object_category))
            .filter(d => d.date_full >= this.selected_start && d.date_full <= this.selected_end);
    }
}

export default DataProcessor;
