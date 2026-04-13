export function applyStatusTransitions(
    current: {
        status: string;
        startedAt: Date | null;
        completedAt: Date | null;
    },
    newStatus: string
) {
    const transitions: {
        startedAt?: Date;
        completedAt?: Date | null;
        completionPercentage?: number;
    } = {};

    if (newStatus === "playing" && !current.startedAt) {
        transitions.startedAt = new Date();
    }

    if (newStatus === "completed") {
        transitions.completedAt = new Date();
        transitions.completionPercentage = 100;
    }

    if (current.status === "completed" && newStatus !== "completed") {
        transitions.completedAt = null;
    }

    return transitions;
} 