import { registerComponent } from "vena";
import ProjectColumn from "./project-column.js";

export default registerComponent("project-board", ({ render }) => {
	render(
		<>
			<style>{`
        .columns {
          display: flex;
        }
      `}</style>

			<section className="columns">
				<ProjectColumn title="asdf">
					<span slot="card">Test</span>
				</ProjectColumn>
			</section>
		</>
	);
});
