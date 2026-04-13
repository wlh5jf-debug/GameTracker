<script lang="ts">
    import { enhance } from "$app/forms";
    import { resolve } from "$app/paths";
    import type { ActionData } from "./$types";

    let { form }: { form: ActionData } = $props()
</script>

<div class="auth-container">
<h1>Log-In</h1>

{#if form?.message}
    <p class="error">{form.message}</p>
{/if}

<form method="POST" use:enhance>
<label>
Email:
<input type="email" name="email" required />
</label>

<label>
    Password:
    <input type="password" name="password" />
</label>
<button type="submit">Login</button>

</form>

<p>Don't have an account? <a href={resolve("/register")}>Register</a></p>

</div>
