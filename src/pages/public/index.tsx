import { useEffect } from "react";
import { useRouter } from "next/router";

const PublicPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Use router.push to redirect the user
    router.push("/");
  }, []);

  return <div></div>; // You can return a loading spinner or any component you want to display before the redirect
};

export default PublicPage;
