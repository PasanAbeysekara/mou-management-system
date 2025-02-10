import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { DomainKey, MOUStatus } from "@/types";

/**
 * Helper to map NextAuth roles to domain keys in the "status" object.
 */
function getDomainFromRole(role: string): DomainKey | "unknown" {
  switch (role.toUpperCase()) {
    case "LEGAL_ADMIN":
      return "legal";
    case "FACULTY_ADMIN":
      return "faculty";
    case "SENATE_ADMIN":
      return "senate";
    case "UGC_ADMIN":
      return "ugc";
    default:
      return "unknown";
  }
}

/**
 * GET /api/mous/pending
 *
 * Returns all MOUs that are "pending" approval for the current domain admin.
 * "Pending" means `status[domain]` is `false` (or not set).
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    const domain = getDomainFromRole(role);

    // If role is not recognized as a domain admin, return empty or handle differently.

    // Fetch all MOU records
    const allMous = await prisma.mou_submissions.findMany({
      orderBy: { dateSubmitted: "desc" },
    });

    // Filter to only those where this domain is "not approved" (i.e. false or missing).
    const pending = allMous.filter((m) => {
      // If m.status is missing or not an object, skip
      if (!m.status || typeof m.status !== "object") return false;
      if (domain === "unknown") {
        return NextResponse.json([], { status: 200 });
      }
      // If the domain key doesn't exist, treat it as pending
      //   if (!(domain in m.status)) return true;
      // If domain in m.status is explicitly false, it's pending
      const typedStatus = m.status as unknown as MOUStatus; // <-- double cast from JSON
      return typedStatus[domain]?.approved === false;
    });

    return NextResponse.json(pending);
  } catch (error) {
    console.error("Error fetching pending MOUs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
