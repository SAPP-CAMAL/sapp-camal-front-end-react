import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookiesStorage = await cookies();

  const token = cookiesStorage.get("accessToken");

  if (token) {
    redirect("/dashboard/people");
  } else {
    redirect("/auth/login");
  }
}
