<script lang="ts">
  import IVFSparklineMatrix from '$lib/components/clinical/IVFSparklineMatrix.svelte';

  // Read initial GA week from URL search params if present
  // e.g. /neonatal/ivf-matrix?week=28&dol=2
  import { page } from '$app/stores';
  $: initialWeek = parseInt($page.url.searchParams.get('week') ?? '28');
  $: initialDol  = parseInt($page.url.searchParams.get('dol')  ?? '1');
</script>

<svelte:head>
  <title>IVF Sparkline Matrix — Neonatal IVF Decision Support</title>
  <meta name="description" content="GA-stratified neonatal IV fluid sparkline decision matrix. Select gestational age at birth to view condition-specific fluid rate targets across day of life." />
</svelte:head>

<IVFSparklineMatrix {initialWeek} {initialDol} />
