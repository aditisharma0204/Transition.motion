# Feedback Manager

Breaks down large blocks of stakeholder feedback into actionable, tracked chunks and maintains a historical log of decisions and resolutions. 

Use this skill when the user pastes a large block of feedback (e.g., from Slack, design reviews, or PR comments) and asks to process it, organize it, or track what has been done.

## Workflow

1.  **Parse and Categorize**: Read the raw feedback and break it down into logical categories:
    *   **Priority/Housekeeping**: Quick fixes, broken windows, embarrassing bugs.
    *   **Features/Gaps**: Missing functionality, new requests.
    *   **UX/Strategy Thoughts**: Larger structural suggestions that might need discussion before implementation.
    *   **Praise/Validation**: What is working well (keep doing this).
2.  **Document into Tracker**: 
    *   Initialize or update a `FEEDBACK-LOG.md` file in the repository root (or a designated `/docs` folder).
    *   For each piece of feedback, record:
        *   **Date & Source**: When and where it came from.
        *   **The Feedback**: A concise summary of the point.
        *   **Status**: `[PENDING]`, `[IN PROGRESS]`, `[RESOLVED]`, or `[PARKED]`.
        *   **Resolution Notes**: What was actually done to address it (filled out as work happens).
3.  **Translate to Session Todos**: Create actionable steps for the *current* coding session using the `TodoWrite` tool so the agent can begin executing the highest priority items immediately.
4.  **Check-In**: After completing a chunk of items, update the `FEEDBACK-LOG.md` with the resolution notes and change their statuses to `[RESOLVED]`.

Trigger on: "here is feedback", "break down this feedback", "what did they say", "track this feedback", or any time the user pastes a wall of text from a stakeholder review.
