const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API da Comunidade de Tags',
      version: '1.0.0',
      description: 'Documentação da API para gerenciar usuários, gostos e mensagens',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./routes/*.js'], 
};

export default swaggerOptions;
