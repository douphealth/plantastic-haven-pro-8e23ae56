import { supabase } from "@/integrations/supabase/client";
import { EMAIL_COURSES } from "@/lib/emailTemplates";

export type LessonProgress = Record<string, number[]>;

const STORAGE_KEY = "plantastichaven_lesson_progress";

export function readLocalProgress(): LessonProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as LessonProgress;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writeLocalProgress(progress: LessonProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function mergeProgress(
  left: LessonProgress,
  right: LessonProgress
): LessonProgress {
  const courseIds = new Set([...Object.keys(left), ...Object.keys(right)]);
  const merged: LessonProgress = {};
  for (const courseId of courseIds) {
    merged[courseId] = [
      ...new Set([...(left[courseId] || []), ...(right[courseId] || [])]),
    ].sort((a, b) => a - b);
  }
  return merged;
}

export function nextIncomplete(progress: LessonProgress) {
  for (const course of EMAIL_COURSES) {
    const done = new Set(progress[course.id] || []);
    const index = course.emails.findIndex((_, lessonIndex) => !done.has(lessonIndex));
    if (index >= 0) {
      return {
        courseId: course.id,
        index,
        title: course.title,
        subject: course.emails[index].subject,
      };
    }
  }
  return null;
}

export async function loadProgress(userId?: string): Promise<LessonProgress> {
  const local = readLocalProgress();
  if (!userId) return local;

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("course_id, lesson_index")
    .eq("user_id", userId);

  if (error || !data) return local;

  const remote: LessonProgress = {};
  for (const row of data) {
    remote[row.course_id] = remote[row.course_id] || [];
    remote[row.course_id].push(row.lesson_index);
  }

  const merged = mergeProgress(local, remote);
  writeLocalProgress(merged);
  return merged;
}

export async function setLessonComplete(
  userId: string | undefined,
  courseId: string,
  lessonIndex: number,
  completed: boolean
) {
  const current = readLocalProgress();
  const existing = new Set(current[courseId] || []);
  if (completed) existing.add(lessonIndex);
  else existing.delete(lessonIndex);
  const next = {
    ...current,
    [courseId]: [...existing].sort((a, b) => a - b),
  };
  writeLocalProgress(next);

  if (!userId) return next;

  if (completed) {
    const { error } = await supabase.from("lesson_progress").upsert(
      {
        user_id: userId,
        course_id: courseId,
        lesson_index: lessonIndex,
      },
      { onConflict: "user_id,course_id,lesson_index" }
    );
    if (error) return next;
  } else {
    await supabase
      .from("lesson_progress")
      .delete()
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .eq("lesson_index", lessonIndex);
  }

  return next;
}
