import * as swaggerJsDoc from 'swagger-jsdoc';
import config from "../environments";
const swaggerOptions = {
    apis: [config.SWAGGER_API_URI],
    openapi: "3.0.0",
    swaggerDefinition: {
        info: {
            swagger:"2.0",
            title: "Salon API",
            description: "Salon API Documentation",
            version: "1.0.0",
        }
    },
}
const swaggerDocs = swaggerJsDoc(swaggerOptions);

export {
    swaggerDocs
}