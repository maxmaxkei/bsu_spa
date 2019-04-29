import Vue from 'vue';
import Router from 'vue-router';
import Home from './components/Home.vue';

import AddCourse from './components/Courses/AddCourse.vue';
import Courses from './components/Courses/Courses.vue';
import Course from './components/Courses/Course.vue';

import Profile from './components/Auth/Profile.vue';
import Signin from './components/Auth/Signin.vue';
import Signup from './components/Auth/Signup.vue';

import AuthGuard from './AuthGuard';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/courses',
      name: 'Courses',
      component: Courses
    },
    {
      path: '/courses/:courseId',
      name: 'Course',
      component: Course,
      props: true
    },
    {
      path: '/course/add',
      name: 'AddCourse',
      component: AddCourse,
      beforeEnter: AuthGuard
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
      beforeEnter: AuthGuard
    },
    {
      path: '/signin',
      name: 'Signin',
      component: Signin
    },
    {
      path: '/Signup',
      name: 'Signup',
      component: Signup
    }
  ]
});
