const selectElement = document
  .getElementById("form")
  .addEventListener("change", submitform);

function submitform() {
  document.getElementById("form").submit();
}
