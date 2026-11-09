import { ProjectMilestoneRecord, ProjectTaskRecord } from "@/lib/db/supabase";

/**
 * Calculates authoritative, consistent project progress percentage (0 - 100)
 * based on completed milestones and tasks.
 */
export function calculateProjectProgress({
  milestones = [],
  tasks = [],
}: {
  milestones?: Array<{ status: string; progress_percentage?: number }>;
  tasks?: Array<{ status: string }>;
}): {
  progress_percentage: number;
  milestones_total: number;
  milestones_completed: number;
  tasks_total: number;
  tasks_completed: number;
} {
  const milestones_total = milestones.length;
  const milestones_completed = milestones.filter(
    (m) => m.status === "completed" || m.progress_percentage === 100
  ).length;

  const tasks_total = tasks.length;
  const tasks_completed = tasks.filter((t) => t.status === "completed").length;

  let progress = 0;

  if (milestones_total > 0 && tasks_total > 0) {
    // 70% weight on milestone progress, 30% weight on task progress
    const milestoneSum = milestones.reduce((acc, m) => {
      if (m.status === "completed") return acc + 100;
      return acc + (m.progress_percentage || 0);
    }, 0);
    const milestoneProgress = milestoneSum / milestones_total;
    const taskProgress = (tasks_completed / tasks_total) * 100;
    progress = Math.round(milestoneProgress * 0.7 + taskProgress * 0.3);
  } else if (milestones_total > 0) {
    const milestoneSum = milestones.reduce((acc, m) => {
      if (m.status === "completed") return acc + 100;
      return acc + (m.progress_percentage || 0);
    }, 0);
    progress = Math.round(milestoneSum / milestones_total);
  } else if (tasks_total > 0) {
    progress = Math.round((tasks_completed / tasks_total) * 100);
  }

  return {
    progress_percentage: Math.min(100, Math.max(0, progress)),
    milestones_total,
    milestones_completed,
    tasks_total,
    tasks_completed,
  };
}
