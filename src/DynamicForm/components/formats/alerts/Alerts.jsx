import { InformationCircleIcon, XCircleIcon } from "@heroicons/react/20/solid";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { htmlMarkup } from "../../../../utils/html_markup";

function Error({ message }) {
    return (
        <div className="rounded-lg bg-red-50 border border-red-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <XCircleIcon aria-hidden="true" className="size-5 text-red-500 shrink-0" />
                <span className="text-sm font-medium text-red-900">{message}</span>
            </div>
        </div>
    );
}
function Warning({ message }) {
    return (
        <div className="rounded-lg bg-amber-50 border border-amber-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <ExclamationCircleIcon
                    aria-hidden="true"
                    className="size-5 text-amber-600 shrink-0"
                />
                <span className="text-sm font-medium text-amber-900">{message}</span>
            </div>
        </div>
    );
}

function Success({ message }) {
    return (
        <div className="rounded-lg bg-green-50 border border-green-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <CheckCircleIcon
                    aria-hidden="true"
                    className="size-5 text-green-600 shrink-0"
                />
                <span className="text-sm font-medium text-green-900">{message}</span>
            </div>
        </div>
    );
}

function Info({ message }) {
    return (
        <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <InformationCircleIcon
                    aria-hidden="true"
                    className="size-5 text-blue-600 shrink-0"
                />
                <span className="text-sm font-medium text-blue-900">{message}</span>
            </div>
        </div>
    );
}

export { Error, Success, Warning, Info };