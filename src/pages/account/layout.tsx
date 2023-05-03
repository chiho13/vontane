import { Header } from "@/components/Header";
import { DashboardNav } from "@/components/AccountSettingsNav";
import Head from "next/head";
interface DashboardLayoutProps {
  titlePage: string;
  children?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  titlePage = "",
}) => {
  const items = [
    // {
    //   title: "Workspaces",
    //   href: "/account",
    //   icon: "post",
    // },
    {
      title: "Billing",
      href: "/account",
      icon: "billing",
    },
    {
      title: "Profile",
      href: "/account/profile",
      icon: "settings",
    },
    {
      title: "Upgrade",
      href: "/account/upgrade",
      icon: "upgrade",
    },
  ];
  return (
    <div className="block min-h-screen  bg-gradient-to-b from-[#ffffff] to-[#fefefe]">
      <Head>
        <title>Vontane | Account {titlePage} </title>
        <meta name="description" content="Vontane upgrade to pro" />
      </Head>
      <Header />
      <div className="container mx-auto mt-10 grid flex-1 gap-12 md:max-w-[1200px] md:grid-cols-[200px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex">
          {/* <div>something</div> */}
          <DashboardNav items={items} />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
