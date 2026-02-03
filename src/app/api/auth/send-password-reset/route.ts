import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		const response = await fetch(`${BACKEND_URL}/auth/send-password-reset`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(data, { status: response.status });
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Send password reset error:", error);
		return NextResponse.json({ message: "Internal server error" }, { status: 500 });
	}
}
