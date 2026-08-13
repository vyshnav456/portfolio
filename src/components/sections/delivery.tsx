import { SectionHeading } from "@/components/section-heading";
import { PipelineStage } from "@/components/three/pipeline-stage";

/**
 * A scroll-scrubbed 3D section: the same units re-form from a container
 * cluster into a service mesh into a delivery pipeline, with the camera
 * swinging to a new angle for each.
 */
export function Delivery() {
  return (
    <section id="delivery" className="relative">
      <div className="mx-auto max-w-5xl px-5 pt-24 sm:px-6 sm:pt-32">
        <SectionHeading
          index="04"
          label="Delivery"
          title="How the work actually ships."
        >
          Building the thing is half of it. This is the other half — the path a
          change takes from a container on my machine to a release running in
          production, and the tooling that keeps it boring.
        </SectionHeading>
      </div>

      <PipelineStage />
    </section>
  );
}
