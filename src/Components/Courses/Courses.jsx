import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Courses.css";
import { useNavigate } from "react-router-dom";
import imgd from "../Assets/Images/imagenotxt2.png";
import LoadingPage from "../LoadingPage/LoadingPage";
import ErrorDataFetchOverlay from "../Error/ErrorDataFetchOverlay";
import { getAllDegrees } from "../../Admin/firebase/degreeApi";
import degreedata from './degreedata.json';

const Courses = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [allLessons, setAllLessons] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  const [fetchError, setFetchError] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try { 
        // const response = await axios.get(
        //   `https://csuite-production.up.railway.app/api/courseDetail/`
        // );
        // const allCourses = response.data;

        // filtering purschased course
        const userInfo = JSON.parse(localStorage.getItem("userdata"));
        if (userInfo) {

          const res = await getAllDegrees();
          // res.forEach(degree => {
          //   if(degree.id===userInfo.applyingFor){
          //     const degree_name = degree.degree_title;
          //     const degree_desc = degree.description;
          //     const degree_price = degree.price;
          //     const degree_dp = degree.thumbnail;
          //     const alllessons= [];
          //     const degree_courses = {};
          //     degree.courses.forEach(course => {
          //       const course_lessons = {};
          //       course.lessons.forEach(lesson => {
          //         allLessons.push(lesson.title);
          //         course_lessons[lesson.title] = {
          //           name:lesson.title,
          //           type:lesson.type,
          //           duration:lesson.duration,
          //           link:lesson.link,
          //         }
          //       });
          //       degree_courses[course.title]={
          //         name:course.title,
          //         lessons:course_lessons
          //       }
          //     });
          //     setAllLessons(alllessons);
          //     // Object.values(degree_courses).map((course) => {console.log(course.lessons)})
          //     setCoursesData(degree_courses);
          //     localStorage.setItem("degree_courses", JSON.stringify(degree_courses))
          //   }
          // });
          console.log(degreedata)
          const degree = degreedata;
              const degree_name = degree.degree_title;
              const degree_desc = degree.description;
              const degree_price = degree.price;
              const degree_dp = degree.thumbnail;
              const allchapters= [];
              const degree_courses = {};
              degree.courses.forEach(course => {
                const course_lessons = {};
                course.lessons.forEach(lesson => {
                  const lesson_chapters = {};
                  let lesson_test = {};
                  lesson.chapters.forEach(chapter => {
                    allLessons.push(chapter.title);
                    lesson_chapters[chapter.title] = {
                      name:chapter.title,
                      type:chapter.type,
                      duration:chapter.duration,
                      link:chapter.link,
                    }
                  })
                  const lesson_test_questions = {};
                  if(lesson.test!=undefined){
                  lesson_test={
                    test_id : lesson.test.test_id,
                    title : lesson.test.title,
                    timelimit : lesson.test.timeLimit,
                    questions : lesson_test_questions
                  }
                  lesson.test.questions.forEach((question, index) => {
                    const options = [];
                    question.options.forEach((option) => {
                      options.push(option);
                    })
                    lesson_test_questions[index] = {
                      question: question.question,
                      options: options,
                      correctAnswer: question.correctAnswer
                    }
                  })
                }
                  course_lessons[lesson.title]={
                    name:lesson.title,
                    description:lesson.description,
                    chapters:lesson_chapters,
                    test:lesson_test
                  }
                });
                degree_courses[course.course_id]={
                  name:course.title,
                  id:course.course_id,
                  description:course.description,
                  lessons:course_lessons
                }
              });
              setAllLessons(allchapters);
              // Object.values(degree_courses).map((course) => {console.log(course.lessons)})
              setCoursesData(degree_courses);
              localStorage.setItem("degree_courses", JSON.stringify(degree_courses))
        } else {
          setFetchError(true);
          alert("User not logged in, Go to Profile page");
          console.log("No user info found in localStorage");
        }

        setIsLoading(false);
      } catch (err) {
        console.log(err);
        setIsLoading(false);
        setFetchError(true);
      }
    };
    fetchData();
  }, []);

  const resolveImagePath = (imagePath) => {
    if (
      imagePath &&
      (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
    ) {
      return imagePath;
    } else if (imagePath && imagePath.startsWith("base64")) {
      return imgd;
    } else {
      try {
        return require(`../Assets/Images/${imagePath}`);
      } catch (error) {
        return imgd;
      }
    }
  };

  const getLessonList = (lessons) => {
    const MAX_WORD_COUNT = 20;
    let totalWords = 0;
    let lessonList = [];

    for (const lessonName in lessons) {
      const lesson = lessons[lessonName];
        // console.log(`  Lesson: ${lesson.name}`);
        // console.log(`    Type: ${lesson.type}`);
        // console.log(`    Duration: ${lesson.duration}`);
        // console.log(`    Link: ${lesson.link}`);
      lessonList.push(lesson);
    }
    return lessonList;
  };

  const filterCourses = (filters) => {
    try {
      if (filters.length === 0) {
        return coursesData;
      } else {
        return coursesData.filter((course) =>
          course.lessons.some((lesson) => filters.includes(lesson.title))
        );
      }
    } catch (err) {
      console.log(err);
      setFetchError(true);
      return [];
    }
  };

  const handleFilterClick = (filter) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  const clearFilters = () => {
    setSelectedFilters([]);
  };

  const truncateDescription = (description) => {
    const words = description.split(" ");
    const truncated = words.slice(0, 15).join(" ");
    return truncated;
  };

  if (isLoading) {
    return (
      <div>
        <LoadingPage />
      </div>
    );
  }

  if (fetchError) {
    return <ErrorDataFetchOverlay />;
  }

  return (
    <>
      <div className="main-content">
        <div className="cardContainer3">
          <h2>Courses</h2>
          <div className="filterChips">
            {allLessons.map((lesson, index) => (
              <div
                key={index}
                className={`filterChip ${
                  selectedFilters.includes(lesson) ? "active" : ""
                }`}
                onClick={() => handleFilterClick(lesson)}
              >
                {lesson}
              </div>
            ))}
            {selectedFilters.length > 0 && (
              <button className="clearFilters" onClick={clearFilters}>
                Clear All
              </button>
            )}
          </div>
          <div className="courseContainer3">
            {Object.values(filterCourses(selectedFilters)).map((course) => (
              <div className="courseCard3">
                <div className="courseOverlay3">
                  <div className="courseImageBox3">
                    <img
                      src={imgd}
                      alt={course.name}
                      className="courseImage3"
                    />
                    <div className="courseImageTxt3">{course.name}</div>
                  </div>
                  <div className="courseDetails3">
                    <p>{truncateDescription("description yet to be added")}...</p>
                    <button className="courseDetailBtn3">View Details</button>
                  </div>
                </div>
                <div className="courseLessonBox3">
                  <h5>Lessons</h5>
                  {/* <ul>
                    {course.lessons.slice(0, 3).map((lesson, index) => (
                      <li key={index}>{lesson.title}</li>
                    ))}
                    {course.lessons.length > 3 && <li>...and more</li>}
                  </ul> */}
                  <ul>
                    {getLessonList(course.lessons).map((lesson, index) => (
                      <li key={index}>{lesson.name}</li>
                    ))}
                    {course.lessons.length >
                      getLessonList(course.lessons).length && (
                      <li>...and more</li>
                    )}
                  </ul>
                  <button
                    onClick={() =>
                      navigate(`/home/courseDetails/${course.id}`)
                    }
                    className="lessonDetailBtn3"
                  >
                    View Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Courses;
