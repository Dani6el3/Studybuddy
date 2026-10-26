import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { courses } from "../data/courses";
import { topicKey } from "../lib/study";
import { PageHead, ProgressBar } from "../components/UI";
export default function Courses({ data, update, code }) {
  const course = courses.find((c) => c.code === code);
  if (code && !course)
    return (
      <>
        <PageHead title="Course not found" />
        <a href="#courses">Back to courses</a>
      </>
    );
  if (course)
    return (
      <>
        <a className="back-link" href="#courses">
          <ArrowLeft size={16} />
          All courses
        </a>
        <PageHead
          eyebrow={`${course.code} · ${course.credits} CREDITS · ${course.status}`}
          title={course.title}
        >
          {course.summary}
        </PageHead>
        <div className="card">
          <h2>Your four-week topic cycle</h2>
          <p className="section-copy">
            Check a topic when you feel confident. Open it to build your own
            study toolkit.
          </p>
          <ProgressBar
            value={
              course.topics.filter((_, i) => data.topics[topicKey(code, i)])
                .length
            }
          />
          {course.topics.map((topic, i) => (
            <div className="topic-row" key={topic}>
              <input
                type="checkbox"
                aria-label={`Complete ${topic}`}
                checked={!!data.topics[topicKey(code, i)]}
                onChange={(e) =>
                  update((d) => ({
                    ...d,
                    topics: {
                      ...d.topics,
                      [topicKey(code, i)]: e.target.checked,
                    },
                  }))
                }
              />
              <a href={`#courses/${encodeURIComponent(code)}/${i}`}>
                <small>WEEK {i + 1} OF CYCLE</small>
                {topic}
              </a>
              <ArrowRight size={17} />
            </div>
          ))}
        </div>
      </>
    );
  return (
    <>
      <PageHead
        eyebrow="YOUR COURSE LIBRARY"
        title="Build understanding, topic by topic."
      >
        Six courses. Four weeks of topics. A space to make each one your own.
      </PageHead>
      <div className="grid-cards">
        {courses.map((c) => {
          const done = c.topics.filter(
            (_, i) => data.topics[topicKey(c.code, i)],
          ).length;
          return (
            <a
              className="card course-card"
              key={c.code}
              href={`#courses/${encodeURIComponent(c.code)}`}
            >
              <div className="row spread">
                <span className="course-chip">{c.code}</span>
                <span className="meta">
                  {c.credits} credits · {c.status}
                </span>
              </div>
              <h2>{c.title}</h2>
              <p>{c.summary}</p>
              <div className="course-progress">
                <div className="row spread">
                  <span>{done} of 4 topics completed</span>
                  <BookOpen size={16} />
                </div>
                <ProgressBar
                  value={done}
                  label={`${c.code} topics completed`}
                />
              </div>
            </a>
          );
        })}
      </div>
    </>
  );
}
