const parseValidationError = (body) => {
    try {
        const errorMessage = body.message.split('validation failed:')[1];
        const errorType = body.name;
        const errorDescription = body._message;

        return {
            type: errorType,
            description: errorDescription,
            error: errorMessage
        }
    } catch(error) {
        return body
    }
}

export {
    parseValidationError
}