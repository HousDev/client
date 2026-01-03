import Swal from "sweetalert2";

const MySwal = Swal.mixin({
  confirmButtonColor: "#d32f2f",
  cancelButtonColor: "#6b7280",
  buttonsStyling: true,
});

export default MySwal;
