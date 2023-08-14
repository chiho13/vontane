import LoadingSpinner from "@/icons/LoadingSpinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Portal } from "react-portal";
import { Button } from "@/components/ui/button";
import { ChevronDown, Copy, Link } from "lucide-react";
import { useRouter } from "next/router";
import { useClipboard } from "@/hooks/useClipboard";
import { useLocalStorage } from "usehooks-ts";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import { api } from "@/utils/api";

export const PublishButton = () => {
  const router = useRouter();
  const workspaceId = router.query.workspaceId as string;
  const { editor, activePath } = useContext(EditorContext);

  const { workspaceData, refetchWorkspaceData } = useTextSpeech();
  const { copied: linkCopied, copyToClipboard: copyLink } = useClipboard();
  const { copied: iframeCopied, copyToClipboard: copyIframe } = useClipboard();

  const [published, setPublished] = useState(workspaceData.workspace.published);

  const [openDropdown, setOpenDropdown] = useState(false);

  useEffect(() => {
    setPublished(workspaceData.workspace.published);
  }, [workspaceData, router.isReady]);

  const [pubLoading, setPubLoading] = useState(false);
  const publishWorkspaceMutation = api.workspace.publishWorkspace.useMutation();

  const publishWorkspace = async () => {
    setPubLoading(true);

    try {
      const response = await publishWorkspaceMutation.mutateAsync({
        id: workspaceId,
      });
      if (response) {
        setPubLoading(false);
        setPublished(response.published);
        refetchWorkspaceData();
        setOpenDropdown(true);
      }
    } catch (error) {
      setPubLoading(false);
      console.error("Error publishing:", error);
    }
  };
  const openDropdownChange = (value) => {
    setOpenDropdown(value);
  };
  const publicURL = `${
    process.env.NEXT_PUBLIC_URL
  }/${editor.children[0].children[0].text
    .toLowerCase()
    .replace(/-/g, "_") // Add this line to remove dashes
    .split(" ")
    .join("_")}-${workspaceId}`;

  const iframeEmbed = `<iframe src="${publicURL}" width="100%" height="500" style="border:0" allowfullscreen loading="lazy"></iframe>`;
  return (
    <Portal>
      {!published ? (
        <Button
          className={`text-bold fixed right-[80px] top-[25px] h-[28px] rounded-md px-3 text-sm  text-white hover:bg-brand/90 hover:text-white disabled:opacity-100 dark:border-t-gray-700 dark:bg-slate-100 dark:text-muted dark:hover:bg-slate-300 dark:hover:text-background ${
            published
              ? "bg-green-400 text-foreground dark:bg-green-400"
              : "bg-brand "
          }`}
          disabled={pubLoading}
          onClick={!pubLoading ? publishWorkspace : undefined}
        >
          {pubLoading ? (
            <>
              <LoadingSpinner strokeColor="stroke-white dark:stroke-background" />{" "}
              <span className="ml-3">
                {!published ? "Publishing..." : "Unpublishing..."}
              </span>
            </>
          ) : (
            "Publish"
          )}
        </Button>
      ) : (
        <DropdownMenu open={openDropdown} onOpenChange={openDropdownChange}>
          <DropdownMenuTrigger asChild>
            <Button
              className={`text-bold fixed  right-[80px]  top-[25px] flex h-[28px] rounded-md px-3 text-sm  text-white disabled:opacity-100 dark:border-t-gray-700 dark:bg-slate-100 dark:text-muted ${
                published
                  ? "bg-green-400 text-foreground hover:bg-green-400 hover:text-foreground dark:bg-green-400"
                  : "bg-brand "
              }`}
            >
              Published
              <ChevronDown className="ml-1 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[400px] border border-gray-300  bg-background p-3 dark:border-gray-500 dark:bg-secondary"
          >
            <div className="relative mb-4 flex items-center">
              <Link className="absolute left-3 w-4 dark:stroke-gray-300 " />

              <input
                value={publicURL}
                className=" h-[36px]  w-full rounded-md  rounded-r-none  border border-r-0 border-gray-300  bg-muted  p-2 pl-[40px] text-sm  focus:outline-none dark:border-accent dark:border-gray-400 dark:text-gray-400"
                readOnly={true}
              />

              <Button
                variant="outline"
                className=" h-[36px] rounded-l-none border border-gray-300 bg-muted px-2 text-center dark:border-gray-400 dark:text-gray-200"
                onClick={() => copyLink(publicURL)}
              >
                <p className="flex truncate text-xs ">
                  {linkCopied ? "Copied!" : "Copy Web Link"}
                </p>
              </Button>
            </div>

            <h3 className="text-bold mb-2 mt-4 text-sm dark:text-gray-200">
              Embed
            </h3>
            <div className="relative mb-4 flex items-center">
              <textarea
                defaultValue={iframeEmbed}
                className=" h-[120px]  w-full resize-none rounded-md border border-gray-300  bg-muted  p-2  pr-[40px]  font-mono text-sm  focus:outline-none dark:border-accent dark:border-gray-400 dark:text-gray-400"
                readOnly={true}
              />

              <Button
                variant="outline"
                className=" absolute bottom-2  right-2 h-[36px] border border-gray-300 bg-muted px-2 text-center dark:border-gray-400 dark:text-gray-200"
                onClick={() => copyIframe(iframeEmbed)}
              >
                <p className="flex truncate text-xs ">
                  {iframeCopied ? "Copied!" : "Copy Code"}
                </p>
              </Button>
            </div>
            <div className="flex w-full gap-4 ">
              <DropdownMenuItem
                className="flex grow cursor-pointer justify-center rounded-md border border-gray-300 dark:border-gray-500 hover:dark:bg-accent"
                disabled={pubLoading}
                onClick={!pubLoading && publishWorkspace}
              >
                <span className="text-foreground"> Unpublish</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className=" group flex grow cursor-pointer justify-center rounded-md bg-brand hover:bg-black hover:dark:bg-brand/90"
                disabled={pubLoading}
                onClick={() => {
                  console.log(workspaceId);

                  router.push(
                    `/${editor.children[0].children[0].text
                      .toLowerCase()
                      .replace(/-/g, "_") // Add this line to remove dashes
                      .split(" ")
                      .join("_")}-${workspaceId}`
                  );
                }}
              >
                <span className="text-white group-hover:text-black dark:text-foreground group-hover:dark:text-white">
                  View Site
                </span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </Portal>
  );
};
