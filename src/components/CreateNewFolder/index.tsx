import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/Form";
import { FolderPlus } from "lucide-react";
import { cn } from "@/utils/cn";
import { api } from "@/utils/api";
import { Button } from "../ui/button";

export const CreateNewFolder = () => {
  const newFolderFormSchema = z.object({
    prompt: z.string().nonempty(),
  });

  const createNewFolderMutation = api.workspace.createFolder.useMutation();
  const newFolderForm = useForm<z.infer<typeof newFolderFormSchema>>({
    resolver: zodResolver(newFolderFormSchema),
    reValidateMode: "onChange",
  });

  const createNewFolderHandler = async (value) => {
    // try {
    //   const response = await createNewFolderMutation.mutateAsync({
    //     folder_name: value.prompt,
    //   });
    //   if (response) {
    //   }
    // } catch (error) {
    //   console.error("Error creating folder:", error);
    // }
  };

  return (
    <Fragment>
      <Dialog>
        <DialogTrigger asChild>
          <button className=" flex h-[36px] items-center rounded-md px-2 transition duration-200 hover:bg-gray-200 dark:hover:bg-accent">
            <FolderPlus
              className="text-darkergray  dark:text-foreground"
              width={22}
            />{" "}
            <span className="ml-2 text-sm text-darkergray  dark:text-foreground">
              New Folder
            </span>
          </button>
        </DialogTrigger>

        <DialogContent className="absolute max-h-[650px]  overflow-x-hidden p-0 p-4 sm:max-w-[420px]">
          <h2 className="mb-4 font-bold ">Create new folder</h2>
          <Form {...newFolderForm}>
            <form
              onSubmit={newFolderForm.handleSubmit(createNewFolderHandler)}
              className="z-100 relative  block   w-full "
            >
              <FormField
                control={newFolderForm.control}
                name="prompt"
                render={() => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input
                        placeholder="Folder Name"
                        // adjust this according to your state management
                        {...newFolderForm.register("prompt")}
                        className={cn(`w-full  dark:bg-secondary/70
                        `)}
                        autoFocus
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-4 flex w-full justify-end">
                <Button>Create</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};
