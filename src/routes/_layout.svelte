<script lang="ts">
	export let segment: string = '';
</script>

<main>
	<slot></slot>
</main>
{#if segment === "profile"}
<p></p>
{/if}