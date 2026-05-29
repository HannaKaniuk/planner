import type { NextPageContext } from "next";
import type { ErrorProps } from "next/error";

function ErrorPage({ statusCode }: ErrorProps) {
	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-center">
				<h1 className="text-2xl font-bold mb-4">
					{statusCode
						? `An error ${statusCode} occurred on server`
						: "An error occurred on client"}
				</h1>
				<p className="text-gray-600">
					{statusCode === 404
						? "Page not found"
						: "Something went wrong. Please try again later."}
				</p>
			</div>
		</div>
	);
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
	const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
	return { statusCode };
};

export default ErrorPage;
