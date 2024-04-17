import {registerComponent} from "vena";
import ProjectCard from "./project-card.js";
import ProjectColumn from "./project-column.js";

export interface Card {
  body: string;
}

declare global {
  namespace JSX {
    interface VenaIntrinsicElements {
      "project-board": {
        cards?: Card[];
      };
    }
  }
}

export default registerComponent("project-board", ({render}) => {
  render(
    <>
      <style>{`
			:host {
			  display: flex;
			  gap: calc(var(--token-spacing-base-unit, 8px) * 4);
			}
		  `}</style>

      <ProjectColumn>
        <span slot="title">Backlog</span>
        <ProjectCard slot="card">Test</ProjectCard>
        <ProjectCard slot="card">Test</ProjectCard>
        <ProjectCard slot="card">Test</ProjectCard>
      </ProjectColumn>
      <ProjectColumn>
        <span slot="title">In Progress</span>
        <ProjectCard slot="card">Test</ProjectCard>
      </ProjectColumn>
      <ProjectColumn>
        <span slot="title">Complete</span>
      </ProjectColumn>
    </>
  );
});
