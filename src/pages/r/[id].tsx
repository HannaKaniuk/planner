import type { GetServerSideProps } from "next";
import { getOriginalUrl } from "@/lib/shortener";

export default function RedirectPage() {
	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-center">
				<p className="text-lg">Redirecting...</p>
			</div>
		</div>
	);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { id } = context.params || {};

	if (!id || typeof id !== "string") {
		return {
			notFound: true,
		};
	}

	const originalUrl = await getOriginalUrl(id);

	if (!originalUrl) {
		return {
			notFound: true,
		};
	}

	return {
		redirect: {
			destination: originalUrl,
			permanent: false,
		},
	};
};
