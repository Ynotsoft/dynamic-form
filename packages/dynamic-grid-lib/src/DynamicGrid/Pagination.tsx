type PaginationProps = {
	pageIndex: number;
	setPageIndex: (page: number) => void;
	pageSize: number;
	totalResults: number;
};

function Pagination({
	pageIndex,
	setPageIndex,
	pageSize,
	totalResults,
}: PaginationProps) {
	const totalPages = Math.ceil(totalResults / pageSize);
	const startPage = Math.max(0, pageIndex - 2);
	const endPage = Math.min(totalPages, pageIndex + 3);

	return (
		<div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
			<div className="sm:flex sm:flex-1 sm:items-center sm:justify-between">
				<p className="text-sm text-gray-700">
					Showing{" "}
					<span className="font-medium">{(pageIndex - 1) * pageSize + 1}</span>{" "}
					to{" "}
					<span className="font-medium">
						{Math.min(pageIndex * pageSize, totalResults)}
					</span>{" "}
					of <span className="font-medium">{totalResults}</span> results
				</p>

				<nav
					className="isolate inline-flex -space-x-px rounded-md shadow-xs"
					aria-label="Pagination"
				>
					<button
						type="button"
						onClick={() => setPageIndex(1)}
						disabled={pageIndex === 1}
						className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20"
					>
						<span className="sr-only">First</span>
						<svg
							className="h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								fillRule="evenodd"
								d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
								clipRule="evenodd"
							/>
						</svg>
					</button>

					{Array.from({ length: endPage - startPage }).map((_, idx) => (
						<button
							type="button"
							key={idx}
							onClick={() => setPageIndex(startPage + idx + 1)}
							className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
								pageIndex === startPage + idx + 1
									? "z-10 bg-primary text-white"
									: "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
							}`}
						>
							{startPage + idx + 1}
						</button>
					))}

					<button
						type="button"
						onClick={() => setPageIndex(totalPages)}
						disabled={pageIndex === totalPages}
						className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20"
					>
						<span className="sr-only">Last</span>
						<svg
							className="h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								fillRule="evenodd"
								d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
								clipRule="evenodd"
							/>
						</svg>
					</button>
				</nav>
			</div>
		</div>
	);
}

export default Pagination;
