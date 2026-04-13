import { db } from "$lib/server/db";
import { userGames } from "$lib/server/db/schema";
import { eq, avg, sum, count, and, isNotNull } from "drizzle-orm";

export async function getDashboardStats(userId: string) {
    const statusCounts = await db 
    .select({
        status: userGames.status,
        count: count()
    })
    .from(userGames)
    .where(eq(userGames.userId, userId))
    .groupBy(userGames.status);

    const aggregates = await db.select({
        avgRating: avg(userGames.rating),
        totalHours: sum(userGames.hoursPlayed)
    })
    .from(userGames)
    .where(
        and(
            eq(userGames.userId, userId),
            isNotNull(userGames.rating)
        )
    );

    const breakdown = {
        backlog: 0,
        playing: 0,
        completed: 0,
        dropped: 0
};

let totalGames = 0;

for (const row of statusCounts) {
    breakdown[row.status] = Number(row.count);
    totalGames += Number(row.count);
}

const completionRate = totalGames > 0
? Math.round((breakdown.completed / totalGames) * 100)
: 0;

return {
    totalGames,
    breakdown,
    completionRate,
    avgRating: aggregates[0]?.avgRating ? parseFloat(Number(aggregates[0].avgRating).toFixed(1))
    : null,
    totalHours: Number(aggregates[0]?.totalHours ?? 0)
};
}