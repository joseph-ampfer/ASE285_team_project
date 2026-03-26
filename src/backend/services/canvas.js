
export function getCanvasApiBase() {
  return (
    process.env.CANVAS_BASE_URL ||
    process.env.CANVAS_API_BASE_URL ||
    'https://canvas.instructure.com/api/v1'
  );
}

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Verify token: GET /users/self
 */
export async function verifyToken(token) {
  if (!token || !String(token).trim()) {
    return { ok: false, error: 'No token' };
  }
  try {
    const res = await fetch(`${getCanvasApiBase()}/users/self`, {
      headers: headers(token),
    });
    if (!res.ok) {
      return { ok: false, error: `Canvas API ${res.status}` };
    }
    const user = await res.json();
    return { ok: true, user };
  } catch (err) {
    return { ok: false, error: err.message || 'Network error' };
  }
}

/**
 * List courses: GET /courses — only current (available)
 */
async function getCourses(token) {
  if (!token || !String(token).trim()) {
    return { ok: false, error: 'No token' };
  }
  try {
    const url = `${getCanvasApiBase()}/courses?per_page=50&state[]=available`;
    const res = await fetch(url, { headers: headers(token) });
    if (!res.ok) {
      return { ok: false, error: `Canvas API ${res.status}` };
    }
    const courses = await res.json();
    const list = Array.isArray(courses) ? courses : [];
    return { ok: true, courses: list };
  } catch (err) {
    return { ok: false, error: err.message || 'Network error' };
  }
}

function parseNextPageUrl(linkHeader) {
  if (!linkHeader || typeof linkHeader !== 'string') return null;
  for (const part of linkHeader.split(',')) {
    const m = /<([^>]+)>;\s*rel="next"/.exec(part.trim());
    if (m) return m[1].trim();
  }
  return null;
}

function resolveCanvasRequestUrl(nextUrl) {
  if (!nextUrl) return null;
  if (/^https?:\/\//i.test(nextUrl)) return nextUrl;
  try {
    const u = new URL(getCanvasApiBase());
    if (nextUrl.startsWith('/')) return `${u.origin}${nextUrl}`;
  } catch {
  }
  return nextUrl;
}

/** Earliest future due */
function assignmentEffectiveDueAt(plannable, now) {
  const direct = plannable.due_at;
  if (direct && new Date(direct) > now) return direct;
  const dates = plannable.all_dates;
  if (!Array.isArray(dates)) return null;
  let best = null;
  for (const row of dates) {
    const d = row?.due_at;
    if (!d || new Date(d) <= now) continue;
    if (!best || new Date(d) < new Date(best)) best = d;
  }
  return best;
}

/**
 * only future-dated, not-yet-completed assignment.
 * Skips no due date, past due, locked, unpublished, graded submissions.
 */
function isFutureIncompletePlannable(plannable, now) {
  if (!plannable?.id) return false;
  if (plannable.locked_for_user === true) return false;
  if (plannable.workflow_state === 'unpublished') return false;
  const dueAt = assignmentEffectiveDueAt(plannable, now);
  if (!dueAt) return false;
  const sub = plannable.submission;
  if (sub && typeof sub === 'object') {
    const sw = String(sub.workflow_state || '');
    if (sw === 'graded' || sw === 'complete') return false;
  }
  return true;
}

const PLANNER_MAX_PAGES = 60;


export async function getFutureIncompletePlannerAssignments(token) {
  if (!token || !String(token).trim()) {
    return { ok: false, error: 'No token' };
  }
  try {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 1);
    const rangeDays = Math.max(
      30,
      Number(process.env.CANVAS_PLANNER_RANGE_DAYS || 730)
    );
    const end = new Date(now);
    end.setDate(end.getDate() + rangeDays);

    const sd = start.toISOString().slice(0, 10);
    const ed = end.toISOString().slice(0, 10);

    const params = new URLSearchParams({
      start_date: sd,
      end_date: ed,
      per_page: '100',
    });
    let nextUrl = `${getCanvasApiBase()}/planner/items?${params.toString()}`;
    const items = [];
    let page = 0;

    while (nextUrl && page < PLANNER_MAX_PAGES) {
      page += 1;
      const res = await fetch(nextUrl, { headers: headers(token) });
      if (!res.ok) {
        return { ok: false, error: `Canvas API ${res.status}` };
      }
      const data = await res.json();
      const chunk = Array.isArray(data) ? data : [];
      items.push(...chunk);
      nextUrl = resolveCanvasRequestUrl(parseNextPageUrl(res.headers.get('link')));
    }

    const byId = new Map();
    for (const item of items) {
      const pt = String(item.plannable_type || '').toLowerCase();
      if (pt !== 'assignment') continue;
      const plannable = item.plannable || {};
      if (!isFutureIncompletePlannable(plannable, now)) continue;
      const assignmentId = Number(plannable.id ?? item.plannable_id);
      if (Number.isNaN(assignmentId)) continue;
      const courseId = Number(item.course_id);
      const dueAt = assignmentEffectiveDueAt(plannable, now);
      const courseName =
        (typeof item.context_name === 'string' && item.context_name.trim()) ||
        (typeof plannable.context_name === 'string' && plannable.context_name.trim()) ||
        '';
      if (!byId.has(assignmentId)) {
        byId.set(assignmentId, {
          id: assignmentId,
          course_id: Number.isNaN(courseId) ? null : courseId,
          course_name: courseName,
          name:
            plannable.name ||
            plannable.title ||
            `Canvas assignment ${assignmentId}`,
          due_at: dueAt || null,
        });
      }
    }

    const assignments = [...byId.values()];

    const needsCourseName = assignments.some(
      (a) => (!a.course_name || !String(a.course_name).trim()) && a.course_id != null
    );
    if (needsCourseName) {
      const courseRes = await getCourses(token);
      if (courseRes.ok && Array.isArray(courseRes.courses)) {
        const idToName = new Map(
          courseRes.courses.map((c) => [
            Number(c.id),
            String(c.name || c.course_code || '').trim(),
          ])
        );
        for (const a of assignments) {
          if ((!a.course_name || !String(a.course_name).trim()) && a.course_id != null) {
            const n = idToName.get(Number(a.course_id));
            if (n) a.course_name = n;
          }
        }
      }
    }

    return {
      ok: true,
      assignments,
    };
  } catch (err) {
    return { ok: false, error: err.message || 'Network error' };
  }
}
