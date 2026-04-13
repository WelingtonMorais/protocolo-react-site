/** PM2: `npm run build` antes. Preview na porta 8080 (nginx protocolocondo → location /). */
module.exports = {
  apps: [
    {
      name: "protocolo-react-site",
      cwd: __dirname,
      script: "npm",
      args: "run preview:prod",
      interpreter: "none",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
