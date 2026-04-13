import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad} from "./$types";
import { searchGames } from "$lib/rawg/client";
import { upsertGame } from "$lib/server/db/queries/games";
import { addGameToLibrary } from "$lib/server/db/queries/userGames";

export const load: PageServerLoad = async (event) => {
    if (!event.locals.user) redirect(303, "/login");
    return { results: [] };
};

export const actions: Actions = {
    search: async (event) => {
        if (!event.locals.user) redirect(303, "/login");

        const formData = await event.request.formData();
        const query = formData.get("query") as string;

        if (!query) return fail(400, {message: "Search query is required"});

        try {
            const results = await searchGames(query);
            return { results };
        } catch {
            return fail(500, { message: "Failed to search games" });
        }
    },

    add: async (event) => {
        if (!event.locals.user) redirect(303, "/login");

        const formData = await event.request.formData()
        const rawgId = parseInt(formData.get("rawgId") as string);
        const title = formData.get("title") as string;
        const coverUrl = formData.get("coverUrl") as string;
        const releaseYear = formData.get("releaseYear") as string;

        try {
            const game = await upsertGame({
                id: rawgId,
                name: title,
                background_image: coverUrl,
                released: releaseYear,
                rating: 0,
                platforms: null
            });

            await addGameToLibrary(event.locals.user.id, game.id);
            return { success:true };
        } catch {
            return fail(500, { message: "Failed to add game to library" });
        }
    }
}