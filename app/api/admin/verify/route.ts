import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { ok: false },
            { status: 401 }
        );
    }

    const adminUserId = process.env.ADMIN_USER_ID;

    if (!adminUserId) {
        console.error(
            "ADMIN_USER_ID environment variable is not configured."
        );

        return NextResponse.json(
            { ok: false },
            { status: 500 }
        );
    }

    if (user.id !== adminUserId) {
        await supabase.auth.signOut();

        return NextResponse.json(
            { ok: false },
            { status: 403 }
        );
    }

    return NextResponse.json({ ok: true });
}
