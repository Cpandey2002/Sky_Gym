// SweetAlert.js
import Swal from "sweetalert2";

const SweetAlert = {
  success: (msg = "Success!") => {
    Swal.fire({
      icon: "success",
      title: "Success",
      text: msg,
      timer: 2000,
      showConfirmButton: true,
    });
  },

  error: (msg = "Something went wrong!") => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: msg,
      confirmButtonColor: "#d33",
    });
  },

  warning: (msg = "Are you sure?") => {
    Swal.fire({
      icon: "warning",
      title: "Warning",
      text: msg,
    });
  },

  info: (msg = "Information") => {
    Swal.fire({
      icon: "info",
      title: "Info",
      text: msg,
    });
  },

  confirm: async (msg = "Do you want to continue?") => {
    return await Swal.fire({
      title: "Confirm",
      text: msg,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });
  }
};

export default SweetAlert;
