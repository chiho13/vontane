import { createContext, useEffect, useState, useContext } from "react";
import { useSession } from "@supabase/auth-helpers-react";

import { api, RouterOutputs } from "@/utils/api";

export type UserContextType = {
  profile: null | RouterOutputs["profile"]["getProfile"];
  workspaces: null | RouterOutputs["profile"]["getProfile"]["workspaces"];
  trash: null | RouterOutputs["profile"]["getProfile"]["workspaces"];
  isLoading: boolean;
};

export const UserContext = createContext<UserContextType>({
  profile: null,
  workspaces: null,
  trash: null,
  isLoading: false,
});

export function UserContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const userId = session?.user?.id;

  const { profile, workspaces, trash, isLoading } = useUserProfile(userId);

  return (
    <UserContext.Provider value={{ profile, workspaces, trash, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUserContext = () => useContext(UserContext);

function useUserProfile(userId: string | undefined) {
  const queryResult = userId
    ? api.profile.getProfile.useQuery(
        { id: userId },
        {
          enabled: true,
          cacheTime: 5 * 60 * 1000, // Cache data for 5 minutes
          staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
        }
      )
    : { data: undefined, isLoading: false };

  const { data, isLoading } = queryResult;
  const profile: any = data?.profile;
  const workspaces: any = data?.workspaces;
  const trash: any = data?.trash;

  return { profile, workspaces, trash, isLoading };
}
