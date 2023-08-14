// "b53a0a8f-c6f7-4d10-a474-1a3e6dd96054"

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
import { parseNodes } from "@/components/PreviewContent/docs";
import { createClient } from "@supabase/supabase-js";
import { supabaseClient } from "@/utils/supabaseClient";
import { formatDate } from "@/utils/formatDate";
import Head from "next/head";
import { Header } from "@/components/Header";

export const getServerSideProps: GetServerSideProps = async (context) => {
  // get the entire URL path

  try {
    const { req, res }: any = context;
    const { prisma } = createInnerTRPCContext({}, req, res);

    const vontaneappid = "b53a0a8f-c6f7-4d10-a474-1a3e6dd96054";

    const activeWorkspaces = await prisma.workspace.findMany({
      where: { author_id: vontaneappid, deleted_at: null, published: true },
      orderBy: { published_at: "desc" },
    });

    // Extract titles from the slate_value
    const blogs = activeWorkspaces.map((workspace) => {
      const slateValue = JSON.parse(workspace.slate_value);
      const workspaceId = workspace.id;
      const date = new Date(workspace.published_at);
      const formattedDate = formatDate(date);

      return {
        id: workspaceId,
        title: slateValue[0]?.children[0]?.text || "",
        published_at: formattedDate,
      }; // You can adjust this according to your exact slate_value structure
    });

    // If there is a user, return the session and other necessary props.
    return {
      props: { blogs: blogs }, // Replace 'user' with your actual session data
    };
  } catch (error) {
    return {
      props: {
        blogs: null,
      },
    };
  }
};

const BlogPage = ({ blogs }) => {
  return (
    <>
      <Head>
        <title>Vontane Blog </title>
        <meta name="description" content="Vontane Login" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />

        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />

        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />

        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className={`relative  h-[100vh] overflow-y-auto rounded-md bg-white p-4 dark:bg-[#191919] `}
      >
        <div className="mx-auto mt-4 max-w-[700px] lg:mt-20">
          <h1 className="mb-4 flex items-center text-[36px] font-bold text-gray-700 dark:text-gray-200">
            <div className="shrink">
              <Header />
            </div>
            Vontane Blog
          </h1>

          {/* <div className="relative mx-auto max-w-[700px] xl:mt-[100px]">
            {parseNodes(localValue)}
          </div> */}

          <div className="mt-10 block">
            {blogs.map((blog, index) => {
              const link = blog.title
                .toLowerCase()
                .replace(/-/g, "_") // Add this line to remove dashes
                .split(" ")
                .join("_");

              return (
                <Link
                  className="mb-6 flex justify-between rounded-md border border-gray-200  p-6 transition duration-300 hover:bg-gray-200 dark:border-gray-600 dark:hover:bg-accent/50"
                  key={index}
                  href={`/blog/${link}-${blog.id}`}
                >
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    {blog.title}
                  </span>
                  <span>{blog.published_at}</span>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="fixed bottom-4 right-4 hidden xl:block">
          <ModeToggle />
        </div>
      </main>
    </>
  );
};

export default BlogPage;
