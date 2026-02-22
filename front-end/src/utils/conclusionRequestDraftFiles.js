export const toDraftFileInfo = (filePath, fileType) => {
  if (!filePath) return null;
  const fileName = String(filePath).split('/').pop();
  if (!fileName) return null;
  return {
    fileType,
    fileName,
    canPreview: fileType !== 'additional',
  };
};

export const emptyDraftFiles = {
  thesis: null,
  resume: null,
  additional: null,
};

export const emptyDraftFilesToRemove = {
  thesis: false,
  resume: false,
  additional: false,
};
