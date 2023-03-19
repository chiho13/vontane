import { createContext, useEffect, useState, useContext } from "react";
import { useSession } from "@supabase/auth-helpers-react";

import { api, RouterOutputs } from "@/utils/api";

export type UserContextType = {
  profile: null | RouterOutputs["profile"]["getProfile"];
};

export const UserContext = createContext<UserContextType>({ profile: null });

export function UserContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const userId = session?.user?.id;

  const { profile } = useUserProfile(userId);

  return (
    <UserContext.Provider value={{ profile }}>{children}</UserContext.Provider>
  );
}

export const useUserContext = () => useContext(UserContext);

function useUserProfile(userId: string | undefined) {
  const queryResult = api.profile.getProfile.useQuery(
    { id: userId || "" },
    { enabled: !!userId }
  );
  const { data: profile } = queryResult;

  return { profile };
}
