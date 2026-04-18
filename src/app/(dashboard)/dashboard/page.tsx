import { redirect } from "next/navigation";

const page = () => {
  redirect("/dashboard/bookmarks");
};

export default page;
