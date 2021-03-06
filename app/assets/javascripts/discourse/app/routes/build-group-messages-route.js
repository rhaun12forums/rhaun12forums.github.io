import I18n from "I18n";
import UserTopicListRoute from "discourse/routes/user-topic-list";

export default (type) => {
  return UserTopicListRoute.extend({
    titleToken() {
      return I18n.t(`user.messages.${type}`);
    },

    model() {
      const groupName = this.modelFor("group").get("name");
      const username = this.currentUser.get("username_lower");
      let filter = `topics/private-messages-group/${username}/${groupName}`;
      if (this._isArchive()) {
        filter = `${filter}/archive`;
      }
      return this.store.findFiltered("topicList", { filter });
    },

    setupController() {
      this._super.apply(this, arguments);

      const groupName = this.modelFor("group").get("name");
      let channel = `/private-messages/group/${groupName}`;
      if (this._isArchive()) {
        channel = `${channel}/archive`;
      }
      this.controllerFor("user-topics-list").subscribe(channel);

      this.controllerFor("user-topics-list").setProperties({
        hideCategory: true,
        showPosters: true,
      });

      const currentUser = this.currentUser;
      this.searchService.set("searchContext", {
        type: "private_messages",
        id: currentUser.get("username_lower"),
        user: currentUser,
      });
    },

    _isArchive() {
      return type === "archive";
    },

    deactivate() {
      this.searchService.set("searchContext", null);
    },
  });
};
