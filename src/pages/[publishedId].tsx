import { WidgetRenderer } from "@/components/WidgetRender";
import { createInnerTRPCContext } from "@/server/api/trpc";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps = async (context) => {
  // get the entire URL path
  const path = context.resolvedUrl;
  let parts = path.split("-");
  let workspaceId = parts.slice(1).join("-").split("?")[0];
  try {
    const { req, res }: any = context;
    const { prisma } = createInnerTRPCContext({}, req, res);

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace.published) {
      throw new Error("Workspace not found");
    }

    // If there is a user, return the session and other necessary props.
    return {
      props: {
        workspaceData: workspace.slate_value,
        font: workspace.font_style,
        brandColor: workspace.brand_color || "#0E78EF",
      }, // Replace 'user' with your actual session data
    };
  } catch (error) {
    return {
      props: {
        workspaceId,
        workspaceData: null,
      },
    };
  }
};

const PublishedPage = ({ workspaceData, font, brandColor }) => {
  const router = useRouter();
  const workspaceId = router.query.workspaceId as string;
  return (
    <div className="h-[100vh] overflow-y-auto px-6 pt-[30px] dark:bg-[#191919] xl:pt-[60px]">
      <WidgetRenderer
        key={workspaceId}
        workspaceData={workspaceData}
        font={font}
        brandColor={brandColor}
      />
    </div>
  );
};

export default PublishedPage;
