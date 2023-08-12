import { EditorContext, EditorProvider } from "@/contexts/EditorContext";
import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useRef,
} from "react";
import { Path, Text, Node } from "slate";
import Link from "next/link";

import { api } from "@/utils/api";
import { CollapsibleAudioPlayer } from "@/components/PreviewContent/PreviewElements/CollapsibleAudio";
import { MCQ } from "@/components/PreviewContent/PreviewElements/MCQ";
import { useRouter } from "next/router";
import { ModeToggle } from "@/components/mode-toggle";
import { AudioManagerProvider } from "@/contexts/PreviewAudioContext";
import { createInnerTRPCContext } from "@/server/api/trpc";
import { GetServerSideProps } from "next";
import { Button } from "@/components/ui/button";
import { parseNodes } from "@/components/PreviewContent";
import { createClient } from "@supabase/supabase-js";
import { supabaseClient } from "@/utils/supabaseClient";
import { formatDate } from "@/utils/formatDate";
import { ChevronLeft } from "lucide-react";
import Head from "next/head";

export const getServerSideProps: GetServerSideProps = async (context) => {
  // get the entire URL path
  const path = context.resolvedUrl;
  let parts = path.split("-");
  let workspaceId = parts.slice(1).join("-");
  try {
    const { req, res }: any = context;
    const { prisma } = createInnerTRPCContext({}, req, res);

    const vontaneappid = "b53a0a8f-c6f7-4d10-a474-1a3e6dd96054";

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        author_id: vontaneappid,
      },
    });

    const date = new Date(workspace.published_at);
    const formattedDate = formatDate(date);

    if (!workspace.published || workspace.deleted_at) {
      throw new Error("Workspace not found");
    }

    // If there is a user, return the session and other necessary props.
    return {
      props: {
        published_at: formattedDate,
        workspaceData: workspace.slate_value,
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

const PublishedPage = ({ published_at, workspaceData }) => {
  // Split the path by '/' and get the second last part, which contains the title and ID

  const [localValue, setLocalValue] = useState(null);

  useEffect(() => {
    if (workspaceData) {
      const parsedSlateValue = JSON.parse(workspaceData);
      setLocalValue(parsedSlateValue);
    }

    return () => {
      setLocalValue(null);
    };
  }, [workspaceData]);

  if (!workspaceData) {
    // Show 404 page if workspaceId is not found
    return (
      <div className="flex h-[100vh] w-full flex-col items-center justify-center">
        <div className="text-bold mb-2 text-8xl">404</div>
        <p className="text-2xl">Boo</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>
          Vontane | {JSON.parse(workspaceData)[0].children[0].text}{" "}
        </title>
        <meta
          name="description"
          content={`Vontane - ${JSON.parse(workspaceData)[0].children[0].text}`}
        />

        <meta property="og:title" content="Vontane Content Editor" />
        <meta
          property="og:description"
          content={JSON.parse(workspaceData)[0].children[0].text}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.vontane.com" />
      </Head>
      <AudioManagerProvider>
        <div
          className={`relative  h-[100vh] overflow-y-auto rounded-md bg-white p-4 dark:bg-[#191919] `}
        >
          <div className="blog-content relative mx-auto mb-20 max-w-[700px] xl:mt-[100px]">
            <div className="mb-2 flex justify-between ">
              <Link href="/blog" className="flex underline">
                {" "}
                <ChevronLeft /> {"Back"}
              </Link>

              <span className="font-bold text-muted-foreground">
                {published_at}
              </span>
            </div>
            {localValue && parseNodes(localValue)}
          </div>
        </div>
        <div className="fixed bottom-4 right-4 hidden xl:block">
          <ModeToggle />
        </div>
      </AudioManagerProvider>
    </>
  );
};

export default PublishedPage;
