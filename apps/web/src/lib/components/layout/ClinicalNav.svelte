<script lang="ts">
	import { page } from '$app/stores';
	import { clinicalMode, modeConfig } from '$lib/stores/mode';

	interface NavSection {
		label: string;
		icon: string;
		href: string;
		/** Which modes include this section */
		modes: ('neonatal' | 'pediatric')[];
		children?: { label: string; href: string; modes?: ('neonatal' | 'pediatric')[] }[];
	}

	const allSections: NavSection[] = [
		{
			label: 'Resuscitation',
			icon: '⚡',
			href: '/resuscitation',
			modes: ['neonatal', 'pediatric'],
			children: [
				{ label: 'NRP Algorithm', href: '/resuscitation/nrp', modes: ['neonatal'] },
				{ label: 'PALS Algorithms', href: '/resuscitation/pals', modes: ['pediatric'] },
				{ label: 'Medication Dosing', href: '/resuscitation/dosing' },
				{ label: 'Defibrillation', href: '/resuscitation/defibrillation', modes: ['pediatric'] },
			]
		},
		{
			label: 'Airway',
			icon: '🫁',
			href: '/airway',
			modes: ['neonatal', 'pediatric'],
			children: [
				{ label: 'Rapid Sequence', href: '/airway/rapid-sequence', modes: ['pediatric'] },
				{ label: 'Difficult Airway', href: '/airway/difficult-airway', modes: ['pediatric'] },
				{ label: 'Neonatal Intubation', href: '/airway/neonatal-intubation', modes: ['neonatal'] },
				{ label: 'Equipment Sizing', href: '/airway/equipment' },
			]
		},
		{
			label: 'Neonatal',
			icon: '👶',
			href: '/neonatal',
			modes: ['neonatal'],
			children: [
				{ label: 'Level II Protocols', href: '/neonatal/level-ii' },
				{ label: 'Thermoregulation', href: '/neonatal/thermoregulation' },
				{ label: 'Respiratory Support', href: '/neonatal/respiratory' },
				{ label: 'Fluid & Glucose', href: '/neonatal/fluids' },
				{ label: 'Jaundice', href: '/neonatal/jaundice' },
				{ label: 'Growth Charts', href: '/neonatal/growth' },
				{ label: 'IVF Sparkline Matrix', href: '/neonatal/ivf-matrix' },
			]
		},
		{
			label: 'Sepsis',
			icon: '🩸',
			href: '/sepsis',
			modes: ['pediatric'],
			children: [
				{ label: 'Sepsis Pathway', href: '/sepsis/pathway' },
				{ label: 'Fluid Calculator', href: '/sepsis/fluids' },
				{ label: 'Antibiotic Dosing', href: '/sepsis/antibiotics' },
			]
		},
		{
			label: 'Cardiac',
			icon: '❤️',
			href: '/cardiac',
			modes: ['neonatal', 'pediatric'],
			children: [
				{ label: 'Arrhythmias', href: '/cardiac/arrhythmias', modes: ['pediatric'] },
				{ label: 'Cardioversion', href: '/cardiac/cardioversion', modes: ['pediatric'] },
				{ label: 'Ductal-Dependent', href: '/cardiac/ductal-dependent', modes: ['neonatal'] },
				{ label: 'Prostaglandin', href: '/cardiac/prostaglandin', modes: ['neonatal'] },
			]
		},
		{
			label: 'Trauma',
			icon: '🚑',
			href: '/trauma',
			modes: ['pediatric'],
			children: [
				{ label: 'Assessment', href: '/trauma/assessment' },
				{ label: 'Blood Products', href: '/trauma/blood-products' },
				{ label: 'Burns', href: '/trauma/burns' },
			]
		},
		{
			label: 'Transport',
			icon: '🗺️',
			href: '/transport',
			modes: ['neonatal', 'pediatric'],
		},
		{
			label: 'Reference',
			icon: '📋',
			href: '/reference',
			modes: ['neonatal', 'pediatric'],
			children: [
				{ label: 'Decision Trees', href: '/reference/decision-trees' },
				{ label: 'Calculators', href: '/reference/calculators' },
				{ label: 'Education Guides', href: '/reference/education' },
				{ label: 'Drug Formulary', href: '/reference/formulary' },
				{ label: 'Normal Values', href: '/reference/normals' },
				{ label: 'Equipment Sizing', href: '/reference/equipment' },
			]
		},
	];

	$: currentPath = $page.url.pathname;
	$: mode = $clinicalMode;

	// Filter sections by current mode
	$: visibleSections = mode
		? allSections.filter((s) => s.modes.includes(mode))
		: [];

	// Filter children by mode too
	function visibleChildren(section: NavSection): { label: string; href: string }[] {
		if (!section.children || !mode) return [];
		return section.children.filter((c) => !c.modes || c.modes.includes(mode));
	}

	function isActive(href: string): boolean {
		return currentPath === href || currentPath.startsWith(href + '/');
	}
</script>

<nav class="clinical-nav" aria-label="Clinical domains">
	{#each visibleSections as section (section.href)}
		<div class="nav-section" class:active={isActive(section.href)}>
			<a
				href={section.href}
				class="nav-section__header"
				class:active={isActive(section.href)}
				aria-current={isActive(section.href) ? 'page' : undefined}
			>
				<span class="nav-icon">{section.icon}</span>
				<span class="nav-label">{section.label}</span>
			</a>
			{#if isActive(section.href)}
				{@const children = visibleChildren(section)}
				{#if children.length > 0}
					<div class="nav-children">
						{#each children as child (child.href)}
							<a
								href={child.href}
								class="nav-child"
								class:active={currentPath === child.href}
								aria-current={currentPath === child.href ? 'page' : undefined}
							>
								{child.label}
							</a>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	{/each}
</nav>

<style>
	.clinical-nav {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.nav-section__header {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.5rem 1rem;
		text-decoration: none;
		color: var(--color-text-secondary);
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: var(--radius-sm);
		margin: 0 0.5rem;
		transition: background-color 0.1s ease, color 0.1s ease;
	}

	.nav-section__header:hover {
		background-color: var(--color-surface);
		color: var(--color-text);
	}

	.nav-section__header.active {
		background-color: var(--color-primary);
		color: var(--color-primary-text);
	}

	.nav-icon {
		font-size: 1rem;
		width: 1.25rem;
		text-align: center;
	}

	.nav-children {
		display: flex;
		flex-direction: column;
		margin-top: 0.125rem;
		padding-left: 2.5rem;
	}

	.nav-child {
		display: block;
		padding: 0.3rem 0.75rem;
		text-decoration: none;
		color: var(--color-text-muted);
		font-size: 0.8125rem;
		border-left: 2px solid var(--color-border-subtle);
		transition: color 0.1s ease, border-color 0.1s ease;
	}

	.nav-child:hover {
		color: var(--color-text);
		border-left-color: var(--color-text-muted);
	}

	.nav-child.active {
		color: var(--color-primary);
		border-left-color: var(--color-primary);
		font-weight: 600;
	}
</style>
