# Image Testing Playbook (from integration playbook)

## Rules
- Always use base64-encoded images.
- Accepted formats: JPEG, PNG, WEBP only.
- Do not use SVG, BMP, HEIC or other formats.
- Do not upload blank/solid-color/uniform-variance images. Every image must contain real visual features (objects, edges, textures, shadows).
- If the image is not PNG/JPEG/WEBP, transcode it to PNG or JPEG before upload.
- After transformations, re-detect and update the MIME type.
- If animated (GIF, APNG, WEBP animation), extract the first frame only.
- Resize large images to reasonable bounds.
