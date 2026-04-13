<script lang="ts">
import { enhance } from "$app/forms";
import { resolve } from "$app/paths";
import type { ActionData } from "./$types";

let { form }: { form: ActionData } = $props();

</script>

<div class="auth-container">
    <h1>Create an Account</h1>

    {#if form?.message}
    <p class="error">{form.message}</p>
    {/if}

    <form method="POST" use:enhance>
        <label>
            Name:
            <input type="text" name="name" required />
        </label>

        <label>
            Email:
            <input type="email" name="email" required />
        </label>

        <label>
            Password:
            <input type="password" name="password" required />
        </label>
     <button type="submit">Register</button>

    </form>

    <p>Already have an account? <a href={resolve("/login")}>Login</a></p>
</div>
