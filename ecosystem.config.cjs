/** PM2: build antes — `npm run build` — depois `pm2 start ecosystem.config.cjs` */
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
