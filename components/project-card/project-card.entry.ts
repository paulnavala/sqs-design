import { createApp } from 'vue';
import { mountOnLoader } from '../_shared/mount';
import ProjectCard from './ProjectCard';

mountOnLoader('project-card', (el) => {
  const app = createApp(ProjectCard);
  app.mount(el);
});


