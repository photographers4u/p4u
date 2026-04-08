import { redirect } from "next/navigation";

const page = () => {
  redirect("/dashboard/items");
};

export default page;
