# TODO List for Frontend Modifications

## Step 1: Modify UploadTemplatePage.tsx
- Change dropzone to accept JPG, PNG, SVG, WEBP formats
- Set max files to 10
- Store uploaded images as data URLs in state
- Display image previews
- Remove PDF processing logic
- Update onNext to pass images array instead of pdfPages
- Update UI text to reflect image upload

## Step 2: Modify NamePlacementEditor.tsx
- Change props to accept images array instead of pdfPages
- Remove mock pages, use passed images
- Add per-image checkbox "Add name to this image"
- When checked, display transparent SVG <text> overlay for name
- Make SVG text draggable
- Add controls: font size slider, color picker, bold, italic, underline, lock/unlock
- Update PageConfig interface to include new properties (bold, italic, underline, etc.)
- Ensure Gujarati text renders correctly in SVG
- Save only frontend layout data per image
- Update UI to show images with overlays

## Step 3: Test and Verify ✅
- Ensure UploadExcelPage.tsx remains unchanged ✅
- Verify image uploads work (would require running the app)
- Verify name placement with SVG overlays (would require running the app)
- Check Gujarati rendering (would require running the app)
- Confirm no PDFs, ZIPs, or backend code added ✅
