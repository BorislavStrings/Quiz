define(function() {

    return {
        JobSection: function (name, icon, color, data, id) {
            this.id = id;
            this.name = name;
            this.icon = icon;
            this.color = color;
            this.data = data;
        },

        JobTagsObj: function (id, name, tag_id, group_id, level_id, min_experience, max_experience) {
            this.id = id;
            this.name = name;
            this.tag_id = tag_id;
            this.group_id = group_id;
            this.level_id = level_id;
            this.min_experience = min_experience;
            this.max_experience = max_experience;
        },

        LocationObj: function (id, place_id, name, lng, lat) {
            this.id = id;
            this.place_id = place_id;
            this.name = name;
            this.lng = lng;
            this.lat = lat;
        },

        softSkills: function (id, skill_id, name, level_id, comment) {
            this.id = id;
            this.skill_id = skill_id;
            this.name = name;
            this.level_id = level_id;
            this.comment = comment;
        },

        foreignLanguage: function (id, language_id, name, level, comment) {
            this.id = id;
            this.language_id = language_id;
            this.name = name;
            this.level_id = level;
            this.comment = comment;
        },


        tagGroup: function (group_id, group_name, tags) {
            this.id = group_id;
            this.name = group_name;
            this.tags = tags;

            this.addTag = function (tag) {
                this.tags.push(tag);
            }
        },

        tagNode: function (id, name, children, parent_id) {
            this.id = id;
            this.name = name;
            this.children = children || [];
            this.parent_id = parent_id || 0;

            this.addChildren = function (child) {
                this.children.push(child);
            }
        },

        createThree: function (data) {
            var group = this.createGroups(data);
            var that = this;
            $.each(data, function (inx, row) {
                var children = that.createThree(row.children);
                $.each(group, function (inx, item) {
                    $.each(item.tags, function (inx, tag) {
                        if (tag.id == row.id) {
                            tag.children = children;

                            return false;
                        }
                    });
                });
            });

            return group;
        },

        createGroups: function (data) {

            var that = this;
            var groups = [];
            $.each(data, function (inx, tag) {

                // check for existing group
                var current_group = {};

                $.each(groups, function (inx, group) {
                    if (group.id == tag.group_id) {
                        current_group = group;

                        return false;
                    }
                });

                if (!(current_group instanceof that.tagGroup)) {
                    current_group = new that.tagGroup(tag.group_id, tag.group_name, []);
                    groups.push(current_group);
                }

                current_group.addTag(new that.tagNode(tag.id, tag.name, [], 0));
            });

            return groups;
        }
    }
});