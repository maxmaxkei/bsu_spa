import { gql } from 'apollo-boost';

export const GET_COURSES = gql`
  query {
    getCourses {
      _id
      title
      imageUrl
    }
  }
`;

export const GET_COURSE = gql`
  query($courseId: ID!) {
    getCourse(courseId: $courseId) {
      _id
      title
      imageUrl
      categories
      description
      likes
      createdDate
      messages {
        _id
        messageBody
        messageDate
        messageUser {
          _id
          username
          avatar
        }
      }
    }
  }
`;

export const SEARCH_COURSES = gql`
  query($searchTerm: String) {
    searchCourses(searchTerm: $searchTerm) {
      _id
      title
      description
      imageUrl
      likes
    }
  }
`;

/* User Queries */
export const GET_CURRENT_USER = gql`
  query {
    getCurrentUser {
      _id
      username
      email
      password
      avatar
      joinDate
      favorites {
        _id
        title
        imageUrl
      }
    }
  }
`;

export const GET_USER_COURSES = gql`
  query($userId: ID!) {
    getUserCourses(userId: $userId) {
      _id
      title
      imageUrl
      description
      categories
      createdDate
      likes
    }
  }
`;

export const INFINITE_SCROLL_COURSES = gql`
  query($pageNum: Int!, $pageSize: Int!) {
    infiniteScrollCourses(pageNum: $pageNum, pageSize: $pageSize) {
      hasMore
      courses {
        _id
        title
        imageUrl
        categories
        description
        likes
        createdDate
        messages {
          _id
        }
        createdBy {
          _id
          username
          avatar
        }
      }
    }
  }
`;

/* Courses Mutations */
export const ADD_COURSE = gql`
  mutation(
    $title: String!
    $imageUrl: String!
    $categories: [String]!
    $description: String!
    $creatorId: ID!
  ) {
    addCourse(
      title: $title
      imageUrl: $imageUrl
      categories: $categories
      description: $description
      creatorId: $creatorId
    ) {
      _id
      title
      imageUrl
      categories
      description
    }
  }
`;

export const UPDATE_USER_COURSE = gql`
  mutation(
    $courseId: ID!
    $userId: ID!
    $title: String!
    $imageUrl: String!
    $categories: [String]!
    $description: String!
  ) {
    updateUserCourse(
      courseId: $courseId
      userId: $userId
      title: $title
      imageUrl: $imageUrl
      categories: $categories
      description: $description
    ) {
      _id
      title
      imageUrl
      description
      categories
      createdDate
      likes
      createdBy {
        _id
        avatar
      }
    }
  }
`;

export const DELETE_USER_COURSE = gql`
  mutation($courseId: ID!) {
    deleteUserCourse(courseId: $courseId) {
      _id
    }
  }
`;

export const ADD_COURSE_MESSAGE = gql`
  mutation($messageBody: String!, $userId: ID!, $courseId: ID!) {
    addCourseMessage(
      messageBody: $messageBody
      userId: $userId
      courseId: $courseId
    ) {
      _id
      messageBody
      messageDate
      messageUser {
        _id
        username
        avatar
      }
    }
  }
`;

export const LIKE_COURSE = gql`
  mutation($courseId: ID!, $username: String!) {
    likeCourse(courseId: $courseId, username: $username) {
      likes
      favorites {
        _id
        title
        imageUrl
      }
    }
  }
`;

export const UNLIKE_COURSE = gql`
  mutation($courseId: ID!, $username: String!) {
    unlikeCourse(courseId: $courseId, username: $username) {
      likes
      favorites {
        _id
        title
        imageUrl
      }
    }
  }
`;

/* User Mutations */
export const SIGNIN_USER = gql`
  mutation($username: String!, $password: String!) {
    signinUser(username: $username, password: $password) {
      token
    }
  }
`;

export const SIGNUP_USER = gql`
  mutation($username: String!, $email: String!, $password: String!) {
    signupUser(username: $username, email: $email, password: $password) {
      token
    }
  }
`;
