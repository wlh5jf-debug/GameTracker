<script lang="ts">
    import { enhance } from "$app/forms";
    import type { ActionData } from "./$types";

    let { form }: { form: ActionData } = $props();
    let loading = $state(false);
</script>

<div class="search-page">
    <h1>Search Games</h1>

    <form 
       method="POST"
       action="?/search"
       use:enhance={() => {
        loading = true;
        return async ({ update }) => {
            await update();
            loading = false;
        };
       }}
    >

    <div class="search-bar">
      <input
      type="text"
      name="query"
      placeholder="Search for a game..."
      required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>

    </div>

    </form>
{#if form?.message}
<p class="error">{form.message}</p>
{/if}

{#if form?.results && form.results.length > 0}
<div class="results-grid">
    {#each form.results as game (game.id)}
    <div class="game-card">
        {#if game.background_image}
        <img src={game.background_image} alt={game.name} />
        {:else}
        <div class="no-cover">No Image</div>
        {/if}

        <div class="game-info">
            <h3>{game.name}</h3>
            {#if game.released}
            <p>{new Date(game.released).getFullYear()}</p>
            {/if}
        </div>

        <form method="POST" action="?/add" use:enhance>
            <input type="hidden" name="rawgId" value={game.id} />
            <input type="hidden" name="title" value={game.name} />
            <input type="hidden" name="coverUrl" value={game.background_image ?? ''} />
            <input type="hidden" name="releaseYear" value={game.released ?? ''} />
            <button type="submit">Add Game to Library</button>
        </form>
    </div>
    {/each}
</div>
{:else if form?.results && form.results.length === 0}
    <p>No results found.</p>
{/if}

</div>

<style>
    .search-page {
        max-width: 900px;
        margin: 2rem auto;
        padding: 0 1rem;
    }

    .search-bar {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 2rem;
    }

    input[type="text"] {
        flex: 1;
        padding: 0.75rem;
        font-size: 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    button[type="submit"] {
        padding: 0.75rem 1.5rem;
        background: #4f46e5;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
    }

    button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1.5rem;
    }

    .game-card {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .game-card img {
        width: 100%;
        height: 140px;
        object-fit: cover;
    }

    .no-cover {
        width: 100%;
        height: 140px;
        background: #f3f4f6;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #9ca3af;
    }

    .game-info {
        padding: 0.75rem;
        flex: 1;
    }

    .game-info h3 {
        font-size: 0.95rem;
        margin: 0 0 0.25rem;
    }

    .game-info p {
        font-size: 0.8rem;
        color: #6b7280;
        margin: 0;
    }

    .game-card form {
        padding: 0.75rem;
        border-top: 1px solid #e5e7eb;
    }

    .game-card button {
        width: 100%;
        padding: 0.5rem;
        font-size: 0.85rem;
    }

    .error {
        color: red;
        margin-bottom: 1rem;
    }
</style>