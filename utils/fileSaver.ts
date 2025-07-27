export const generateSessionFilename = (): string => {
  return `ConvoCraft_Session_${new Date().toISOString().slice(0, 10)}.txt`;
};

export const saveTextToFile = async (
  content: string,
  suggestedName: string,
  mimeType: string = 'text/plain;charset=utf-8'
) => {
  const blob = new Blob([content], { type: mimeType });

  try {
    if (!window.showSaveFilePicker) {
      throw new Error('File System Access API not supported.');
    }
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: [
        {
          description: 'Text Files',
          accept: { 'text/plain': ['.txt'] },
        },
      ],
    });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
  } catch (err) {
    // Fallback for browsers that do not support the File System Access API or if the user cancels
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = suggestedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}; 