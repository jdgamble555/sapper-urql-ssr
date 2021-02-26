<script lang="ts">

    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    
    function remove() {
		dispatch('remove', { id });
	}

	function toggleStatus() {
        let newStatus = !completed;
		dispatch('toggle', {
            id,
            newStatus
        });
    }

    export let id = undefined;
    export let text = undefined;
    export let completed = undefined;
</script>

<style>
    .is-complete {
        text-decoration: line-through;
        color: green;
    }
</style>

{#if completed}
    <span class="is-complete">{ text } - { id }</span>
    <button on:click={toggleStatus}> ✔️ </button>
{:else}
    <span>{ text } - { id }</span>
    <button on:click={toggleStatus}> ❌ </button>
{/if}

<button on:click={remove}> 🗑 </button>
