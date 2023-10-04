import {
  createContext,
  useEffect,
  useState,
  useContext,
  Dispatch,
} from "react";
import { useSession } from "@supabase/auth-helpers-react";

import { api, RouterOutputs } from "@/utils/api";

export type UserContextType = {
  profile: null | RouterOutputs["profile"]["getProfile"];
  workspaces: null | RouterOutputs["profile"]["getProfile"]["workspaces"];
  trash: null | RouterOutputs["profile"]["getProfile"]["workspaces"];
  isLoading: boolean;
  credits: Number;
  setCredits: Dispatch<any>;
};

export const UserContext = createContext<UserContextType>({
  profile: null,
  workspaces: null,
  trash: null,
  isLoading: false,
  credits: 0,
  setCredits: () => {},
});

export function UserContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const userId = session?.user?.id;

  const { profile, workspaces, trash, isLoading } = useUserProfile(userId);

  const [credits, setCredits] = useState(0);

  useEffect(() => {
    if (profile) {
      setCredits(profile?.credits);
    }
  }, [profile]);

  return (
    <UserContext.Provider
      value={{ profile, workspaces, trash, isLoading, credits, setCredits }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUserContext = () => useContext(UserContext);

function useUserProfile(userId: string | undefined) {
  const queryResult = api.profile.getProfile.useQuery(null, {
    enabled: !!userId,
  });

  const { data, isLoading } = queryResult;
  const profile: any = data?.profile;
  const workspaces: any = data?.workspaces;
  const trash: any = data?.trash;

  return { profile, workspaces, trash, isLoading };
}
