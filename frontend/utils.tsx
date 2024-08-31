import { ToastPosition } from "react-toastify";

export function setToastParam(autoClose: number | false | undefined, position: ToastPosition | undefined){
    return {
        position,
        autoClose,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      };
}