
const CANVAS_API_BASE =
  process.env.CANVAS_BASE_URL ||
  process.env.CANVAS_API_BASE_URL ||
  'https://canvas.instructure.com/api/v1';

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
    const res = await fetch(`${CANVAS_API_BASE}/users/self`, {
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
 * List courses: GET /courses — only current (available), not concluded.
 */
export async function getCourses(token) {
  if (!token || !String(token).trim()) {
    return { ok: false, error: 'No token' };
  }
  try {
    const url = `${CANVAS_API_BASE}/courses?per_page=50&state[]=available`;
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

/**
 * List assignments: use assignment_groups (student-friendly); fallback to /assignments if 403.
 */
export async function getAssignments(token, courseId) {
  if (!token || !String(token).trim()) {
    return { ok: false, error: 'No token' };
  }
  const groupsUrl = `${CANVAS_API_BASE}/courses/${courseId}/assignment_groups?per_page=50&include[]=assignments`;
  try {
    const res = await fetch(groupsUrl, { headers: headers(token) });
    if (res.ok) {
      const groups = await res.json();
      const assignments = [];
      if (Array.isArray(groups)) {
        for (const g of groups) {
          if (Array.isArray(g.assignments)) {
            for (const a of g.assignments) {
              assignments.push({ ...a, course_id: a.course_id ?? courseId });
            }
          }
        }
      }
      return { ok: true, assignments };
    }
    if (res.status === 403) {
      const directRes = await fetch(
        `${CANVAS_API_BASE}/courses/${courseId}/assignments?per_page=50`,
        { headers: headers(token) }
      );
      if (directRes.ok) {
        const data = await directRes.json();
        const list = Array.isArray(data) ? data : [];
        return { ok: true, assignments: list };
      }
      return { ok: false, error: `Canvas API ${directRes.status}` };
    }
    return { ok: false, error: `Canvas API ${res.status}` };
  } catch (err) {
    return { ok: false, error: err.message || 'Network error' };
  }
}

/**
 * Get submission for one assignment (Option A: completion from Canvas only).
 */
export async function getSubmission(token, courseId, assignmentId) {
  if (!token || !String(token).trim()) {
    return { ok: false, error: 'No token' };
  }
  try {
    const res = await fetch(
      `${CANVAS_API_BASE}/courses/${courseId}/assignments/${assignmentId}/submissions/self`,
      { headers: headers(token) }
    );
    if (!res.ok) {
      return { ok: false, error: `Canvas API ${res.status}` };
    }
    const sub = await res.json();
    const submitted = ['submitted', 'graded'].includes(sub.workflow_state);
    return { ok: true, submitted };
  } catch (err) {
    return { ok: false, error: err.message || 'Network error' };
  }
}
