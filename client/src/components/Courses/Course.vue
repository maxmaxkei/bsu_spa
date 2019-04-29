<template>
  <v-container
    v-if="getCourse"
    class="mt-3"
    flexbox
    center
  >

    <v-layout
      row
      wrap
    >
      <v-flex xs12>
        <v-card hover>
          <v-card-title>
            <h1>{{getCourse.title}}</h1>
            <v-spacer></v-spacer>
            <v-btn
              @click="handleToggleLike"
              large
              icon
              v-if="user"
            >
              <v-icon
                large
                left
                :color="checkIfCourseLiked(getCourse._id) ? 'red' : 'grey'"
              >assignment_turned_in</v-icon>
              Подписаться
            </v-btn>
            <v-spacer></v-spacer>
            <h3 class="ml-3 font-weight-thin">{{getCourse.likes}} подписок</h3>
            <v-spacer></v-spacer>
            <v-icon
              @click="goToPreviousPage"
              color="info"
              large
            >arrow_back</v-icon>
          </v-card-title>

          <v-tooltip right>
            <span>Нажмите для увеличения</span>
            <v-card-media
              @click="toggleImageDialog"
              slot="activator"
              :src="getCourse.imageUrl"
              id="course__image"
            ></v-card-media>
          </v-tooltip>
          <v-dialog v-model="dialog">
            <v-card>
              <v-card-media
                :src="getCourse.imageUrl"
                height="80vh"
              ></v-card-media>
            </v-card>
          </v-dialog>

          <v-card-text>
            <span
              v-for="(category, index) in getCourse.categories"
              :key="index"
            >
              <v-chip
                class="mb-3"
                color="accent"
                text-color="white"
              >{{category}}</v-chip>
            </span>
            <h3>{{getCourse.description}}</h3>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>

    <!-- Messages Section -->
    <div class="mt-3">
      <!-- Message Input -->
      <v-layout
        class="mb-3"
        v-if="user"
      >
        <v-flex xs12>
          <v-form
            v-model="isFormValid"
            lazy-validation
            ref="form"
            @submit.prevent="handleAddCourseMessage"
          >
            <v-layout row>
              <v-flex xs12>
                <v-text-field
                  :rules="messageRules"
                  v-model="messageBody"
                  clearable
                  :append-outer-icon="messageBody && 'send'"
                  label="Добавить комментарий"
                  type="text"
                  @click:append-outer="handleAddCourseMessage"
                  prepend-icon="email"
                  required
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-form>
        </v-flex>
      </v-layout>

      <!-- Messages -->
      <v-layout
        row
        wrap
      >
        <v-flex xs12>
          <v-list
            subheader
            two-line
          >
            <v-subheader>Комментарии ({{getCourse.messages.length}})</v-subheader>

            <template v-for="message in getCourse.messages">
              <v-divider :key="message._id"></v-divider>

              <v-list-tile
                avatar
                inset
                :key="message.title"
              >
                <v-list-tile-avatar>
                  <img :src="message.messageUser.avatar">
                </v-list-tile-avatar>

                <v-list-tile-content>
                  <v-list-tile-title>
                    {{message.messageBody}}
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    {{message.messageUser.username}}
                    <span class="grey--text text--lighten-1 hidden-xs-only">{{getTimeFromNow(message.messageDate)}}</span>
                  </v-list-tile-sub-title>
                </v-list-tile-content>

                <v-list-tile-action class='hidden-xs-only'>
                  <v-icon :color="checkIfOwnMessage(message) ? 'accent' : 'grey'">chat_bubble</v-icon>
                </v-list-tile-action>

              </v-list-tile>
            </template>
          </v-list>
        </v-flex>
      </v-layout>

    </div>

  </v-container>
</template>

<script>
import moment from "moment";
import { mapGetters } from "vuex";
import {
  GET_COURSE,
  ADD_COURSE_MESSAGE,
  LIKE_COURSE,
  UNLIKE_COURSE
} from "../../queries";

export default {
  name: "Course",
  props: ["courseId"],
  data() {
    return {
      courseLiked: false,
      dialog: false,
      messageBody: "",
      isFormValid: true,
      messageRules: [
        message => !!message || "Комментарий не может быть пустым",
        message =>
          message.length < 300 || "Комментарий должен быть меньше 300 символов"
      ]
    };
  },
  apollo: {
    getCourse: {
      query: GET_COURSE,
      variables() {
        return {
          courseId: this.courseId
        };
      }
    }
  },
  computed: {
    ...mapGetters(["user", "userFavorites"])
  },
  methods: {
    getTimeFromNow(time) {
      return moment(new Date(time))
        .locale("ru")
        .fromNow();
    },
    checkIfCourseLiked(courseId) {
      if (
        this.userFavorites &&
        this.userFavorites.some(fave => fave._id === courseId)
      ) {
        this.courseLiked = true;
        return true;
      } else {
        this.courseLiked = false;
        return false;
      }
    },
    handleToggleLike() {
      if (this.courseLiked) {
        this.handleUnlikeCourse();
      } else {
        this.handleLikeCourse();
      }
    },
    handleLikeCourse() {
      const variables = {
        courseId: this.courseId,
        username: this.user.username
      };
      this.$apollo
        .mutate({
          mutation: LIKE_COURSE,
          variables,
          update: (cache, { data: { likeCourse } }) => {
            const data = cache.readQuery({
              query: GET_COURSE,
              variables: { courseId: this.courseId }
            });
            data.getCourse.likes += 1;
            cache.writeQuery({
              query: GET_COURSE,
              variables: { courseId: this.courseId },
              data
            });
          }
        })
        .then(({ data }) => {
          const updatedUser = {
            ...this.user,
            favorites: data.likeCourse.favorites
          };
          this.$store.commit("setUser", updatedUser);
        })
        .catch(err => console.error(err));
    },
    handleUnlikeCourse() {
      const variables = {
        courseId: this.courseId,
        username: this.user.username
      };
      this.$apollo
        .mutate({
          mutation: UNLIKE_COURSE,
          variables,
          update: (cache, { data: { unlikeCourse } }) => {
            const data = cache.readQuery({
              query: GET_COURSE,
              variables: { courseId: this.courseId }
            });
            data.getCourse.likes -= 1;
            cache.writeQuery({
              query: GET_COURSE,
              variables: { courseId: this.courseId },
              data
            });
          }
        })
        .then(({ data }) => {
          const updatedUser = {
            ...this.user,
            favorites: data.unlikeCourse.favorites
          };
          this.$store.commit("setUser", updatedUser);
        })
        .catch(err => console.error(err));
    },
    handleAddCourseMessage() {
      if (this.$refs.form.validate()) {
        const variables = {
          messageBody: this.messageBody,
          userId: this.user._id,
          courseId: this.courseId
        };
        this.$apollo
          .mutate({
            mutation: ADD_COURSE_MESSAGE,
            variables,
            update: (cache, { data: { addCourseMessage } }) => {
              const data = cache.readQuery({
                query: GET_COURSE,
                variables: { courseId: this.courseId }
              });
              data.getCourse.messages.unshift(addCourseMessage);
              cache.writeQuery({
                query: GET_COURSE,
                variables: { courseId: this.courseId },
                data
              });
            }
          })
          .then(({ data }) => {
            this.$refs.form.reset();
            console.log(data.addCourseMessage);
          })
          .catch(err => console.error(err));
      }
    },
    goToPreviousPage() {
      this.$router.go(-1);
    },
    toggleImageDialog() {
      if (window.innerWidth > 500) {
        this.dialog = !this.dialog;
      }
    },
    checkIfOwnMessage(message) {
      return this.user && this.user._id === message.messageUser._id;
    }
  }
};
</script>

<style scoped>
#course__image {
  height: 400px !important;
}
</style>
