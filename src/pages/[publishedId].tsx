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
import { parseNodes } from "@/utils/renderHelpers";
import { createClient } from "@supabase/supabase-js";
import { supabaseClient } from "@/utils/supabaseClient";

export const getServerSideProps: GetServerSideProps = async (context) => {
  // get the entire URL path
  const path = context.resolvedUrl;
  let parts = path.split("-");
  let workspaceId = parts.slice(1).join("-");
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

const PublishedPage = ({ workspaceId, workspaceData, font }) => {
  const router = useRouter();
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

  const isMCQPresent = (children: any[]) => {
    if (Array.isArray(children)) {
      for (let child of children) {
        if (child.node && child.node.type === "mcq") {
          return true;
        }

        // If the child has its own children, check them too
        if (Array.isArray(child.children)) {
          if (isMCQPresent(child.children)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  if (!workspaceData) {
    // Show 404 page if workspaceId is not found
    return (
      <div className="flex h-[100vh] w-full flex-col items-center justify-center">
        <div className="text-bold mb-2 text-8xl">404</div>
        <p className="text-2xl">Workspace not found</p>

        <Link href="/">
          <Button className="mt-4 ">Go Home</Button>
        </Link>
      </div>
    );
  }

  return (
    localValue && (
      <AudioManagerProvider>
        <div
          className={`relative  h-[100vh] overflow-y-auto rounded-md bg-white p-4 dark:bg-[#191919] `}
        >
          <div className="relative mx-auto mb-20 max-w-[700px] xl:mt-[100px]">
            {parseNodes(localValue, font)}
          </div>
        </div>
        <div className="fixed bottom-4 right-4 hidden xl:block">
          <ModeToggle />
        </div>
      </AudioManagerProvider>
    )
  );
};

export default PublishedPage;
