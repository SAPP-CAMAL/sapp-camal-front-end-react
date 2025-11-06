import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cookies } from "next/headers";
import Image from "next/image";

export default async function Page() {
  const cookiesStore = await cookies();

  const user = cookiesStore.get("user");

  const userData = user ? JSON.parse(user.value) : null;

  return (
    <div className="flex flex-col items-center justify-center py-2 h-full">
      <div>
        <Image
          src="/images/sapp-v-vertical.png"
          width={400}
          height={350}
          alt="Sapp"
        />
        <Card>
          <CardTitle className="text-center">
            Bienvenido {userData?.user.fullName}
          </CardTitle>
          <CardContent>
            <p>Rol Actual: {userData?.activeRole.name}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
