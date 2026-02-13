import Swal from "sweetalert2";

const toastBase = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2600,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export const swal = {
  success: (title: string, text?: string) =>
    Swal.fire({
      icon: "success",
      title,
      text,
      confirmButtonText: "Tamam",
      confirmButtonColor: "#1976d2",
    }),

  error: (title: string, text?: string) =>
    Swal.fire({
      icon: "error",
      title,
      text,
      confirmButtonText: "Tamam",
      confirmButtonColor: "#d32f2f",
    }),

  confirm: async (title: string, text?: string) => {
    const res = await Swal.fire({
      icon: "warning",
      title,
      text,
      showCancelButton: true,
      confirmButtonText: "Evet",
      cancelButtonText: "Vazgeç",
      confirmButtonColor: "#1976d2",
      cancelButtonColor: "#9e9e9e",
      reverseButtons: true,
    });

    return res.isConfirmed;
  },

  toastInfo: (title: string, text?: string) =>
    toastBase.fire({
      icon: "info",
      title,
      text,
    }),

  toastSuccess: (title: string, text?: string) =>
    toastBase.fire({
      icon: "success",
      title,
      text,
    }),

  toastWarning: (title: string, text?: string) =>
    toastBase.fire({
      icon: "warning",
      title,
      text,
    }),

  toastError: (title: string, text?: string) =>
    toastBase.fire({
      icon: "error",
      title,
      text,
    }),
};
