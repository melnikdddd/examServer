export function generateUniqueCode() {
    const currentDate = new Date();
    const timestamp = currentDate.getTime();
    const randomPart = Math.floor(Math.random() * 1000000);
    const uniqueCode = (timestamp + randomPart) % 1000000;

    const formattedCode = uniqueCode.toString().padStart(6, '0');

    return formattedCode;
}


export const getImagesOptions = (file, imageOperation, imageFieldName) => {
    return {
        image: file || null,
        options: {
            operation: imageOperation || null,
            imageFieldName: imageFieldName,
        },
    }
}

