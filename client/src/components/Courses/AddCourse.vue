<template>
  <v-container
    text-xs-center
    mt-5
    pt-5
  >

    <v-layout
      row
      wrap
    >
      <v-flex
        xs12
        sm6
        offset-sm3
      >
        <h1 class="primary--text">Добавить курс</h1>
      </v-flex>
    </v-layout>

    <v-layout
      row
      wrap
    >
      <v-flex
        xs12
        sm6
        offset-sm3
      >

        <v-form
          v-model="isFormValid"
          lazy-validation
          ref="form"
          @submit.prevent="handleAddCourse"
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

          <v-layout row>
            <v-flex xs12>
              <v-btn
                :loading="loading"
                :disabled="!isFormValid || loading"
                color="info"
                type="submit"
              >
                <span
                  slot="loader"
                  class="custom-loader"
                >
                  <v-icon light>cached</v-icon>
                </span>
                Добавить</v-btn>
            </v-flex>
          </v-layout>

        </v-form>

      </v-flex>
    </v-layout>

  </v-container>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "AddCourse",
  data() {
    return {
      isFormValid: true,
      title: "",
      imageUrl: "",
      categories: [],
      description: "",
      titleRules: [
        title => !!title || "Название обязательно",
        title => title.length < 100 || "Название должно быть меньше 100 символов"
      ],
      imageRules: [image => !!image || "Изображение обязательно"],
      categoriesRules: [
        categories =>
          categories.length >= 1 || "Хотя бы одна категория обязательна"
      ],
      descRules: [
        desc => !!desc || "Описание обязательно",
        desc =>
          desc.length < 2000 || "Описание должно быть меньше 2000 символов"
      ]
    };
  },
  computed: {
    ...mapGetters(["loading", "user"])
  },
  methods: {
    handleAddCourse() {
      if (this.$refs.form.validate()) {
        this.$store.dispatch("addCourse", {
          title: this.title,
          imageUrl: this.imageUrl,
          categories: this.categories,
          description: this.description,
          creatorId: this.user._id
        });
        this.$router.push("/");
      }
    }
  }
};
</script>
