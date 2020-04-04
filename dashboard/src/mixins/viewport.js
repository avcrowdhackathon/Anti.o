export default {
  computed: {
    viewport() {
      const div = document.createElement("div");

      div.style.cssText = "position: fixed;top: 0;left: 0;bottom: 0;right: 0;";
      document.documentElement.insertBefore(
        div,
        document.documentElement.firstChild
      );

      const dims = {
        width: div.offsetWidth,
        height: div.offsetHeight
      };
      document.documentElement.removeChild(div);

      return dims;
    }
  }
}