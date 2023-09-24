import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React from "react";
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
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import LoadingSpinner from "@/icons/LoadingSpinner";
import { Button } from "../ui/button";
import { Search } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard";
import { debounce } from "lodash";

export const MapSettings = ({ element, path }) => {
  const { editor, activePath } = useContext(EditorContext);

  const { copied, copyToClipboard } = useClipboard();

  const locationSearchMutation = api.gpt.locationSearch.useMutation();

  const [isGenerating, setIsGenerating] = useState(false);

  const [address, setAddress] = useState(element.address ?? null);

  useEffect(() => {
    if (element.address) {
      setAddress(element.address);
    }
  }, [element.address]);
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
      console.log(location);
      const latLng = [location[1], location[0]];
      Transforms.setNodes(
        editor,
        { address: response.features[0].place_name_en, latLng, zoom: 12 },
        { at: path }
      );

      setIsGenerating(false);
    } catch (error) {
      setIsGenerating(false);
      locationSearchForm.setError("prompt", {
        type: "manual",
        message: "Error: Please Try Again",
      });
    }
  }

  const editAddress = (e) => {
    setAddress(e.target.value);
    Transforms.setNodes(editor, { address: e.target.value }, { at: path });
  };

  if (element.type !== "map") {
    return <div></div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-bold mb-3 text-sm">Map Properties</h2>

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
                    className="pr-9 dark:border-gray-400"
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
        </form>
      </Form>

      <div className="text-sm dark:text-gray-400">
        {" "}
        Lat: {element.latLng && element.latLng[0].toFixed(3)}
      </div>
      <div className="text-sm dark:text-gray-400">
        {" "}
        Lng: {element.latLng && element.latLng[1].toFixed(3)}
      </div>

      {address && (
        <>
          <h3 className="text-bold mb-2 mt-4 text-sm dark:text-gray-400">
            Address
          </h3>
          <div className="relative flex items-center">
            <input
              value={address}
              className=" h-[36px]  w-full rounded-md  rounded-r-none  border border-r-0 border-gray-300  bg-muted  p-2 text-sm  focus:outline-none dark:border-gray-400 dark:text-gray-400"
              onChange={editAddress}
            />
            <Button
              variant="outline"
              className=" h-[36px] rounded-l-none border border-gray-300 bg-muted px-2 text-center dark:border-gray-400"
              onClick={() => copyToClipboard(element.address)}
            >
              <p className="flex truncate text-xs ">
                {copied ? "Copied!" : "Copy"}
              </p>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
