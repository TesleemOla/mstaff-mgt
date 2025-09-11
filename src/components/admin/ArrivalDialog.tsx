import { Dispatch, SetStateAction } from "react";


const ArrivalDialog = ({arrivalStatus, setShowArrivalDialog}:
    {arrivalStatus: string | null, setShowArrivalDialog: Dispatch<SetStateAction<boolean>>}
) => {
  return (
    <div
      className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
      style={{ background: "rgba(0,0,0,0.2)" }}
    >
      <div
        className={
          "rounded-lg px-8 py-6 shadow-lg flex flex-col items-center justify-center animate-fade-in " +
          (arrivalStatus === "early"
            ? "bg-green-600"
            : "bg-red-100 border border-red-400")
        }
        style={{ minWidth: 300 }}
      >
        <span
          className={
            arrivalStatus === "early"
              ? "text-white text-lg font-semibold"
              : "text-red-700 text-lg font-semibold"
          }
        >
          {arrivalStatus === "early"
            ? "You arrived on time!"
            : "You arrived late!"}
        </span>
        <button
          className={
            (arrivalStatus === "early"
              ? "bg-white text-green-700"
              : "bg-red-700 text-white") +
            " mt-4 px-4 py-2 rounded font-medium hover:opacity-90 transition"
          }
          onClick={() => setShowArrivalDialog(false)}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default ArrivalDialog