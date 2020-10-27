export const Utils = {
  debounce: function (func: Function, wait: number, immediate = false) {
    var timeout: ReturnType<typeof setTimeout>;
    return function () {
      var context = this,
        args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  },

  rotateCapitals: function (phrase: string): string {
    return phrase
      .split('')
      .map((x: string, index: number) =>
        index % 2 == 0 ? x.toLowerCase() : x.toUpperCase()
      )
      .join('');
  },
};
