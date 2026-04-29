import AppShell from "@/components/AppShell";
import { Loader } from "@/components/ui";
import { Suspense } from "react";
import OpportunitiesClient from "./OpportunitiesClient";

export default function OpportunitiesPage() {
    return (
        <AppShell>
            <Suspense fallback={<Loader />}>
                <OpportunitiesClient />
            </Suspense>
        </AppShell>
    );
}
