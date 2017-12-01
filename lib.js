class Lib {

  measureText(font, text) {
    var x = 0
    for (var i = 0; i < text.length; i++) {
      if (font.chars[text[i]]) {
        x += font.chars[text[i]].xoffset
          + (font.kernings[text[i]] && font.kernings[text[i]][text[i + 1]] ? font.kernings[text[i]][text[i + 1]] : 0)
          + (font.chars[text[i]].xadvance || 0)
      }
    }
    return x
  }

}

module.exports = new Lib();
