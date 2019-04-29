const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createToken = (user, secret, expiresIn) => {
  const { username, email } = user;
  return jwt.sign({ username, email }, secret, { expiresIn });
};

module.exports = {
  Query: {
    getCurrentUser: async (_, args, { User, currentUser }) => {
      if (!currentUser) {
        return null;
      }
      const user = await User.findOne({
        username: currentUser.username
      }).populate({
        path: 'favorites',
        model: 'Course'
      });
      return user;
    },
    getCourses: async (_, args, { Course }) => {
      const courses = await Course.find({})
        .sort({ createdDate: 'desc' })
        .populate({
          path: 'createdBy',
          model: 'User'
        });
      return courses;
    },
    getUserCourses: async (_, { userId }, { Course }) => {
      const courses = await Course.find({
        createdBy: userId
      });
      return courses;
    },
    getCourse: async (_, { courseId }, { Course }) => {
      const course = await Course.findOne({ _id: courseId }).populate({
        path: 'messages.messageUser',
        model: 'User'
      });
      return course;
    },
    searchCourses: async (_, { searchTerm }, { Course }) => {
      if (searchTerm) {
        const searchResults = await Course.find(
          // Perform text search for search value of 'searchTerm'
          { $text: { $search: searchTerm } },
          // Assign 'searchTerm' a text score to provide best match
          { score: { $meta: 'textScore' } }
          // Sort results according to that textScore (as well as by likes in descending order)
        )
          .sort({
            score: { $meta: 'textScore' },
            likes: 'desc'
          })
          .limit(5);
        return searchResults;
      }
    },
    infiniteScrollCourses: async (_, { pageNum, pageSize }, { Course }) => {
      let courses;
      if (pageNum === 1) {
        courses = await Course.find({})
          .sort({ createdDate: 'desc' })
          .populate({
            path: 'createdBy',
            model: 'User'
          })
          .limit(pageSize);
      } else {
        // If page number is greater than one, figure out how many documents to skip
        const skips = pageSize * (pageNum - 1);
        courses = await Course.find({})
          .sort({ createdDate: 'desc' })
          .populate({
            path: 'createdBy',
            model: 'User'
          })
          .skip(skips)
          .limit(pageSize);
      }
      const totalDocs = await Course.countDocuments();
      const hasMore = totalDocs > pageSize * pageNum;
      return { courses, hasMore };
    }
  },
  Mutation: {
    addCourse: async (
      _,
      { title, imageUrl, categories, description, creatorId },
      { Course }
    ) => {
      const newCourse = await new Course({
        title,
        imageUrl,
        categories,
        description,
        createdBy: creatorId
      }).save();
      return newCourse;
    },
    updateUserCourse: async (
      _,
      { courseId, userId, title, imageUrl, categories, description },
      { Course }
    ) => {
      const course = await Course.findOneAndUpdate(
        // Find course by courseId and createdBy
        { _id: courseId, createdBy: userId },
        { $set: { title, imageUrl, categories, description } },
        { new: true }
      );
      return course;
    },
    deleteUserCourse: async (_, { courseId }, { Course }) => {
      const course = await Course.findOneAndRemove({ _id: courseId });
      return course;
    },
    addCourseMessage: async (
      _,
      { messageBody, userId, courseId },
      { Course }
    ) => {
      const newMessage = {
        messageBody,
        messageUser: userId
      };
      const course = await Course.findOneAndUpdate(
        // find course by id
        { _id: courseId },
        // prepend (push) new message to beginning of messages array
        { $push: { messages: { $each: [newMessage], $position: 0 } } },
        // return fresh document after update
        { new: true }
      ).populate({
        path: 'messages.messageUser',
        model: 'User'
      });
      return course.messages[0];
    },
    likeCourse: async (_, { courseId, username }, { Course, User }) => {
      // Find Course, add 1 to its 'like' value
      const course = await Course.findOneAndUpdate(
        { _id: courseId },
        { $inc: { likes: 1 } },
        { new: true }
      );
      // Find User, add id of course to its favorites array (which will be populated as Courses)
      const user = await User.findOneAndUpdate(
        { username },
        { $addToSet: { favorites: courseId } },
        { new: true }
      ).populate({
        path: 'favorites',
        model: 'Course'
      });
      // Return only likes from 'course' and favorites from 'user'
      return { likes: course.likes, favorites: user.favorites };
    },
    unlikeCourse: async (_, { courseId, username }, { Course, User }) => {
      // Find Course, add -1 to its 'like' value
      const course = await Course.findOneAndUpdate(
        { _id: courseId },
        { $inc: { likes: -1 } },
        { new: true }
      );
      // Find User, remove id of course from its favorites array (which will be populated as Courses)
      const user = await User.findOneAndUpdate(
        { username },
        { $pull: { favorites: courseId } },
        { new: true }
      ).populate({
        path: 'favorites',
        model: 'Course'
      });
      // Return only likes from 'course' and favorites from 'user'
      return { likes: course.likes, favorites: user.favorites };
    },
    signinUser: async (_, { username, password }, { User }) => {
      const user = await User.findOne({ username });
      if (!user) {
        throw new Error('User not found');
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }
      return { token: createToken(user, process.env.SECRET, '1hr') };
    },
    signupUser: async (_, { username, email, password }, { User }) => {
      const user = await User.findOne({ username });
      if (user) {
        throw new Error('User already exists');
      }
      const newUser = await new User({
        username,
        email,
        password
      }).save();
      return { token: createToken(newUser, process.env.SECRET, '1hr') };
    }
  }
};
