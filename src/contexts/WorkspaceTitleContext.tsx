import { createContext, useContext, useState, ReactNode } from "react";

type UpdatedWorkspaceType = {
  title: string;
  id: string;
};
// Define the shape of the context object
interface WorkspaceTitleUpdateContextType {
  updatedWorkspace: UpdatedWorkspaceType;
  setUpdatedWorkspace: (workspace: UpdatedWorkspaceType) => void;
}

// Create the context with default values
const WorkspaceTitleUpdateContext =
  createContext<WorkspaceTitleUpdateContextType>({
    updatedWorkspace: { title: "", id: "" },
    setUpdatedWorkspace: () => {},
  });

// Define the shape of the provider props
interface WorkspaceTitleUpdateProviderProps {
  children: ReactNode;
}

const useWorkspaceTitleUpdate = () => {
  return useContext(WorkspaceTitleUpdateContext);
};

const WorkspaceTitleUpdateProvider = ({
  children,
}: WorkspaceTitleUpdateProviderProps) => {
  const [updatedWorkspace, setUpdatedWorkspace] =
    useState<UpdatedWorkspaceType>({
      title: "",
      id: "",
    });

  return (
    <WorkspaceTitleUpdateContext.Provider
      value={{ updatedWorkspace, setUpdatedWorkspace }}
    >
      {children}
    </WorkspaceTitleUpdateContext.Provider>
  );
};

export { WorkspaceTitleUpdateProvider, useWorkspaceTitleUpdate };
