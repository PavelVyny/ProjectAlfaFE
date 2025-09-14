import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
	process.env.NEXT_PUBLIC_API_URL ||
	"https://project-alfa-backend-480977786594.us-central1.run.app";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		const response = await fetch(`${BACKEND_URL}/auth/register`, {
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
		console.error("Register error:", error);
		return NextResponse.json({ message: "Internal server error" }, { status: 500 });
	}
}
