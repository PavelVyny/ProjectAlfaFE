import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const BACKEND_URL =
	process.env.NEXT_PUBLIC_API_URL ||
	"https://project-alfa-backend-480977786594.us-central1.run.app";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		console.log("Received request body:", body);

		const response = await axios.post(`${BACKEND_URL}/auth/google`, body, {
			headers: {
				"Content-Type": "application/json",
			},
		});

		console.log("Backend response status:", response.status);
		console.log("Backend response data:", response.data);

		return NextResponse.json(response.data);
	} catch (error) {
		console.error("Google auth error:", error);

		if (axios.isAxiosError(error)) {
			const status = error.response?.status || 500;
			const data = error.response?.data || { message: "Internal server error" };
			return NextResponse.json(data, { status });
		}

		return NextResponse.json(
			{
				message: "Internal server error",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
