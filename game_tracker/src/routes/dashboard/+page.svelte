<script lang="ts">
    import { onMount } from "svelte";
    import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from "chart.js";
    import { resolve } from "$app/paths";
    import { enhance } from "$app/forms";
    import type { PageData } from "./$types";

    Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

    let { data }: { data: PageData } = $props();

    let chartCanvas: HTMLCanvasElement = $state()!;

    let editingId = $state<string | null>(null);

    onMount(() => {
        const { breakdown } = data.stats;
        const style = getComputedStyle(document.documentElement);
        const colors = ['--color-backlog', '--color-playing', '--color-completed', '--color-dropped']
            .map(v => style.getPropertyValue(v).trim());

        new Chart(chartCanvas, {
            type: "doughnut",
            data: {
                labels: ["Backlog", "Playing", "Completed", "Dropped"],
                datasets: [{
                    data: [
                        breakdown.backlog,
                        breakdown.playing,
                        breakdown.completed,
                        breakdown.dropped
                    ],
                    backgroundColor: colors,

                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position:
                        "bottom"
                    }
                }
            }
        });
    });
</script>

<div class="dashboard">
    <header class="dashboard-header">
        <h1>Welcome back, {data.user.name}</h1>
        <a href={resolve('/search')} class="btn-primary">Add Game</a>
    </header>

    <div class="stat-grid">
        <span class="stat-label">Total Games</span>
        <span class="stat-value">
            {data.stats.totalGames}
        </span>
    </div>
    <div class="stat-card">
        <span class="stat-label">
            Completion Rate
        </span>
        <span class="stat-value">
            {data.stats.completionRate}%
        </span>
    </div>
    <div class="stat-card">
    <span class="stat-label">Avg Rating</span>
    <span class="stat-value">
        {data.stats.avgRating ?? "-"}{data.stats.avgRating ? "/10" : ""}
    </span>
    </div>
</div>

<div class="middle-row">
    <div class="card chart-card">
        <h2>Library Breakdown</h2>
        {#if data.stats.totalGames > 0}
        <canvas bind:this={chartCanvas}></canvas>
        {:else}
        <p class="empty">No Games yet. <a href={resolve('/search')}>Add Games</a></p>
        {/if}
    </div>
<div class="card currently-playing">
    <h2>Currently Playing</h2>
    {#if data.userGames.filter (g => g.status === "playing").length > 0}

    <ul>
        {#each data.userGames.filter(g => g.status === "playing") as entry (entry.id)}
        <li class="playing-item">
            {#if entry.game?.coverUrl}
            <img src={entry.game.coverUrl} alt={entry.game.title} />
            {/if}
            <div>
                <p class="game-title">{entry.game?.title}</p>
                <p class="game-meta">{entry.completionPercentage}% Complete</p>
            </div>
        </li>
        {/each}
    </ul>
    {:else}
    <p class="empty">No games in progress</p>
    {/if}
</div>
    
</div>

<div class="card">
    <h2>My Library</h2>
    {#if data.userGames.length > 0}
    <table>
        <thead>
            <tr>
                <th>Game</th>
                <th>Rating</th>
                <th>Progress</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Edit</th>
            </tr>
        </thead>
        <tbody>
    {#each data.userGames as entry (entry.id)}
        <tr>
            
            <td class="game-name">
                {#if entry.game?.coverUrl}
                    <img src={entry.game.coverUrl} alt={entry.game.title} class="table-cover" />
                {/if}
                {entry.game?.title}
            </td>

            {#if editingId === entry.id}
                
                <td colspan="4">
                    <form
                        method="POST"
                        action="?/updateGame"
                        use:enhance={() => {
                            return async ({ update }) => {
                                await update();
                                editingId = null;
                            };
                        }}
                        class="inline-form"
                    >
                        <input type="hidden" name="userGameId" value={entry.id} />

                        <select name="status" value={entry.status}>
                            <option value="backlog">Backlog</option>
                            <option value="playing">Playing</option>
                            <option value="completed">Completed</option>
                            <option value="dropped">Dropped</option>
                        </select>

                        <input
                            type="number"
                            name="rating"
                            min="1"
                            max="10"
                            placeholder="Rating 1-10"
                            value={entry.rating ?? ''}
                        />

                        <input
                            type="number"
                            name="hoursPlayed"
                            min="0"
                            placeholder="Hours"
                            value={entry.hoursPlayed ?? ''}
                        />

                        <input
                            type="number"
                            name="completionPercentage"
                            min="0"
                            max="100"
                            placeholder="% complete"
                            value={entry.completionPercentage}
                        />

                        <button type="submit" class="btn-save">Save</button>
                        <button type="button" onclick={() => editingId = null} class="btn-cancel">
                            Cancel
                        </button>
                    </form>
                </td>
            {:else}
                <td>{entry.rating ?? '—'}</td>
                <td>{entry.completionPercentage}%</td>
                <td>{entry.hoursPlayed ?? '—'}</td>
                <td>
                    <span class="badge badge-{entry.status}">{entry.status}</span>
                </td>
            {/if}

            <td>
                <button
                    class="btn-edit"
                    onclick={() => editingId = editingId === entry.id ? null : entry.id}
                >
                    {editingId === entry.id ? '✕' : 'Edit'}
                </button>
            </td>
        </tr>
    {/each}
</tbody>
    </table>
    {:else}
    <p class="empty">Your library is empty. <a href={resolve('/search')}>Search for games</a> to get started</p>
    {/if}
</div>

<style>
    .dashboard {
        max-width: 1100px;
        margin: 2rem auto;
        padding: 0 1rem;
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .btn-primary {
        padding: 0.6rem 1.2rem;
        background: #4f46e5;
        color: white;
        border-radius: 6px;
        text-decoration: none;
        font-size: 0.95rem;
    }

    /* Stat Cards */
    .stat-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
    }

    .stat-card {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .stat-label {
        font-size: 0.85rem;
        color: #6b7280;
    }

    .stat-value {
        font-size: 1.75rem;
        font-weight: 700;
        color: #111827;
    }

    /* Cards */
    .card {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 1.5rem;
    }

    .card h2 {
        font-size: 1.1rem;
        margin: 0 0 1rem;
        color: #111827;
    }

    .middle-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .chart-card canvas {
        max-height: 280px;
    }

    /* Currently Playing */
    ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .playing-item {
        display: flex;
        gap: 0.75rem;
        align-items: center;
    }

    .playing-item img {
        width: 48px;
        height: 48px;
        object-fit: cover;
        border-radius: 4px;
    }

    .game-title {
        font-size: 0.95rem;
        font-weight: 500;
        margin: 0;
    }

    .game-meta {
        font-size: 0.8rem;
        color: #6b7280;
        margin: 0;
    }

    /* Table */
    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;
    }

    th {
        text-align: left;
        padding: 0.6rem 0.75rem;
        border-bottom: 2px solid #e5e7eb;
        color: #6b7280;
        font-weight: 600;
    }

    td {
        padding: 0.6rem 0.75rem;
        border-bottom: 1px solid #f3f4f6;
        vertical-align: middle;
    }

    .game-name {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .table-cover {
        width: 36px;
        height: 36px;
        object-fit: cover;
        border-radius: 3px;
    }

    /* Status Badges */
    .badge {
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: capitalize;
    }

    .badge-backlog  { background: #f3f4f6; color: #6b7280; }
    .badge-playing  { background: #ede9fe; color: #4f46e5; }
    .badge-completed { background: #d1fae5; color: #059669; }
    .badge-dropped  { background: #fee2e2; color: #dc2626; }

    .empty {
        color: #9ca3af;
        font-size: 0.9rem;
    }

    .empty a {
        color: #4f46e5;
    }

    .inline-form {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        flex-wrap: wrap;
        padding: 0.25rem 0;
    }

    .inline-form select,
    .inline-form input[type="number"] {
        padding: 0.35rem 0.5rem;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 0.85rem;
        width: 110px;
    }

    .btn-edit {
        padding: 0.3rem 0.75rem;
        font-size: 0.8rem;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        background: white;
        cursor: pointer;
    }

    .btn-save {
        padding: 0.35rem 0.75rem;
        background: #4f46e5;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 0.85rem;
        cursor: pointer;
    }

    .btn-cancel {
        padding: 0.35rem 0.75rem;
        background: white;
        color: #6b7280;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 0.85rem;
        cursor: pointer;
    }
</style>