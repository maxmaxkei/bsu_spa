<template>
  <v-container
    fluid
    grid-list-xl
  >

    <v-layout
      row
      wrap
      v-if="infiniteScrollCourses"
    >
      <v-flex
        xs12
        sm6
        v-for="course in infiniteScrollCourses.courses"
        :key="course._id"
      >
        <v-card hover>
          <v-card-media
            @click.native="goToCourse(course._id)"
            :src="course.imageUrl"
            height="30vh"
            lazy
          ></v-card-media>

          <v-card-actions>
            <v-card-title primary>
              <div>
                <div class="headline">{{course.title}}</div>
                <span class="grey--text">{{course.likes}} подписок - {{course.messages.length}} комментариев</span>
              </div>
            </v-card-title>
            <v-spacer></v-spacer>
            <v-btn
              @click="showCourseCreator = !showCourseCreator"
              icon
            >
              <v-icon>{{`keyboard_arrow_${showCourseCreator ? 'up' : 'down'}`}}</v-icon>
            </v-btn>
          </v-card-actions>

          <v-slide-y-transition>
            <v-card-text
              v-show="showCourseCreator"
              class="grey lighten-4"
            >
              <v-list-tile avatar>
                <v-list-tile-avatar>
                  <img :src="course.createdBy.avatar">
                </v-list-tile-avatar>

                <v-list-tile-content>
                  <v-list-tile-title class="text--primary">{{course.createdBy.username}}</v-list-tile-title>
                  <v-list-tile-sub-title class="font-weight-thin">Добавлено {{formatCreatedDate(course.createdDate)}}</v-list-tile-sub-title>
                </v-list-tile-content>

                <v-list-tile-action>
                  <v-btn
                    icon
                    ripple
                  >
                    <v-icon color="grey lighten-1">info</v-icon>
                  </v-btn>
                </v-list-tile-action>
              </v-list-tile>
            </v-card-text>
          </v-slide-y-transition>

        </v-card>
      </v-flex>
    </v-layout>

    <v-layout
      v-if="showMoreEnabled"
      column
    >
      <v-flex xs12>
        <v-layout
          justify-center
          row
        >
          <v-btn
            color="info"
            @click="showMoreCourses"
          >Показать еще</v-btn>
        </v-layout>
      </v-flex>
    </v-layout>

  </v-container>
</template>

<script>
import moment from "moment";
import { INFINITE_SCROLL_COURSES } from "../../queries";

const pageSize = 2;

export default {
  name: "Courses",
  data() {
    return {
      pageNum: 1,
      showCourseCreator: false
    };
  },
  apollo: {
    infiniteScrollCourses: {
      query: INFINITE_SCROLL_COURSES,
      variables: {
        pageNum: 1,
        pageSize
      }
    }
  },
  computed: {
    showMoreEnabled() {
      return this.infiniteScrollCourses && this.infiniteScrollCourses.hasMore;
    }
  },
  methods: {
    goToCourse(courseId) {
      this.$router.push(`/courses/${courseId}`);
    },
    formatCreatedDate(date) {
      return moment(new Date(date))
        .locale("ru")
        .format("ll");
    },
    showMoreCourses() {
      this.pageNum += 1;
      this.$apollo.queries.infiniteScrollCourses.fetchMore({
        variables: {
          pageNum: this.pageNum,
          pageSize
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          const newCourses = fetchMoreResult.infiniteScrollCourses.courses;
          const hasMore = fetchMoreResult.infiniteScrollCourses.hasMore;

          return {
            infiniteScrollCourses: {
              __typename: prevResult.infiniteScrollCourses.__typename,
              courses: [
                ...prevResult.infiniteScrollCourses.courses,
                ...newCourses
              ],
              hasMore
            }
          };
        }
      });
    }
  }
};
</script>
