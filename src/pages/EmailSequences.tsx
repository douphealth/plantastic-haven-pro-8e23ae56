import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AppLayout from "@/components/shared/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { EMAIL_COURSES, EmailCourse } from "@/lib/emailTemplates";
import { LessonProgress, loadProgress, setLessonComplete } from "@/lib/lessons";
import { BookOpen, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmailSequences = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [progress, setProgress] = useState<LessonProgress>({});
  const [course, setCourse] = useState<EmailCourse>(EMAIL_COURSES[0]);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const requested = searchParams.get("course");
    const found = EMAIL_COURSES.find((item) => item.id === requested);
    if (found) setCourse(found);
    const lesson = Number(searchParams.get("lesson"));
    if (Number.isInteger(lesson) && lesson >= 0) setLessonIndex(lesson);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    loadProgress(user?.id).then((next) => {
      if (!cancelled) setProgress(next);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const lesson = course.emails[lessonIndex] || course.emails[0];
  const completed = new Set(progress[course.id] || []);
  const doneCount = completed.size;

  const openLesson = (nextCourse: EmailCourse, index: number) => {
    setCourse(nextCourse);
    setLessonIndex(index);
    setSearchParams({ course: nextCourse.id, lesson: String(index) });
  };

  const toggleComplete = async () => {
    setSaving(true);
    const next = await setLessonComplete(
      user?.id,
      course.id,
      lessonIndex,
      !completed.has(lessonIndex)
    );
    setProgress(next);
    setSaving(false);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div className="border-b border-border pb-5">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            Care lessons
          </h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-2xl">
            These are the same lessons published in the free guides. Pro keeps
            which ones you have finished, on this device and on your account
            once the lesson-progress migration is applied. Nothing here sends email.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-4">
            {EMAIL_COURSES.map((item) => {
              const finished = (progress[item.id] || []).length;
              return (
                <div key={item.id} className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h2 className="font-heading font-semibold text-foreground">{item.title}</h2>
                    <span className="text-xs text-muted-foreground">{finished}/{item.emails.length}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{item.description}</p>
                  <div className="space-y-1">
                    {item.emails.map((email, index) => {
                      const active = course.id === item.id && lessonIndex === index;
                      const isDone = (progress[item.id] || []).includes(index);
                      return (
                        <button
                          key={email.subject}
                          type="button"
                          onClick={() => openLesson(item, index)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 ${
                            active
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          }`}
                        >
                          <span className="truncate">{email.subject.replace(/^[^:]+:\s*/, "")}</span>
                          {isDone && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <article className="lg:col-span-8 bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> {course.title}
                </div>
                <h2 className="font-heading text-xl font-bold text-foreground mt-1">{lesson.subject}</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {lesson.readTime}
                </span>
                <Button type="button" size="sm" variant="outline" onClick={toggleComplete} disabled={saving} className="rounded-lg">
                  {completed.has(lessonIndex) ? "Mark unread" : "Mark complete"}
                </Button>
              </div>
            </div>
            <div className="bg-[#f4f6f4] p-4 sm:p-8">
              <div
                className="rounded-2xl overflow-hidden border border-[#e1e8e3] bg-white max-w-xl mx-auto"
                dangerouslySetInnerHTML={{
                  __html: lesson.html.replace(
                    /https:\/\/plantastichaven\.com\/dashboard/g,
                    "/guides"
                  ),
                }}
              />
            </div>
            <div className="px-6 py-4 border-t border-border flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{doneCount} of {course.emails.length} marked in this course</span>
              <Link to={`/guides?article=${course.id}&day=${lessonIndex}`} className="text-primary font-medium">
                Open in free guides
              </Link>
            </div>
          </article>
        </div>
      </div>
    </AppLayout>
  );
};

export default EmailSequences;
