import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { EMAIL_COURSES, EmailCourse } from "@/lib/emailTemplates";
import { BookOpen, Book, ChevronRight, Clock, Award, Leaf, Sun, Droplets, ShieldAlert } from "lucide-react";

const PlantGuides = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCourse, setActiveCourse] = useState<EmailCourse>(EMAIL_COURSES[0]);
  const [activeDayIdx, setActiveDayIdx] = useState<number>(0);

  // Sync state with URL search parameters for deep linking from diagnosis results
  useEffect(() => {
    const articleId = searchParams.get("article");
    const dayStr = searchParams.get("day");

    if (articleId) {
      const foundCourse = EMAIL_COURSES.find(c => c.id === articleId);
      if (foundCourse) {
        setActiveCourse(foundCourse);
        if (dayStr) {
          const dayVal = parseInt(dayStr, 10);
          if (!isNaN(dayVal) && dayVal >= 0 && dayVal < foundCourse.emails.length) {
            setActiveDayIdx(dayVal);
          } else {
            setActiveDayIdx(0);
          }
        }
      }
    }
  }, [searchParams]);

  const selectArticleAndDay = (course: EmailCourse, idx: number) => {
    setActiveCourse(course);
    setActiveDayIdx(idx);
    setSearchParams({ article: course.id, day: idx.toString() });
  };

  const currentEmail = activeCourse.emails[activeDayIdx] || activeCourse.emails[0];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="space-y-2 mb-10 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground">
              Plant Care Masterclass Guides
            </h1>
            <p className="text-sm text-muted-foreground font-body max-w-xl">
              Professional botany lessons made simple. Learn watering hygiene, lighting science, soil mixes, and pest control.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Guide Index Sidebar (Left side - 4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {EMAIL_COURSES.map((course) => {
                const isCourseActive = activeCourse.id === course.id;
                return (
                  <div key={course.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    {/* Course header */}
                    <div className={`p-4 border-b border-border bg-gradient-to-r ${
                      isCourseActive ? "from-primary/10 to-primary/5 border-l-4 border-l-primary" : "from-card to-card"
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          course.difficulty === "Beginner" 
                            ? "bg-emerald-500/10 text-emerald-600" 
                            : course.difficulty === "Intermediate" 
                              ? "bg-amber-500/10 text-amber-600" 
                              : "bg-purple-500/10 text-purple-600"
                        }`}>
                          {course.difficulty}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {course.estimatedTime}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-foreground font-heading">
                        {course.title}
                      </h3>
                      <p className="text-xxs text-muted-foreground leading-relaxed mt-1 font-body">
                        {course.description}
                      </p>
                    </div>

                    {/* Chapters/Days list */}
                    <div className="p-2 space-y-1">
                      {course.emails.map((email, idx) => {
                        const isDayActive = isCourseActive && activeDayIdx === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => selectArticleAndDay(course, idx)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                              isDayActive
                                ? "bg-primary text-white shadow-sm"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            }`}
                          >
                            <span className="truncate max-w-[250px]">
                              {email.subject.split(": ")[1] || email.subject}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reading Panel (Right side - 8 cols) */}
            <div className="lg:col-span-8 bg-card border border-border rounded-2xl shadow-card overflow-hidden flex flex-col min-h-[500px]">
              {/* Reading Top bar */}
              <div className="px-6 py-4 bg-muted border-b border-border flex items-center justify-between">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" /> Reading Lesson
                </span>
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1 font-body">
                  <Clock className="w-3 h-3" /> {currentEmail.readTime}
                </span>
              </div>

              {/* Renders the beautifully formatted premium HTML newsletter mailer directly */}
              <div className="flex-grow bg-[#f4f6f4] p-4 sm:p-8 overflow-y-auto">
                <div 
                  className="rounded-2xl overflow-hidden border border-[#e1e8e3] bg-white shadow-sm max-w-xl mx-auto"
                  dangerouslySetInnerHTML={{ 
                    __html: currentEmail.html
                      // Replace hardcoded links to our dashboard inside guides to point to the local pages
                      .replace(/https:\/\/plantastichaven\.com\/dashboard/g, "/diagnose")
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PlantGuides;
