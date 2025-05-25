'use client';

import Link from "next/link";
import AuthButton from "./authButton";
import { useAuthState } from "@/lib/useAuth";
import { Button } from "./button";

const NavBarAdmin: React.FC = () => {
    const { isAuthenticated } = useAuthState();

  return (
    <nav className="p-4 bg-gray-200 flex justify-between items-center fixed top-0 left-0 right-0 z-10">
        { isAuthenticated ? (
            <>
                <div className="flex gap-4">
                    <Button 
                        variant={"link"}
                    >
                        <Link href="/admin">
                                Home
                        </Link>
                    </Button>
                    <Button 
                        variant={"link"}
                    >
                        <Link href="/admin/page-builder">
                                Page Builder
                        </Link>
                    </Button>                    <Button 
                        variant={"link"}
                    >
                        <Link href="/admin/quest-builder">
                                Quest Builder
                        </Link>
                    </Button>
                </div>
                <div className="flex gap-4 items-center">
                    <Button 
                        variant={"outline"}
                    >
                        <Link href="/client">
                            Client View
                        </Link>
                    </Button>
                    <AuthButton />
                </div>
            </>
        ) : (
            <>
                <h1>
                    <Link href="/" className="text-blue-600 hover:underline">
                        Quest
                    </Link>
                </h1>
                <AuthButton />
            </>
        )}            
    </nav>
  );
}

export default NavBarAdmin;