import { createWebHistory, createRouter } from "vue-router"

import HomeView from "./HomeView.vue"
import AboutView from "./AboutView.vue"
import ProjectView from "./ProjectView.vue"
import NewProjectView from "./NewProjectView.vue"
import ProjectDashboardView from "./ProjectDashboardView.vue"
import ProjectDeploy from "./DeployView.vue"

const routes = [
  { path: "/", name: "HomeView", component: HomeView },
  { path: "/about", name: "AboutView", component: AboutView },
  { path: "/project", name: "CreateProjectView", component: NewProjectView },
  { path: "/project/:dsid", name: "ProjectView", component: ProjectView },
  { path: "/deploy/:dsid", name: "ProjectDeploy", component: ProjectDeploy },
  {
    path: "/projectdashboard/:dsid",
    name: "ProjectDashboardView",
    component: ProjectDashboardView,
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
