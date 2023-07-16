import { EditorContext } from "@/contexts/EditorContext";
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { req, res }: any = context;
    const { prisma } = createInnerTRPCContext({}, req, res);

    // get the entire URL path
    const path = context.resolvedUrl;
    let parts = path.split("-");
    let workspaceId = parts.slice(1).join("-");

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace.published) {
      throw new Error("Workspace not found");
    }

    // If there is a user, return the session and other necessary props.
    return {
      props: { workspaceData: workspace.slate_value }, // Replace 'user' with your actual session data
    };
  } catch (error) {
    return {
      props: {
        workspaceData: null,
      },
    };
  }
};

const PublishedPage = ({ workspaceData }) => {
  const router = useRouter();
  const query = router.query.publishedId as string;
  let parts = router.asPath.split("-");
  let workspaceId = parts.slice(1).join("-");

  const { editor: fromEditor, activePath } = useContext(EditorContext);
  const [localValue, setLocalValue] = useState(null);

  // const {
  //   data: workspaceData,
  //   refetch: refetchWorkspaceData,
  //   error,
  //   isLoading,
  // } = api.workspace.getWorkspace.useQuery(
  //   {
  //     id: workspaceId || "",
  //   },
  //   {
  //     enabled: false,
  //     cacheTime: 5 * 60 * 1000, // Cache data for 5 minutes
  //     staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
  //   }
  // );

  // useEffect(() => {
  //   if (router.isReady) {
  //     refetchWorkspaceData();
  //   }
  // }, [workspaceId, router.isReady]);

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

  const renderElement = (
    node: { type: string; url: string },
    children:
      | string
      | number
      | boolean
      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
      | React.ReactFragment
      | null
      | undefined,
    key: React.Key | null | undefined
  ) => {
    console.log(node.type);

    switch (node.type) {
      case "paragraph":
        return (
          <p className="mt-2 leading-7" key={key}>
            {children}
          </p>
        );

      case "heading-one":
        return (
          <h1 className="text-4xl" key={key}>
            {children}
          </h1>
        );
      case "heading-two":
        return (
          <h2 className="text-3xl" key={key}>
            {children}
          </h2>
        );
      case "heading-three":
        return (
          <h3 className="text-2xl" key={key}>
            {children}
          </h3>
        );
      case "link":
        return (
          <a
            href={node.url}
            target="_blank"
            className="inline text-brand underline dark:text-blue-400"
          >
            {children}
          </a>
        );
      case "tts":
        return (
          <CollapsibleAudioPlayer node={node} key={key}>
            {children}
          </CollapsibleAudioPlayer>
        );
      case "mcq":
        return (
          <MCQ node={node} key={key}>
            {children}
          </MCQ>
        );

      default:
        return <span key={key}>{children}</span>;
    }
  };

  const parseNodes = (nodes: any[]) => {
    return nodes
      .filter((node: any) => node.type !== "title")
      .map((node: any, index: any) => {
        console.log(node);
        if (Text.isText(node)) {
          let customNode = node as any; // assert that node could be any type
          if (customNode.bold) {
            return <b key={index}>{customNode.text}</b>;
          } else if (customNode.italic) {
            return <i key={index}>{customNode.text}</i>;
          } else if (customNode.underline) {
            return <u key={index}>{customNode.text}</u>;
          } else if (customNode.strikethrough) {
            return <del key={index}>{customNode.text}</del>;
          } else {
            return <span key={index}>{customNode.text}</span>;
          }
        } else if ("children" in node) {
          const children = parseNodes(node.children);
          return renderElement(node, children, node.id ? node.id : index);
        }
      });
  };

  return (
    localValue && (
      <AudioManagerProvider>
        <div
          className={`relative  h-[100vh] overflow-y-auto rounded-md bg-white p-4 dark:bg-public `}
        >
          <div className="mx-auto max-w-[700px] xl:mt-[100px]">
            {parseNodes(localValue)}
          </div>
        </div>
        <div className="fixed bottom-4 right-4">
          <ModeToggle />
        </div>
      </AudioManagerProvider>
    )
  );
};

export default PublishedPage;
