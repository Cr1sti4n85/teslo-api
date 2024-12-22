//este necesita la request, el filename y una callback
export const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: Function,
) => {
  if (!file) return cb(new Error('No file found'), false);

  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};
