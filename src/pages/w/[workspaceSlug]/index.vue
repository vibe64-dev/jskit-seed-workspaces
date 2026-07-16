<script setup>
import { computed } from "vue";
import { useWorkspaceRouteContext } from "@jskit-ai/workspaces-web/client/composables/useWorkspaceRouteContext";
import WorkspaceNotFoundCard from "@/components/WorkspaceNotFoundCard.vue";
import { useWorkspaceNotFoundState } from "@/composables/useWorkspaceNotFoundState";

const { workspaceUnavailable, workspaceUnavailableMessage } = useWorkspaceNotFoundState();
const { workspaceSlugFromRoute } = useWorkspaceRouteContext();
const adminPath = computed(() => `/w/${encodeURIComponent(workspaceSlugFromRoute.value || "")}/admin`);
</script>

<template>
  <WorkspaceNotFoundCard
    v-if="workspaceUnavailable"
    :message="workspaceUnavailableMessage"
    surface-label="App"
  />
  <section v-else class="workspace-home-screen d-flex flex-column ga-4">
    <header>
      <p class="text-overline text-medium-emphasis mb-1">Personal workspace</p>
      <h1 class="workspace-home-screen__title">App</h1>
      <p class="text-body-2 text-medium-emphasis mb-0">Your personal workspace is ready.</p>
    </header>

    <v-sheet rounded="lg" border class="workspace-home-screen__panel">
      <h2 class="text-h6 mb-2">Blank workspace</h2>
      <p class="text-body-2 text-medium-emphasis mb-0">
        Add the first feature when you are ready.
      </p>
      <p class="text-body-2 text-medium-emphasis mt-4 mb-0">
        This page can redirect straight to
        <router-link :to="adminPath">Admin</router-link>
        if this becomes a collaboration-only project with no public-facing results.
      </p>
    </v-sheet>
  </section>
</template>

<style scoped>
.workspace-home-screen__title {
  font-size: clamp(1.5rem, 2.5vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0 0 0.4rem;
}

.workspace-home-screen__panel {
  margin-inline: auto;
  max-width: 34rem;
  padding: 2rem 1.25rem;
  text-align: center;
  width: 100%;
}
</style>
