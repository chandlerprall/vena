import {registerComponent} from "vena";
import ProjectColumn from "./project-column.js";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "project-board": {};
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
        <span slot="card">Test</span>
      </ProjectColumn>
      <ProjectColumn>
        <span slot="title">In Progress</span>
        <span slot="card">Test</span>
      </ProjectColumn>
      <ProjectColumn>
        <span slot="title">Complete</span>
        <span slot="card">Test</span>
      </ProjectColumn>
    </>
  );
});
