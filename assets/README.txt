Icon Assets

The icon.svg file is the source icon for the application.

For Windows builds, you'll need to convert the SVG to:
- icon.png (256x256 or larger)
- icon.ico (Windows icon format)

You can use online tools or ImageMagick to convert:

  # Using ImageMagick (if installed)
  convert icon.svg -resize 256x256 icon.png
  convert icon.png icon.ico

Or use online converters:
- https://convertio.co/svg-ico/
- https://cloudconvert.com/svg-to-ico

The current SVG will work for development, but you'll need proper ICO files for distribution.
