const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,

  devServer: {
    host: "192.168.10.72",
    port: "8080",
    open: true
  }
})
