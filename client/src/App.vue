<script setup lang="ts"></script>

<template>
  <RouterView v-slot="{ Component }">
    <GcAppShell>
      <template #navbar-left>
        <span class="gc-navbar-brand">Dockside</span>
      </template>
      <template #navbar-right>
        &nbsp;&nbsp;
        <RouterLink to="/"><GcIcon name="Home" class="w-5 h-5" /></RouterLink>
        &nbsp;&nbsp;
        <RouterLink to="/project"><GcIcon name="FolderPlus" class="w-5 h-5" /></RouterLink>
        &nbsp;&nbsp;
        <GcThemeSwitcher />
      </template>

      <template #main>
        <!-- MAIN CONTENT -->
        <div class="p-5 space-y-6">
          <component :is="Component" />
          <br /><br /><br />
        </div>
        <GcToastContainer />
      </template>
    </GcAppShell>
  </RouterView>
</template>
