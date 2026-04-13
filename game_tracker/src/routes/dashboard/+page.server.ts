import { redirect, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { getDashboardStats } from "$lib/server/db/queries/stats";
import { getUserGames, updateUserGame } from "$lib/server/db/queries/userGames";

export const load: PageServerLoad = async (event) => {
    if (!event.locals.user) redirect(303, "/login");

    const [stats, userGames] = await Promise.all([
        getDashboardStats(event.locals.user.id),
        getUserGames(event.locals.user.id)
    ]);

    return { user: event.locals.user, stats, userGames
    };
};

export const actions: Actions = {
    updateGame: async (event) => {
        if (!event.locals.user) redirect(303, "/login");

        const formData = await event.request.formData();
        const userGameId = formData.get("userGameId") as string;
        const status = formData.get("status") as string;
        const rating = formData.get("rating") ? parseInt(formData.get("rating") as string) : null;
        const hoursPlayed = formData.get("hoursPlayed") ? parseInt(formData.get("hoursPlayed") as string) : null;
        const completionPercentage = formData.get("completionPercentage") ? parseInt(formData.get("completionPercentage") as string) : null;

        if (!userGameId || !status) {
            return fail(400, { message: "Missing required fields" });
        }

        try { 
            await updateUserGame({
                id: userGameId,
                userId: event.locals.user.id,
                status,
                rating,
                hoursPlayed,
                completionPercentage
            });

            return { success: true };
        } catch {
            return fail(500, { message: "Failed to update game" });
        }
    }
};