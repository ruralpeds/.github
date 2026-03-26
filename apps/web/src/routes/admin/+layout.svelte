<script lang="ts">
  import { isAuthenticated, login, logout } from '$lib/stores/admin';
  import { page } from '$app/stores';

  let pin = '';
  let error = '';
  let showPin = false;

  function handleLogin() {
    if (login(pin)) {
      pin = '';
      error = '';
    } else {
      error = 'Incorrect PIN';
      pin = '';
    }
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Enter') handleLogin();
  }

  const navItems = [
    { href: '/admin',            label: 'Dashboard',  icon: '⊞' },
    { href: '/admin/trees',      label: 'Trees',      icon: '🌳' },
    { href: '/admin/knowledge',  label: 'Knowledge',  icon: '📚' },
  ];
</script>

{#if !$isAuthenticated}
<!-- ── Login screen ──────────────────────────────────────────────────── -->
<div class="login-wrap">
  <div class="login-card">
    <div class="login-icon">🔒</div>
    <h1>Admin Access</h1>
    <p>Peds Clinical Decision Support</p>
    <div class="pin-wrap">
      <input
        type={showPin ? 'text' : 'password'}
        bind:value={pin}
        on:keydown={handleKey}
        placeholder="Enter PIN"
        maxlength={8}
        autofocus
      />
      <button class="show-btn" on:click={() => showPin = !showPin}>
        {showPin ? '🙈' : '👁'}
      </button>
    </div>
    {#if error}<p class="pin-error">{error}</p>{/if}
    <button class="login-btn" on:click={handleLogin}>Unlock</button>
    <p class="default-hint">Default PIN: 1234</p>
  </div>
</div>

{:else}
<!-- ── Admin shell ───────────────────────────────────────────────────── -->
<div class="admin-shell">
  <nav class="admin-nav">
    <div class="nav-brand">
      <span class="nav-logo">🏥</span>
      <div>
        <div class="nav-title">Peds CDS</div>
        <div class="nav-sub">Admin</div>
      </div>
    </div>

    <div class="nav-links">
      {#each navItems as item}
        <a
          href={item.href}
          class="nav-link"
          class:active={$page.url.pathname === item.href}
        >
          <span class="nav-icon">{item.icon}</span>
          {item.label}
        </a>
      {/each}
    </div>

    <div class="nav-footer">
      <a href="/" class="nav-link">← Back to App</a>
      <button class="nav-link logout-btn" on:click={logout}>🔓 Logout</button>
    </div>
  </nav>

  <main class="admin-main">
    <slot />
  </main>
</div>
{/if}

<style>
  /* ── Login ── */
  .login-wrap {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    background: var(--bg, #0b1121);
    font-family: 'IBM Plex Sans', sans-serif;
  }
  .login-card {
    background: var(--surface, #1e293b);
    border: 1px solid var(--border, #334155);
    border-radius: 16px;
    padding: 2.5rem 2rem;
    width: min(340px, 92vw);
    text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: .75rem;
  }
  .login-icon { font-size: 2.5rem; }
  .login-card h1 {
    font-family: 'DM Serif Display', serif;
    font-size: 1.5rem; color: var(--text, #e2e8f0); margin: 0;
  }
  .login-card > p {
    font-size: .8rem; color: var(--text2, #94a3b8);
  }
  .pin-wrap {
    display: flex; align-items: center; gap: .5rem; width: 100%; margin-top: .5rem;
  }
  .pin-wrap input {
    flex: 1; padding: .65rem .9rem;
    background: var(--bg, #0b1121);
    border: 1px solid var(--border, #334155);
    border-radius: 8px;
    color: var(--text, #e2e8f0);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1rem;
    outline: none;
    letter-spacing: .2em;
    text-align: center;
  }
  .pin-wrap input:focus { border-color: var(--accent, #38bdf8); }
  .show-btn {
    background: none; border: none; cursor: pointer; font-size: 1rem; opacity: .6;
  }
  .pin-error { color: #f87171; font-size: .78rem; }
  .login-btn {
    width: 100%; padding: .65rem;
    background: var(--accent, #38bdf8);
    color: #000;
    border: none; border-radius: 8px;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: .9rem; font-weight: 600;
    cursor: pointer; margin-top: .25rem;
    transition: opacity .15s;
  }
  .login-btn:hover { opacity: .88; }
  .default-hint { font-size: .7rem; color: var(--text3, #64748b); }

  /* ── Admin shell ── */
  .admin-shell {
    display: flex; min-height: 100vh;
    background: var(--bg, #0b1121);
    font-family: 'IBM Plex Sans', sans-serif;
  }
  .admin-nav {
    width: 220px; flex-shrink: 0;
    background: var(--bg2, #0f172a);
    border-right: 1px solid var(--border, #334155);
    display: flex; flex-direction: column;
    padding: 1.25rem 0;
    position: sticky; top: 0; height: 100vh; overflow-y: auto;
  }
  .nav-brand {
    display: flex; align-items: center; gap: .75rem;
    padding: 0 1.1rem 1.25rem;
    border-bottom: 1px solid var(--border, #334155);
  }
  .nav-logo { font-size: 1.5rem; }
  .nav-title {
    font-family: 'DM Serif Display', serif;
    font-size: .95rem; color: var(--text, #e2e8f0);
  }
  .nav-sub {
    font-family: 'IBM Plex Mono', monospace;
    font-size: .6rem; color: var(--accent, #38bdf8);
    text-transform: uppercase; letter-spacing: .08em;
  }
  .nav-links { flex: 1; padding: .75rem 0; }
  .nav-link {
    display: flex; align-items: center; gap: .65rem;
    padding: .55rem 1.1rem;
    color: var(--text2, #94a3b8);
    text-decoration: none; font-size: .85rem;
    border-left: 2px solid transparent;
    transition: color .13s, border-color .13s, background .13s;
  }
  .nav-link:hover { color: var(--text, #e2e8f0); background: var(--surface, #1e293b); }
  .nav-link.active {
    color: var(--accent, #38bdf8);
    border-left-color: var(--accent, #38bdf8);
    background: var(--surface, #1e293b);
    font-weight: 500;
  }
  .nav-icon { font-size: .95rem; }
  .nav-footer {
    padding: .75rem 0;
    border-top: 1px solid var(--border, #334155);
  }
  .logout-btn {
    background: none; border: none; cursor: pointer; width: 100%; text-align: left;
    font-family: 'IBM Plex Sans', sans-serif;
  }
  .admin-main {
    flex: 1; overflow-y: auto;
    padding: 1.75rem 2rem;
    color: var(--text, #e2e8f0);
  }
</style>
