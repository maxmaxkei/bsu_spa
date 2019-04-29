<template>
  <v-container class="text-xs-center">

    <!-- User Details Card -->
    <v-flex
      sm6
      offset-sm3
    >
      <v-card
        class="white--text"
        color="secondary"
      >
        <v-layout>
          <v-flex xs5>
            <v-card-media
              height="125px"
              contain
              :src="user.avatar"
            ></v-card-media>
          </v-flex>
          <v-flex xs7>
            <v-card-title primary-title>
              <div>
                <div class="headline">{{user.username}}</div>
                <div>Зарегистрирован {{formatJoinDate(user.joinDate)}}</div>
                <div class="hidden-xs-only font-weight-thin">{{user.favorites.length}} в подписках.</div>
                <div class="hidden-xs-only font-weight-thin">{{userCourses.length}} курсов добавлено.</div>
              </div>
            </v-card-title>
          </v-flex>
        </v-layout>
      </v-card>
    </v-flex>

    <v-container v-if="!userFavorites.length">
      <v-layout
        row
        wrap
      >
        <v-flex xs12>
          <h2>Вы пока не подписаны ни на один курс.</h2>
        </v-flex>
      </v-layout>
    </v-container>

    <v-container
      class="mt-3"
      v-else
    >
      <v-flex xs12>
        <h2 class="font-weight-light">Подписки:
          <span class="font-weight-regular">({{userFavorites.length}})</span>
        </h2>
      </v-flex>
      <v-layout
        row
        wrap
      >
        <v-flex
          xs12
          sm6
          v-for="favorite in userFavorites"
          :key="favorite._id"
        >
          <v-card
            class="mt-3 ml-1 mr-2"
            hover
          >
            <v-card-media
              @click="goToCourse(favorite._id)"
              height="30vh"
              :src="favorite.imageUrl"
            ></v-card-media>
            <v-card-text>{{favorite.title}}</v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

    <v-container v-if="!userCourses.length">
      <v-layout
        row
        wrap
      >
        <v-flex xs12>
          <h2>Вы пока не добавили ни одного курса</h2>
        </v-flex>
      </v-layout>
    </v-container>

    <v-container
      class="mt-3"
      v-else
    >
      <v-flex xs12>
        <h2 class="font-weight-light">Ваши курсы
          <span class="font-weight-regular">({{userCourses.length}})</span>
        </h2>
      </v-flex>
      <v-layout
        row
        wrap
      >
        <v-flex
          xs12
          sm6
          v-for="course in userCourses"
          :key="course._id"
        >
          <v-card
            class="mt-3 ml-1 mr-2"
            hover
          >
            <v-btn
              @click="loadCourse(course)"
              color="info"
              floating
              fab
              small
              dark
            >
              <v-icon>edit</v-icon>
            </v-btn>
            <v-btn
              @click="handleDeleteUserCourse(course)"
              color="error"
              floating
              fab
              small
              dark
            >
              <v-icon>delete</v-icon>
            </v-btn>

            <v-card-media
              @click="goToCourse(course._id)"
              height="30vh"
              :src="course.imageUrl"
            ></v-card-media>
            <v-card-text>{{course.title}}</v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

    <v-dialog
      xs12
      sm6
      offset-sm3
      persistent
      v-model="editCourseDialog"
    >
      <v-card>
        <v-card-title class="headline grey lighten-2">Редактировать курс</v-card-title>
        <v-container>
          <v-form
            v-model="isFormValid"
            lazy-validation
            ref="form"
            @submit.prevent="handleUpdateUserCourse"
          >

            <!-- Title Input -->
            <v-layout row>
              <v-flex xs12>
                <v-text-field
                  :rules="titleRules"
                  v-model="title"
                  label="Название курса"
                  type="text"
                  required
                ></v-text-field>
              </v-flex>
            </v-layout>

            <!-- Image Url Input -->
            <v-layout row>
              <v-flex xs12>
                <v-text-field
                  :rules="imageRules"
                  v-model="imageUrl"
                  label="URL изображения"
                  type="text"
                  required
                ></v-text-field>
              </v-flex>
            </v-layout>

            <!-- Image Preview -->
            <v-layout row>
              <v-flex xs12>
                <img
                  :src="imageUrl"
                  height="300px"
                >
              </v-flex>
            </v-layout>

            <!-- Categories Select -->
            <v-layout row>
              <v-flex xs12>
                <v-select
                  v-model="categories"
                  :rules="categoriesRules"
                  :items="['Frontend', 'Backend', 'Web', 'Blockchain', 'QA', 'Finance', 'Technology']"
                  multiple
                  label="Категории"
                ></v-select>
              </v-flex>
            </v-layout>

            <!-- Description Text Area -->
            <v-layout row>
              <v-flex xs12>
                <v-textarea
                  :rules="descRules"
                  v-model="description"
                  label="Описание"
                  type="text"
                  required
                ></v-textarea>
              </v-flex>
            </v-layout>

            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                :disabled="!isFormValid"
                type="submit"
                class="success--text"
                flat
              >Сохранить</v-btn>
              <v-btn
                class="error--text"
                flat
                @click="editCourseDialog = false"
              >Отмена</v-btn>
            </v-card-actions>

          </v-form>
        </v-container>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
import moment from "moment";
import { mapGetters } from "vuex";

export default {
  name: "Profile",
  data() {
    return {
      editCourseDialog: false,
      isFormValid: true,
      title: "",
      imageUrl: "",
      categories: [],
      description: "",
      titleRules: [
        title => !!title || "Название не может быть пустым",
        title =>
          title.length < 100 || "Название должно быть меньше чем 100 символов"
      ],
      imageRules: [image => !!image || "Изображение обязательно"],
      categoriesRules: [
        categories => categories.length >= 1 || "Нужна хотя бы одна категория"
      ],
      descRules: [
        desc => !!desc || "Описание обязательно",
        desc =>
          desc.length < 2000 || "Описание должно быть меньше чем 2000 символов"
      ]
    };
  },
  computed: {
    ...mapGetters(["user", "userFavorites", "userCourses"])
  },
  created() {
    this.handleGetUserCourses();
  },
  methods: {
    goToCourse(id) {
      this.$router.push(`/courses/${id}`);
    },
    formatJoinDate(date) {
      return moment(new Date(date))
        .locale("ru")
        .format("ll");
    },
    handleGetUserCourses() {
      this.$store.dispatch("getUserCourses", {
        userId: this.user._id
      });
    },
    handleUpdateUserCourse() {
      if (this.$refs.form.validate()) {
        this.$store.dispatch("updateUserCourse", {
          courseId: this.courseId,
          userId: this.user._id,
          title: this.title,
          imageUrl: this.imageUrl,
          categories: this.categories,
          description: this.description
        });
        this.editCourseDialog = false;
      }
    },
    handleDeleteUserCourse(course) {
      this.loadCourse(course, false);
      const deleteCourse = window.confirm("Вы уверены?");
      if (deleteCourse) {
        this.$store.dispatch("deleteUserCourse", {
          courseId: this.courseId
        });
      }
    },
    loadCourse(
      { _id, title, imageUrl, categories, description },
      editCourseDialog = true
    ) {
      this.editCourseDialog = editCourseDialog;
      this.courseId = _id;
      this.title = title;
      this.imageUrl = imageUrl;
      this.categories = categories;
      this.description = description;
    }
  }
};
</script>
