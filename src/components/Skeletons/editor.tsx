export const EditorSkeleton = () => {
  const showRightSidebar = JSON.parse(
    localStorage.getItem("showRightSidebar") || "true"
  );

  return (
    <div
      className="max-[1400px] relative mx-auto mt-10 px-4"
      style={{
        width: `${1170}px`,
        transition: "right 0.3s ease-in-out",
      }}
    >
      <div className="flex justify-center">
        <div className="block">
          <div
            className="relative z-0  mt-4 block w-full rounded-md  border border-gray-300 bg-white  px-2 dark:border-gray-700  dark:bg-accent lg:w-[800px] lg:px-0"
            style={{
              height: "calc(100vh - 120px)",
            }}
          >
            <div className="mt-3 p-4 ">
              <div className="   ml-[60px] h-[40px] w-[50%] animate-pulse rounded-lg bg-gray-200 dark:bg-muted-foreground"></div>
              <div className="  ml-[60px] mt-6 h-[25px] w-[90%] animate-pulse rounded-md bg-gray-200 dark:bg-muted-foreground"></div>
              <div className="  ml-[60px] mt-2 h-[25px] w-[90%] animate-pulse rounded-md bg-gray-200 dark:bg-muted-foreground"></div>
              <div className="  ml-[60px] mt-2 h-[25px] w-[90%] animate-pulse rounded-md bg-gray-200 dark:bg-muted-foreground"></div>
              <div className="  ml-[60px] mt-2 h-[25px] w-[90%] animate-pulse rounded-md bg-gray-200 dark:bg-muted-foreground"></div>

              <div className="  ml-[60px] mt-6 h-[25px] w-[90%] animate-pulse rounded-md bg-gray-200 dark:bg-muted-foreground"></div>
              <div className="  ml-[60px] mt-2 h-[25px] w-[60%] animate-pulse rounded-md bg-gray-200 dark:bg-muted-foreground"></div>
            </div>
          </div>
        </div>
        {showRightSidebar && (
          <>
            <div className="flex h-[680px] items-center">
              <div
                className={`hidden w-[22px] opacity-0  transition duration-300 hover:opacity-100 lg:block`}
              >
                <div className="mx-auto mt-4 block h-[200px] w-[8px]  cursor-col-resize rounded bg-[#b4b4b4] "></div>
              </div>
            </div>
            <div
              className="m-w-full mt-4 hidden grow rounded-md border border-gray-300 bg-white  dark:border-gray-700  dark:bg-accent  xl:block"
              style={{
                height: "calc(100vh - 120px)",
                minWidth: "270px",
                flexBasis: "370px",
                opacity: 1,
                transition:
                  "width 0.3s ease-in-out, opacity 0.4s ease-in-out, transform 0.3s ease-in-out",
              }}
            >
              <div className="p-4">
                <div className="mt-2 p-4 ">
                  <div className="  top-5 left-5 h-[40px] w-full animate-pulse rounded-lg bg-gray-200 dark:bg-muted-foreground"></div>
                  <div className="  left-5 mt-6 h-[125px] w-full animate-pulse rounded-md bg-gray-200 dark:bg-muted-foreground"></div>
                  <div className=" left-5 mt-3 h-[125px] w-full animate-pulse rounded-md bg-gray-200 dark:bg-muted-foreground"></div>
                  <div className="  left-5 mt-3 h-[125px] w-full animate-pulse rounded-md bg-gray-200 dark:bg-muted-foreground"></div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
