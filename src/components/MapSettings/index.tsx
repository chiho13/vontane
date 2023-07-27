import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/Form";
import { Input } from "../ui/input";
import { api } from "@/utils/api";
import { ToastContainer, toast } from "react-toastify";
import { Transforms } from "slate";
import { useContext, useState } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import LoadingSpinner from "@/icons/LoadingSpinner";
import { Button } from "../ui/button";
import { Search } from "lucide-react";

export const MapSettings = ({ element, path }) => {
  const { editor, activePath } = useContext(EditorContext);

  const locationSearchMutation = api.gpt.locationSearch.useMutation();
  const [isGenerating, setIsGenerating] = useState(false);
  const locationSearchSchema = z.object({
    prompt: z
      .string()
      .min(2, { message: "Please enter a location" })
      .max(100, { message: "Max 100 characters" }),
  });

  const locationSearchForm = useForm<z.infer<typeof locationSearchSchema>>({
    resolver: zodResolver(locationSearchSchema),
    reValidateMode: "onChange",
  });

  async function searchLocation(values: z.infer<typeof locationSearchSchema>) {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const response = await locationSearchMutation.mutateAsync({
        location: values.prompt,
      });

      console.log("response", response);
      const location = response.features[0].geometry.coordinates;

      const latLng = [location[1], location[0]];
      Transforms.setNodes(editor, { latLng, zoom: 12 }, { at: path });
      setIsGenerating(false);
      //   let regex = /^\[([-]?[0-9]*\.?[0-9]+),\s*([-]?[0-9]*\.?[0-9]+)\]$/;

      //   if (!regex.test(response)) {
      //     throw new Error("Invalid format. Expected format: [lat, lng]");
      //   } else {
      //     Transforms.setNodes(
      //       editor,
      //       { latLng: JSON.parse(response) },
      //       { at: path }
      //     );
      //     setIsGenerating(false);
      //   }
    } catch (error) {
      setIsGenerating(false);
      locationSearchForm.setError("prompt", {
        type: "manual",
        message: "Error: Please Try Again",
      });
    }
  }

  return (
    <div>
      <h2 className="text-md text-bold mb-3">Map Properties</h2>
      <div> Lat: {element.latLng[0].toFixed(3)}</div>
      <div> Lng: {element.latLng[1].toFixed(3)}</div>

      <Form {...locationSearchForm}>
        <form
          onSubmit={locationSearchForm.handleSubmit(searchLocation)}
          className="z-100  relative mt-3  flex w-full flex-row items-center  pb-2"
        >
          <FormField
            control={locationSearchForm.control}
            name="prompt"
            render={() => (
              <FormItem className="flex-grow">
                <FormControl>
                  <Input
                    placeholder="Search Location"
                    // adjust this according to your state management
                    {...locationSearchForm.register("prompt")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <div className="absolute right-[40px]  top-1 mb-2 flex  h-[30px] w-[60px] items-center justify-center rounded-md border border-accent text-sm">
            250 cr
          </div> */}
          <Button
            variant={"outline"}
            className="absolute right-[5px] top-1 h-[30px] w-[30px] border-0 p-1"
            type="submit"
          >
            {isGenerating ? (
              <LoadingSpinner strokeColor="stroke-gray-400 dark:stroke-muted-foreground" />
            ) : (
              <Search className=" stroke-muted-foreground " />
            )}
          </Button>
          {/* <TooltipProvider delayDuration={300}>
            <Tooltip
              open={notEnoughCredits && genOpen}
              onOpenChange={onGenOpen}
            >
              <TooltipTrigger>
                <Button
                  variant={"outline"}
                  className="absolute right-[5px] top-1 h-[30px] w-[30px] border-0 p-1"
                  type="submit"
                >
                  {isGenerating ? (
                    <LoadingSpinner strokeColor="stroke-gray-400 dark:stroke-muted-foreground" />
                  ) : (
                    <Send className="dark:stroke-muted-foreground" />
                  )}
                </Button>
              </TooltipTrigger>

              <TooltipContent
                side="top"
                sideOffset={20}
                className="dark:bg-white dark:text-black"
              >
                <p className="text-[12px]">Not Enough Credits</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}
        </form>
      </Form>
      <ToastContainer className="toast_container" />
    </div>
  );
};
