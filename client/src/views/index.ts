import { createWebHistory, createRouter } from "vue-router"

import HomeView from "./HomeView.vue"
import AboutView from "./AboutView.vue"
import ProjectView from "./ProjectView.vue"

const routes = [
  { path: "/", name: "HomeView", component: HomeView },
  { path: "/about", name: "AboutView", component: AboutView },
  { path: "/project/:dsid", name: "ProjectView", component: ProjectView },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
