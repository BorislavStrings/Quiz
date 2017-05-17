define(function() {

    return {
        TopicClass: function(name, description, image, values) {
            this.name = name;
            this.description = description;
            this.image = image;
            this.values = values;
        },

        TopicMeasure: function(id, name) {
            this.id = id;
            this.name = name;
        },

        Question: function(name, category_id, category_name, answers, order) {
            this.text = name;
            this.category_id = category_id;
            this.category_name = category_name;
            this.answers = answers;
            this.order = order;
        },
        QuestionAnswer: function(name, value, order) {
            this.text = name;
            this.category_value = value;
            this.order = order;
        }
    }
});